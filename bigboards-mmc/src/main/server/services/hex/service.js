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

    self.serf.members().then(function(members) {
        self.nodeCache = members;
    });

    var serfMemberHandler = this.serf.stream('member-join,member-leave,member-update');
    serfMemberHandler.on('data', function(data) {
        if (!data || !data.data || !data.data.Members) return;

        //if (data.Event == 'member-join') {
        //    data.data.Members.forEach(function(member) {
        //        self.addNode(member);
        //    });
        //} else if (data.Event == 'member-leave') {
        //    data.data.Members.forEach(function(member) {
        //        self.removeNode(member);
        //    });
        //} else if (data.Event == 'member-update') {
        //    data.data.Members.forEach(function(member) {
        //        self.updateNode(member);
        //    });
        //}

        self.serf.members().then(function(members) {
            self.nodeCache = members;
        });
    });

    mkdirp.sync(this.settings.dir.tints + '/stack');
    mkdirp.sync(this.settings.dir.tints + '/dataset');
    mkdirp.sync(this.settings.dir.tints + '/tutor');
}

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
    return this.services.task.invoke(tint.type + '_uninstall', { tint: tint});
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