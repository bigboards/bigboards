var swig = require('swig'),
    Q = require('q');

function Templater(configuration, services) {
    this.configuration = configuration;
    this.services = services;
}

Templater.prototype.template = function(file) {
    var deferrer = Q.defer();

    try {
        var template = swig.compileFile(file);

        var scope = {};

        scope.hex = {
            id: this.configuration.id,
            name: this.configuration.name
        };

        scope.nodes = {};
        this.services.nodes.nodes().then(function (nodes) {
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

            deferrer.resolve(template(scope));
        }).fail(function(error) {
            deferrer.reject(error);
        });
    } catch (error) {
        deferrer.reject(error);
    }

    return deferrer.promise;
};

module.exports = Templater;
