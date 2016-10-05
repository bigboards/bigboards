var Q = require('q'),
    ShortId = require('shortid'),
    fsu = require('../../utils/fs-utils'),
    fss = require('../../utils/fs-utils-sync'),
    tu = require('../../utils/tint-utils'),
    fs = require('fs'),
    log = require('winston'),
    Errors = require('../../errors'),
    jwt = require('jsonwebtoken'),
    https = require('https'),
    auth0 =  require('../../auth0'),
    unirest = require('unirest'),
    dnsManager = require('../../dns');

var log4js = require('log4js');
var logger = log4js.getLogger('hex.service');

function HexService(mmcConfig, hexConfig, templater, services, consul) {
    this.mmcConfig = mmcConfig;
    this.hexConfig = hexConfig;
    this.templater = templater;
    this.services = services;
    this.consul = consul;

    fsu.mkdir(this.mmcConfig.dir.tints + '/stack');
    fsu.mkdir(this.mmcConfig.dir.tints + '/dataset');
    fsu.mkdir(this.mmcConfig.dir.tints + '/tutorial');
}

HexService.prototype.get = function() {
    return Q(this.hexConfig.all());
};

HexService.prototype.powerdown = function() {
    return this.services.task.invoke('halt', { });
};

/*********************************************************************************************************************
 * NODES
 *********************************************************************************************************************/
HexService.prototype.listNodes = function() {
    return this.consul.catalog.node.list().then(function(members) {
        return members.map(function(member) {
            return {
                name: member.Node,
                address: member.Address,
                network: member.TaggedAddresses
            };
        });
    });
};

HexService.prototype.getMasterNode = function() {
    return this.consul.status.leader()
        .then(function(data) {
            return data.data.split(':')[0];
        });
};

/*********************************************************************************************************************
 * SETTINGS - PROXY
 *********************************************************************************************************************/
HexService.prototype.setProxy = function(proxies) {
    // -- todo: to be implemented by calling the ansible playbook
};

HexService.prototype.removeProxy = function() {
    // -- todo: to be implemented by calling the ansible playbook
};

/*********************************************************************************************************************
 * TINTS
 *********************************************************************************************************************/
HexService.prototype.listTints = function() {
    var self = this;

    return this.consul.kv.get({key: 'tints/', recurse: true})
        .then(function(tints) {
            return tints.map(function(tint) {
                if (tint.stack.views) {
                    tint.stack.views.map(function(view) {
                        view.url = processUrl(view.url);
                    });
                }

                return tint;
            });
        });
};

HexService.prototype.getTint = function(type, owner, slug) {
    var self = this;

    return this.consul.kv.get('tints/' + owner + '/' + slug).then(function(tint) {
        if (tint.stack.views) {
            tint.stack.views.map(function(view) {
                view.url = processUrl(view.url);
            });
        }

        return tint;
    });
};

HexService.prototype.getTintResource = function(type, owner, tint, resource) {
    var resourcePath = this.mmcConfig.dir.tints + '/' + type + '/' + owner + '/' + tint + '/' + resource;
    return fsu.exists(resourcePath).then(function(exists) {
        if (exists) {
            return fsu.readFile(resourcePath);
        } else {
            return Q.fail('No such file or directory: ' + resourcePath);
        }
    })
};

HexService.prototype.removeTint = function(type, owner, slug) {
    var self = this;

    return this.getTint(type, owner, slug).then(function(tint) {
        return self.services.task.invoke(type + '_uninstall', { tint: tint });
    });
};

HexService.prototype.installTint = function(tint) {
    var self = this;

    if (! fss.exists(self.mmcConfig.dir.tints + '/' + tint.type + '/' + tint.owner + '/' + tint.slug + '/meta.json')) {
        if (tint.type == "stack" && fss.readDir(self.mmcConfig.dir.tints + "/stack/").length > 0)
            return Q.reject(new Errors.TintInstallationError('A stack tint has already been installed. Remove it first before trying to install a new one.'));
    }

    return self.services.task.current().then(function(currentTask) {
        if (currentTask) throw new Errors.TaskAlreadyStartedError('An task is already running. Wait for it to complete before installing the tint');

        return self.services.task.invoke(tint.type + '_install', { tint: tint });
    });
};

module.exports = HexService;

function processUrl(url) {
    // -- todo: implement this
    return url;
}