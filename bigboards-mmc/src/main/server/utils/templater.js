var swig = require('swig'),
    Q = require('q');

function Templater(configuration) {
    this.configuration = configuration;
}

Templater.prototype.templateString = function(string, nodes) {
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

    return swig.render(string, { locals: scope });
};

Templater.prototype.template = function(file, nodes) {
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

    return swig.renderFile(file, { locals: scope });
};

module.exports = Templater;
