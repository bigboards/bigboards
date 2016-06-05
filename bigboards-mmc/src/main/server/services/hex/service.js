var Q = require('q'),
    ShortId = require('shortid'),
    fsu = require('../../utils/fs-utils'),
    tu = require('../../utils/tint-utils'),
    fs = require('fs'),
    log = require('winston'),
    Errors = require('../../errors'),
    jwt = require('jsonwebtoken'),
    https = require('https'),
    auth0 =  require('../../auth0'),
    unirest = require('unirest'),
    dnsManager = require('../../dns');

function HexService(mmcConfig, hexConfig, templater, services, serf) {
    this.mmcConfig = mmcConfig;
    this.hexConfig = hexConfig;
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

    fsu.mkdir(this.mmcConfig.dir.tints + '/stack');
    fsu.mkdir(this.mmcConfig.dir.tints + '/dataset');
    fsu.mkdir(this.mmcConfig.dir.tints + '/tutorial');
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

        // -- register the dns records for the nodes
        if (self.hexConfig.has('hive.token')) {
            return dnsManager
                .register(self.mmcConfig, self.hexConfig.get('hive.token'), self.hexConfig.get('id'), self.hexConfig.get('name'), newNodeList)
                .then(function () { return newNodeList; });
        } else {
            return Q(newNodeList)
        }
    });
};

HexService.prototype.get = function() {
    return Q(this.hexConfig.all());
};

HexService.prototype.powerdown = function() {
    return this.services.task.invoke('halt', { });
};

/*********************************************************************************************************************
 * LINK
 *********************************************************************************************************************/

HexService.prototype.pair = function() {
    var me = this;

    return me.getMasterNode().then(function(masterNode) {
        var data = {
            id: me.hexConfig.get('id'),
            name: me.hexConfig.get('name'),
            callback: 'http://' + masterNode.network.external.ip + ':' + me.mmcConfig.port + '/api/v1/hex/pair/callback',
            nodes: []
        };

        // -- also need the firmware
        me.nodeCache.forEach(function(node) {
            data.nodes.push({
                mac: node.network.external.mac,
                ipv4: node.network.external.ip,
                name: node.name,
                arch: node.arch
            });
        });

        // -- let the hive know we want to link all nodes in this hex
        var defer = Q.defer();
        unirest.put('http://' + me.mmcConfig.hive.host + ':' + me.mmcConfig.hive.port + '/api/v1/cluster/incubate')
            .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
            .send(data)
            .end(function (response) {
                if (response.info || response.ok ) {
                    me.hexConfig.set([{key: 'pair.code', value: response.body.pair_code}]);

                    defer.resolve({code: response.body.pair_code});
                }
                else defer.reject(new Error(response.code + ' -> ' + JSON.stringify(response.body)));
            });

        return defer.promise;
    });
};

/**
 * Handle the pairing response.
 *  Once the pairing is completed on the hive, it will send a response back to the device containing
 *  the token to be used when talking to the hive in name of the user.
 *
 * @param token the token used to talk to the hive
 */
HexService.prototype.pairCallback = function(token) {
    var self = this;

    var hiveToken = jwt.decode(token);

    // -- save the profile to the local storage. Also save the hive token
    self.hexConfig.set([
        { key: 'hive.token', value: token },
        { key: 'hive.user.id', value: hiveToken.hive_id },
        { key: 'hive.user.name', value: hiveToken.name },
        { key: 'hive.user.email', value: hiveToken.email }
    ]);

    self.hexConfig.remove(['pair.code']);

    return Q();
};

HexService.prototype.unpair = function() {
    var self = this;

    var token = this.hexConfig.get('hive.token');
    if (! token) return Q();

    self.hexConfig.remove(['hive.token', 'hive.user.id', 'hive.user.name', 'hive.user.email', 'hive.user.picture']);

    return Q();
};

/*********************************************************************************************************************
 * NODES
 *********************************************************************************************************************/
HexService.prototype.listNodes = function() {
    return Q(this.nodeCache);
};

HexService.prototype.getMasterNode = function() {
    var defer = Q.defer();

    var masterNode = null;
    this.nodeCache.forEach(function(node) {
        if (node.role == 'master') masterNode = node;
    });

    if (masterNode) defer.resolve(masterNode);
    else defer.reject(new Error('No masternode found'));

    return defer.promise;
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
    var metafile = this.mmcConfig.dir.tints + '/meta.json';

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
    var metafile = self.mmcConfig.dir.tints + '/meta.json';

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

    var id = tu.toTintId(tint.type, tint.owner, tint.slug);

    return this.listTints().then(function(installedTints) {
        return self.services.task.current().then(function(currentTask) {
            if (currentTask) {
                throw new Errors.TaskAlreadyStartedError('An task is already running. Wait for it to complete before installing the tint');
            } else {
                for (var param in installedTints) {
                    if (!installedTints.hasOwnProperty(param)) continue;

                    // -- ignore the same tint if it is already installed. That would allow us to reinstall it.
                    if (param == id) continue;

                    // -- ignore if the tint to install is not a stack. Only stacks can be installed one at the time
                    if (tint.type != 'stack') continue;

                    // -- ignore stacks
                    if (installedTints[param].type != 'stack') continue;

                    throw new Errors.TintInstallationError('A stack tint has already been installed. Remove it first before trying to install a new one.');
                }

                return self.services.task.invoke(tint.type + '_install', { tint: tint });
            }
        });
    });
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