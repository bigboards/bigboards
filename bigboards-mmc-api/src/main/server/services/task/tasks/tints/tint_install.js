var Q = require('q'),
    winston = require('winston'),
    yaml = require("js-yaml"),
    fs = require('fs');

var TaskUtils = require('../../../utils/task-utils');

module.exports = function(configuration, services) {
    return {
        code: 'tint_install',
        description: 'installing the tint on the hex',
        type: 'ansible',
        parameters: [
            {
                key: 'tint',
                description: 'The tint',
                required: true
            },
            {
                key: 'username',
                description: 'The username which has access to the tint',
                required: false
            },
            {
                key: 'password',
                description: 'The password of the user having access to the tint',
                required: false
            },
            {
                key: 'verbose',
                description: 'Used to print additional debug information',
                required: false
            }
        ],
        execute: function(scope) {
            // -- replace the username and password in the tint uri
            scope.tint.uri = scope.tint.uri.replace(/%username%/g, scope.username);
            scope.tint.uri = scope.tint.uri.replace(/%password%/g, scope.password);

            // -- generate the playbook out of the tint definition
            services.hex
                .getTint(scope.tint.type, scope.tint.owner, scope.tint.tint)
                .then(function(t) {
                    var defer = Q.defer();

                    fs.writeFile('/opt/bb/tints.d/' + scope.tintType + '/' + scope.tintId + '/install.yml', yaml.safeDump(t.play), function(err) {
                        if (err) defer.reject(err);
                        else {
                            defer.resolve(
                                TaskUtils.runPlaybook('install', scope, '/opt/bb/tints.d/' + scope.tintType + '/' + scope.tintId)
                            );
                        }
                    });

                    return defer.promise;
                });
        }
    };
};