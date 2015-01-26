var Q = require('q'),
    winston = require('winston');

var TaskUtils = require('../../../../utils/task-utils');

module.exports = function(configuration, services) {
    return {
        code: 'stack_uninstall',
        description: 'removing the tint from the hex',
        type: 'ansible',
        parameters: [
            {
                key: 'tint',
                description: 'The tint',
                required: true
            },
            {
                key: 'verbose',
                description: 'Used to print additional debug information',
                required: false
            }
        ],
        execute: function(scope) {
             // -- TODO: check if the uninstall script exists

            return services.hex.get()
                .then(function(hex) {
                    scope.hex = hex;
                })
                .then(function() {
                    return services.library.getTint(scope.tint.type, scope.tint.owner, scope.tint.id);
                })
                .then(function(ft) {
                    console.log("Update the tint state to 'partial'");
                    scope.tintMeta = ft;
                    scope.tintMeta['state'] = 'partial';
                    scope.tintMetaString = JSON.stringify(scope.tintMeta);

                    return scope;
                })
                .then(function() {
                    TaskUtils.playbook({
                            playbook: '_uninstall',
                            scope: scope,
                            hosts: '_hosts',
                            path: '/opt/bb/tints.d/' + scope.tint.type + '/' + scope.tint.owner + '/' + scope.tint.id + '/work'
                        })
                })
                .then(function() {
                    TaskUtils.removeFile('/opt/bb/tints.d/' + scope.tint.type + '/' + scope.tint.owner + '/' + scope.tint.id);
                });

        }
    };
};
