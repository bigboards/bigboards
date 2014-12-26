var Q = require('q'),
    winston = require('winston'),
    fs = require('fs');

var TaskUtils = require('../../../../utils/task-utils'),
    FsUtils = require('../../../../utils/fs-utils');

module.exports = function(configuration, services) {
    return {
        code: 'stack_install',
        description: 'installing the tint on the hex',
        type: 'ansible',
        parameters: [
            {
                key: 'tint',
                description: 'The unique id of the tint',
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

            return services.hex.get().then(function(hex) {
                scope.hex = hex;

                var tintPath = '/opt/bb/tints.d/' + scope.tint.type + '/' + scope.tint.owner + '/' + scope.tint.id;

                return services.library.getTint(scope.tint.type, scope.tint.owner, scope.tint.id)
                    .then(function(ft) {
                        console.log("Update the tint state to 'installing'");
                        scope.tintMeta = ft;
                        scope.tintMeta['state'] = 'installing';
                        scope.tintMetaString = JSON.stringify(scope.tintMeta);

                        return scope;
                    })
                    .then(function(scope) {
                        console.log("Running the stack pre-install script");
                        return TaskUtils.runPlaybook('tints/stack_pre_install', scope);
                    })
                    .then(function() {
                        return TaskUtils.playbook({
                            playbook: 'install',
                            scope: scope,
                            hosts: '_hosts',
                            path: tintPath
                        });
                    })
                    .then(function() {
                        console.log("Running the stack post-install script using 'installed' as the outcome");

                        scope.tintMeta['state'] = 'installed';
                        scope.tintMetaString = JSON.stringify(scope.tintMeta);

                        return TaskUtils.runPlaybook('tints/stack_post_install', scope);

                    })
                    .fail(function() {
                        console.log("Running the stack post-install script using 'invalid' as the outcome");

                        scope.tintMeta['state'] = 'invalid';
                        scope.tintMetaString = JSON.stringify(scope.tintMeta);

                        return TaskUtils.runPlaybook('tints/stack_post_install', scope);
                    });
            });


        }
    };
};