var Q = require('q'),
    uuid = require('node-uuid'),
    Errors = require('../../errors'),
    yaml = require("js-yaml"),
    mkdirp = require('mkdirp'),
    fsu = require('../../utils/fs-utils'),
    fs = require('fs'),
    log = require('winston');

function HexService(settings, configuration, templater, services, serf) {
    this.settings = settings;
    this.configuration = configuration;
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

    mkdirp.sync(this.settings.dir.tints + '/stack');
    mkdirp.sync(this.settings.dir.tints + '/dataset');
    mkdirp.sync(this.settings.dir.tints + '/tutor');
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
    return this.configuration.get().then(function(data) {
        if (!data) {
            return { id: 'unknown', name: 'unknown' }
        } else return {
            id: data.hex.id,
            name: data.hex.name
        };
    });
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

    var promises = [];

    var types = fs.readdirSync(self.settings.dir.tints);
    for (var i in types) {
        var typeStat = fs.statSync(self.settings.dir.tints + '/' + types[i]);
        if (typeStat.isDirectory()) {
            var owners = fs.readdirSync(self.settings.dir.tints + '/' + types[i]);

            for (var j in owners) {
                var files = fs.readdirSync(self.settings.dir.tints + '/' + types[i] + '/' + owners[j]);

                for (var k in files) {
                    promises.push(parseManifest(self, self.templater, self.settings.dir.tints, types[i], owners[j], files[k]));
                }
            }
        }
    }

    return Q.allSettled(promises).then(function (responses) {
        var result = [];

        for (var i in responses) {
            if (responses[i] != null) {
                result.push(responses[i].value);
            }
        }

        return result;
    });
};

HexService.prototype.getTint = function(type, owner, tint) {
    return parseManifest(this, this.templater, this.settings.dir.tints, type, owner, tint);
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

function parseManifest(hexService, templater, tintRoot, type, owner, tintId) {
    var tintDir = tintRoot + '/' + type + '/' + owner + '/' + tintId;
    var self = this;

    return fsu.readYamlFile(tintDir + '/tint.yml').then(function(content) {
        return hexService.listNodes().then(function(nodes) {
            return templater.createScope(nodes).then(function(scope) {
                return templater.templateWithScope(content, scope);
            });
        }).fail(function(error) {
            console.log('unable to parse the tint meta file: ' + error.message);
        });
    });
}

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