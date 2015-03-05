var swig = require('swig'),
    Q = require('q');

function Templater(configuration) {
    this.configuration = configuration;
}

Templater.prototype.createScope = function(nodes) {
    return this.configuration.get().then(function(data) {
        var scope = {};

        scope.hex = {
            id: (data) ? data.hex.id : 'unknown',
            name: (data) ? data.hex.name : 'unknown'
        };

        scope.nodes = {};
        nodes.forEach(function (node) {
            scope.nodes[node.Name] = {
                ip: (node.Tags) ? node.Tags['network.eth0:0.ip'] : 'none',
                status: node.Status
            };
        });

        return scope;
    });
};

Templater.prototype.templateWithScope = function(obj, scope) {
    var toClass = {}.toString;

    if (toClass.call(obj) == '[object Array]') {
        return this.templateArrayWithScope(obj, scope);
    } else if (toClass.call(obj) == '[object Object]') {
        return this.templateObjectWithScope(obj, scope);
    } else if (toClass.call(obj) == '[object String]') {
        return this.templateStringWithScope(obj, scope);
    } else {
        return this.templateStringWithScope(JSON.stringify(obj), scope);
    }
};

Templater.prototype.templateArrayWithScope = function(array, scope) {
    var result = [];

    for (var idx in array) {
        result.push(this.templateWithScope(array[idx], scope));
    }

    return result;
};

Templater.prototype.templateObjectWithScope = function(object, scope) {
    var result = {};

    for (var idx in object) {
        if (! object.hasOwnProperty(idx)) continue;
        result[idx] = this.templateWithScope(object[idx], scope);
    }

    return result;
};

Templater.prototype.templateStringWithScope = function(string, scope) {
    return swig.render(string, { locals: scope });
};

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
