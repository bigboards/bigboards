var fs = require('fs');
var should = require('should');
var tmp = require('tmp');

var Templater = require('../../../main/server/utils/templater');

exports.testTemplateString = function(test) {
    var templater = new Templater({
        id: 'test-id',
        name: 'test-name'
    });

    var output = templater.templateString(
        '{{ hex.name }}',
        [{
            "name": "alice-n1",
            "network": {
                "externalIp": "192.168.2.163",
                "internalIp": "172.20.40.1"
            },
            "container": {
                "name": "alice-v1",
                "status": "RUNNING",
                "internalIp": "172.20.40.11",
                "externalIp": "192.168.2.158"
            },
            "tags": {
                "hex-id": "cced64d1-1b52-471c-92fe-cca09d8c53e6",
                "hex-name": "alice",
                "role": "master"
            },
            "status": "alive"
        }]);

    test.equal(output, 'test-name');
};
