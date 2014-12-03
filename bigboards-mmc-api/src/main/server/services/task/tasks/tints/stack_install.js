var Q = require('q'),
    winston = require('winston'),
    fs = require('fs');

var TaskUtils = require('../../../../utils/task-utils');

module.exports = function(configuration) {
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
                key: 'hostMapping',
                description: 'The mapping indicating which host take which roles',
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

            return TaskUtils
                .runPlaybook('tints/stack_install', scope)
                .then(function() {
                    return TaskUtils.playbook({
                        playbook: 'install',
                        scope: scope,
                        hosts: 'hosts',
                        path: '/opt/bb/tints.d/' + scope.tint.type + '/' + scope.tint.owner + '/' + scope.tint.id
                    });
                });
        }
    };
};