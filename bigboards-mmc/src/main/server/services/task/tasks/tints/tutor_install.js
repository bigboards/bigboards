var Q = require('q'),
    winston = require('winston'),
    fs = require('fs'),
    Providers = require('../../../library/providers');

var TaskUtils = require('../../../../utils/task-utils'),
    FsUtils = require('../../../../utils/fs-utils');

module.exports = function(configuration, services) {
    return {
        code: 'tutor_install',
        description: 'installing the tutor tint on the hex',
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

                var tintPath = env.settings.dir.tints + '/' + scope.tint.type + '/' + scope.tint.owner + '/' + scope.tint.slug;
                scope.tint.path = tintPath;

                winston.info('Installing tint ' + scope.tint.type + '/' + scope.tint.owner + '/' + scope.tint.slug);

                return services.library.getTint(scope.tint.type, scope.tint.owner, scope.tint.slug)
                    .then(function(ft) {
                        console.log("Update the tint state to 'installing'");
                        scope.tintMeta = ft;
                        scope.tintMeta['state'] = 'partial';

                        return scope;
                    })
                    .then(function(scope) {
                        console.log("Running the tutor install script");
                        return TaskUtils.playbook(env, 'tints/tutor_install', scope);
                    })
                    .then(function() {
                        console.log("Changing the tint state to 'installed'");

                        scope.tintMeta['state'] = 'installed';

                        return FsUtils.jsonFile(tintPath + '/meta.json', scope.tintMeta);
                    })
                    .fail(function(error) {
                        console.log("Running the tint post-install script using 'partial' as the outcome because of :\n");
                        console.log(error.message);

                        scope.tintMeta['state'] = 'partial';

                        return FsUtils.jsonFile(tintPath + '/meta.json', scope.tintMeta);
                    });
            });


        }
    };
};