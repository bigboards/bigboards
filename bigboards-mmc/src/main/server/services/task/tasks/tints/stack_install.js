var Q = require('q'),
    winston = require('winston'),
    fs = require('fs'),
    deepcopy = require('deepcopy');

var TaskUtils = require('../../../../utils/task-utils'),
    FsUtils = require('../../../../utils/fs-utils'),
    TintUtils = require('../../../../utils/tint-utils');

module.exports = function(configuration, services) {
    return {
        code: 'stack_install',
        description: 'installing the tint on the hex',
        type: 'ansible',
        parameters: [
            {
                key: 'tint',
                description: 'the tint descriptor',
                required: true
            },
            {
                key: 'verbose',
                description: 'Used to print additional debug information',
                required: false
            }
        ],
        execute: function(env, scope) {
            return services.hex.get().then(function(hex) {
                scope.hex = hex;
                scope.docker_registry = env.settings.docker.registry;

                var tintPath = env.settings.dir.tints + '/' + scope.tint.type + '/' + scope.tint.owner + '/' + scope.tint.slug;
                scope.tint.path = tintPath;
                scope.tint.id = TintUtils.toTintId(scope.tint.type, scope.tint.owner, scope.tint.slug);
                var metadata = deepcopy(scope.tint);

                // -- clean the views of the nodes variable
                for (var viewIdx in scope.tint.stack.views) {
                    delete scope.tint.stack.views[viewIdx].url;
                }

                winston.info('Installing tint ' + scope.tint.type + '/' + scope.tint.owner + '/' + scope.tint.slug);

                return TintUtils
                    .setTintState(env.settings.dir.tints, metadata, 'installing')
                    .then(function() {
                        winston.info('Generating the scripts needed to install the tint');
                        return TaskUtils
                            .playbook(env, 'tints/stack_pre_install', scope)
                            .then(function() {
                                return TintUtils.setTintState(env.settings.dir.tints, metadata, 'generated');
                            });
                    })
                    .then(function() {
                        var tintEnv = {
                            workdir: tintPath + '/work',
                            hostFile: '_hosts',
                            verbose: env.verbose
                        };

                        winston.info('Installing the tint');
                        return TaskUtils.playbook(tintEnv, '_install', scope);
                    })
                    .then(function() {
                        return TintUtils.setTintState(env.settings.dir.tints, metadata, 'installed');
                    });
            });
        }
    };
};