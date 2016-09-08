var unirest = require('unirest'),
    log = require('winston'),
    Q = require('q');

module.exports.register = function(mmcConfig, token, id, name, nodes) {
    var clusterData = {
        id: id,
        name: name,
        nodes: {}
    };

    // -- for each node, there is some information we need to gather: firmware and ipv4
    nodes.forEach(function(node) {
        clusterData.nodes[node.name] = {
            name: node.name,
            role: 'unknown',
            firmware: mmcConfig.app.version,
            ipv4: node.address
        };
    });

    // -- make the call
    var defer = Q.defer();
    log.log('info', 'Making a call to ' + 'http://' + mmcConfig.hive.host + ':' + mmcConfig.hive.port + '/api/v1/cluster/' + id + '/dns');
    unirest.put('http://' + mmcConfig.hive.host + ':' + mmcConfig.hive.port + '/api/v1/cluster/' + id + '/dns')
        .headers({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'bearer ' + token
        })
        .send(clusterData)
        .end(function (response) {
            if (response.info || response.ok ) defer.resolve();
            else defer.reject(new Error(response.code + ' -> ' + JSON.stringify(response.body)));
        });

    return defer.promise;
};