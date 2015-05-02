var Q = require('q'),
    fsu = require('../../utils/fs-utils'),
    tu = require('../../utils/tint-utils'),
    fs = require('fs'),
    log = require('winston');

function HexService(settings, config, templater, services, serf) {
    this.settings = settings;
    this.config = config;
    this.templater = templater;
    this.services = services;
    this.serf = serf;
    this.nodeCache = [];

    var self = this;

    self._updateNodeList();

    var serfMemberHandler = this.serf.stream('member-join,member-leave,member-update');
    serfMemberHandler.on('data', function(data) {
        if (!data || !data.data || !data.data.Members) return;

        self._updateNodeList();
    });

    fsu.mkdir(this.settings.dir.tints + '/stack');
    fsu.mkdir(this.settings.dir.tints + '/dataset');
    fsu.mkdir(this.settings.dir.tints + '/tutorial');
}

HexService.prototype._updateNodeList = function() {
    var self = this;

    return self.serf.members().then(function(members) {
        var newNodeList = [];

        for ( var idx in members ) {
            var item = members[idx];

            var int_itf = item.Tags['network.internal'];
            var ext_itf = item.Tags['network.external'];

            newNodeList.push({
                name: item.Name,
                status: item.Status,
                role: item.Tags['role'],
                arch: item.Tags['arch'],
                hex_id: item.Tags['hex-id'],
                network: {
                    internal: {
                        itf: int_itf,
                        ip: item.Tags['network.' + int_itf + '.ip'],
                        mac: item.Tags['network.' + int_itf + '.mac'],
                        netmask: item.Tags['network.' + int_itf + '.netmask'],
                        broadcast: item.Tags['network.' + int_itf + '.broadcast']
                    },
                    external: {
                        itf: ext_itf,
                        ip: item.Tags['network.' + ext_itf + '.ip'],
                        mac: item.Tags['network.' + ext_itf + '.mac'],
                        netmask: item.Tags['network.' + ext_itf + '.netmask'],
                        broadcast: item.Tags['network.' + ext_itf + '.broadcast']
                    }
                }
            });
        }

        self.nodeCache = newNodeList;

        return newNodeList;
    });
};

HexService.prototype.get = function() {
    if (this.config) return Q({
        id: this.config.hex.id,
        name: this.config.hex.name,
        arch: this.config.hex.arch
    });
    else return Q({ id: 'unknown', name: 'unknown', arch: 'unknown' });
};

HexService.prototype.powerdown = function() {
    return this.services.task.invoke('halt', { });
};

/*********************************************************************************************************************
 * NODES
 *********************************************************************************************************************/
HexService.prototype.listNodes = function() {
    return Q(this.nodeCache);
};

HexService.prototype.addNode = function(node) {
    var idx = indexForNode(this.nodeCache, node);

    if (idx == -1) {
        this.nodeCache.push(node);
        log.info('Added node ' + node.Name);
    } else {
        this.updateNode(node);
        log.info('Updated node ' + node.Name);
    }
};

HexService.prototype.updateNode = function(node) {
    this.nodeCache[indexForNode(this.nodeCache, node)] = node;
    log.info('Updated node ' + node.Name);
};

HexService.prototype.removeNode = function(node) {
    delete this.nodeCache[indexForNode(this.nodeCache, node)];
    log.info('Removed node ' + node.Name);
};

/*********************************************************************************************************************
 * TINTS
 *********************************************************************************************************************/
HexService.prototype.listTints = function() {
    var self = this;
    var metafile = this.settings.dir.tints + '/meta.json';

    return fsu.exists(metafile).then(function(exists) {
        if (exists) {
            return fsu.readJsonFile(metafile).then(function(metadata) {
                return self.listNodes().then(function(nodes) {
                    var scope = self.templater.createScope(nodes);

                    return self.templater.templateWithScope(metadata, scope);
                });
            });
        } else {
            return {};
        }
    });
};

HexService.prototype.getTint = function(type, owner, slug) {
    var self = this;
    var metafile = self.settings.dir.tints + '/meta.json';

    return fsu.exists(metafile).then(function(exists) {
        if (exists) {
            return fsu.readJsonFile(metafile).then(function(metadata) {
                return self.listNodes().then(function(nodes) {
                    var scope = self.templater.createScope(nodes);

                    return self.templater.templateWithScope(metadata[tu.toTintId(type, owner, slug)], scope);
                });
            });
        } else {
            return {};
        }
    });
};

HexService.prototype.getTintResource = function(type, owner, tint, resource) {
    var resourcePath = this.settings.dir.tints + '/' + type + '/' + owner + '/' + tint + '/' + resource;
    return fsu.exists(resourcePath).then(function(exists) {
        if (exists) {
            return fsu.readFile(resourcePath);
        } else {
            return Q.fail('No such file or directory: ' + resourcePath);
        }
    })
};

HexService.prototype.removeTint = function(tint) {
    return this.services.task.invoke(tint.type + '_uninstall', { tint: tint });
};

HexService.prototype.installTint = function(tint) {
    return this.services.task.invoke(tint.type + '_install', { tint: tint });
};

function indexForNode(nodeList, node) {
    // -- discover the index of the node
    for (var idx in nodeList) {
        if (node.name == nodeList[idx].name) {
            return idx;
        }
    }

    return -1;
}

module.exports = HexService;