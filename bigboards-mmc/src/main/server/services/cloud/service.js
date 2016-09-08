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

function CloudService(mmcConfig, hexConfig, services, consul) {
    this.mmcConfig = mmcConfig;
    this.hexConfig = hexConfig;
    this.services = services;
    this.consul = consul;

    fsu.mkdir(this.mmcConfig.dir.tints + '/stack');
    fsu.mkdir(this.mmcConfig.dir.tints + '/dataset');
    fsu.mkdir(this.mmcConfig.dir.tints + '/tutorial');
}

CloudService.prototype.get = function() {
    return Q(this.hexConfig.all());
};

CloudService.prototype.sync = function() {
    // -- register the dns records for the nodes
    if (! this.hexConfig.has('hive.token')) return Q({status: 'not-linked'});

    var self = this;

    return this.listNodes().then(function(nodes) {
        return dnsManager
            .register(this.mmcConfig, self.hexConfig.get('hive.token'), self.hexConfig.get('id'), self.hexConfig.get('name'), nodes)
            .then(function () { return {status: 'ok'}; });
    })
};

CloudService.prototype.pair = function() {
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
                id: node.network.internal.mac.replace(/\:/g, '').toLowerCase(),
                mac: node.network.external.mac,
                ipv4: node.network.external.ip,
                name: node.name,
                arch: node.arch
            });
        });

        // -- let the hive know we want to link all nodes in this hex
        var defer = Q.defer();
        log.log('info', "Linking to " + 'http://' + me.mmcConfig.hive.host + ':' + me.mmcConfig.hive.port + '/api/v1/cluster/incubate');
        unirest.put('http://' + me.mmcConfig.hive.host + ':' + me.mmcConfig.hive.port + '/api/v1/cluster/incubate')
            .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
            .send(data)
            .end(function (response) {
                if (response.info || response.ok ) {

                    me.consul.kv.set("bigboards/cloud.json", {
                        "status": "pairing",
                        "code": response.body.pair_code
                    });

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
CloudService.prototype.pairCallback = function(token) {
    var cloudToken = jwt.decode(token);

    return this.consul.kv.set("bigboards/cloud.json", {
        "status": "paired",
        "token": token,
        "user": {
            "id": cloudToken.hive_id,
            "name": cloudToken.name,
            "email": cloudToken.email
        }
    });
};

CloudService.prototype.unpair = function() {
    return this.consul.kv.del("bigboards/cloud.json");
};

module.exports = CloudService;