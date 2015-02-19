var Q = require('q'),
    winston = require('winston'),
    fs = require('fs');
    jsesc = require('jsesc');

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
                scope.tint.path = tintPath;

                return services.library.getTint(scope.tint.type, scope.tint.owner, scope.tint.id)
                    .then(function(ft) {
                        console.log("Update the tint state to 'installing'");
                        scope.tintMeta = ft;
                        scope.tintMeta['state'] = 'partial';
                        scope.tintMetaString = jsesc(JSON.stringify(scope.tintMeta), {
                            'quotes': 'single',
                            'wrap': true
                        });

                        return scope;
                    })
                    .then(function(scope) {
                        console.log("Running the stack pre-install script");
                        return TaskUtils.runPlaybook('tints/stack_pre_install', scope);
                    })
                    .then(function() {
                        return TaskUtils.playbook({
                            playbook: '_install',
                            scope: scope,
                            hosts: '_hosts',
                            path: tintPath + '/work'
                        });
                    })
                    .then(function() {
                        console.log("Running the stack post-install script using 'installed' as the outcome");

                        scope.tintMeta['state'] = 'installed';
                        scope.tintMetaString = jsesc(JSON.stringify(scope.tintMeta), {
                            'quotes': 'single',
                            'wrap': true
                        });

                        return TaskUtils.runPlaybook('tints/stack_post_install', scope);
                    })
                    .fail(function() {
                        console.log("Running the stack post-install script using 'partial' as the outcome");

                        scope.tintMeta['state'] = 'partial';
                        scope.tintMetaString = jsesc(JSON.stringify(scope.tintMeta), {
                            'quotes': 'single',
                            'wrap': true
                        });

                        return TaskUtils.runPlaybook('tints/stack_post_install', scope);
                    });
            });


        }
    };
};