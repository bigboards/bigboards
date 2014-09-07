var swig = require('swig'),
    Q = require('q');

function Templater(configuration, services) {
    this.configuration = configuration;
    this.services = services;
}

Templater.prototype.template = function(file, nodes) {
    var deferrer = Q.defer();

    try {
        var scope = {};

        scope.hex = {
            id: this.configuration.id,
            name: this.configuration.name
        };

        scope.nodes = {};
        nodes.forEach(function (node) {
            scope.nodes[node.name] = {
                ip: node.network.externalIp,
                status: node.status
            };

            scope.nodes[node.container.name] = {
                ip: node.container.externalIp,
                status: node.container.status
            };
        });

        deferrer.resolve(swig.renderFile(file, scope));
    } catch (error) {
        deferrer.reject(error);
    }

    return deferrer.promise;
};

module.exports = Templater;
