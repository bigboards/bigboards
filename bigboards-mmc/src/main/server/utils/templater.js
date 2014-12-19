var swig = require('swig'),
    Q = require('q');

function Templater(configuration) {
    this.configuration = configuration;
}

Templater.prototype.templateString = function(string, nodes) {
    return this.configuration.get().then(function(data) {
        var scope = {};

        scope.hex = {
            id: data.hex.id,
            name: data.hex.name
        };

        scope.nodes = {};
        nodes.forEach(function (node) {
            scope.nodes[node.Name] = {
                ip: (node.Tags) ? node.Tags['network.eth0:0.ip'] : 'none',
                status: node.Status
            };
        });

        return swig.render(string, { locals: scope });
    });
};

Templater.prototype.template = function(file, nodes) {
    return this.configuration.get().then(function(data) {
        var scope = {};

        scope.hex = {
            id: data.hex.id,
            name: data.hex.name
        };

        scope.nodes = {};
        nodes.forEach(function (node) {
            scope.nodes[node.Name] = {
                ip: (node.Tags) ? node.Tags['network.eth0:0.ip'] : 'none',
                status: node.Status
            };
        });

        return swig.renderFile(file, scope);
    });

};

module.exports = Templater;
