var Q = require('q'),
    winston = require('winston');

var TaskUtils = require('../../../../utils/task-utils');

module.exports = function(configuration) {
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

            return TaskUtils.playbook({
                playbook: 'uninstall',
                scope: scope,
                hosts: 'hosts',
                path: '/opt/bb/tints.d/' + scope.tint.type + '/' + scope.tint.owner + '/' + scope.tint.id
            }).then(TaskUtils.removeFile(
                '/opt/bb/tints.d/' + scope.tint.type + '/' + scope.tint.owner + '/' + scope.tint.id
            ));
        }
    };
};
