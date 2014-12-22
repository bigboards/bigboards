var Q = require('q'),
    uuid = require('node-uuid'),
    Errors = require('../../errors'),
    yaml = require("js-yaml"),
    mkdirp = require('mkdirp'),
    fsu = require('../../utils/fs-utils'),
    fs = require('fs');

function HexService(settings, configuration, templater, services, serf) {
    this.settings = settings;
    this.configuration = configuration;
    this.templater = templater;
    this.services = services;
    this.serf = serf;
    this.nodeCache = [];

    var self = this;

    this.serf.members().then(function(members) {
        self.nodeCache = members;
    });

    var serfMemberHandler = this.serf.stream('member-join,member-leave,member-update');
    serfMemberHandler.on('data', function(data) {
        if (!data || !data.data || !data.data.Members) return;

        if (data.Event == 'member-join') {
            data.data.Members.forEach(function(member) {
                self.addNode(member);
            });
        } else if (data.Event == 'member-leave') {
            data.data.Members.forEach(function(member) {
                self.removeNode(member);
            });
        } else if (data.Event == 'member-update') {
            data.data.Members.forEach(function(member) {
                self.updateNode(member);
            });
        }
    });

    mkdirp.sync(this.settings.tints.rootDirectory + '/stack');
    mkdirp.sync(this.settings.tints.rootDirectory + '/dataset');
    mkdirp.sync(this.settings.tints.rootDirectory + '/tutor');
}

HexService.prototype.get = function() {
    return this.configuration.get().then(function(data) {
        return {
            id: data.hex.id,
            name: data.hex.name
        };
    });
};

/*********************************************************************************************************************
 * NODES
 *********************************************************************************************************************/
HexService.prototype.listNodes = function() {
    return Q(this.nodeCache);
};

HexService.prototype.addNode = function(node) {
    var idx = indexForNode(this.nodeCache, node);

    if (idx == -1) this.nodeCache.push(node);
    else this.updateNode(node);
};

HexService.prototype.updateNode = function(node) {
    this.nodeCache[indexForNode(this.nodeCache, node)] = node;
};

HexService.prototype.removeNode = function(node) {
    delete this.nodeCache[indexForNode(this.nodeCache, node)];
};

/*********************************************************************************************************************
 * TINTS
 *********************************************************************************************************************/
HexService.prototype.listTints = function(type) {
    var self = this;

    return fsu
        .readDir(this.settings.tints.rootDirectory + '/' + type)
        .then(function(owners) {
            var promises = [];

            for (var o in owners) {
                var files = fs.readdirSync(self.settings.tints.rootDirectory + '/' + type + '/' + owners[o]);

                for (var i in files) {
                    promises.push(parseManifest(self, self.templater, self.settings.tints.rootDirectory, type, owners[o], files[i]));
                }
            }

            return Q.allSettled(promises).then(function(responses) {
                var result = [];

                for (var i in responses) {
                    if (responses[i] != null) {
                        result.push(responses[i].value);
                    }
                }

                return result;
            });
        });
};

HexService.prototype.getTint = function(type, owner, tint) {
    return parseManifest(this, this.templater, this.settings.tints.rootDirectory, type, owner, tint);
};

HexService.prototype.removeTint = function(tint) {
    return this.services.task.invoke(tint.type + '_uninstall', { tint: tint});
};

HexService.prototype.installTint = function(tint) {
    return this.services.task.invoke(tint.type + '_install', { tint: tint });
};

function parseManifest(hexService, templater, tintRoot, type, owner, tintId) {
    var tintDir = tintRoot + '/' + type + '/' + owner + '/' + tintId;
    var self = this;

    return fsu.exists(tintDir + "/meta.json")
        .then(function(exists) {
            if (! exists) {
                return Q(null);
            }

            return hexService
                .listNodes()
                .then(function (nodes) {
                    return templater.template(tintDir + "/tint.yml", nodes);
                }).then(function (content) {
                    return yaml.safeLoad(content);
                }).then(function(data) {
                    return fsu
                        .readFile(tintDir + "/meta.json")
                        .then(function(content) {
                            var tintMeta = JSON.parse(content);

                            for (var idx in tintMeta) {
                                if (tintMeta.hasOwnProperty(idx)) {
                                    data[idx] = tintMeta[idx];
                                }
                            }

                            return data;
                        });

                }).then(function (tint) {
                    return fsu
                        .readFile(tintDir + "/mapping.yml")
                        .then(function(content) {
                            tint.mappings = yaml.safeLoad(content);

                            return tint;
                        });
                }).fail(function(error) {
                    console.log('ERROR: ' + error.message);
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