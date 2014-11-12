var Q = require('q'),
    winston = require('winston'),
    fs = require('fs');

var TaskUtils = require('../../../utils/task-utils');

module.exports = function(configuration) {
    return {
        code: 'tint_install',
        description: 'installing the tint on the hex',
        type: 'ansible',
        parameters: [
            {
                key: 'tintId',
                description: 'The unique id of the tint',
                required: true
            },
            {
                key: 'tintUri',
                description: 'The Uri pointing to the tint git repository.',
                required: true
            },
            {
                key: 'tintType',
                description: 'The type of tint we are installing. Can be stack, edu or data',
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
            scope.tintUri = scope.tintUri.replace(/%username%/g, scope.username);
            scope.tintUri = scope.tintUri.replace(/%password%/g, scope.password);

            if (scope.tintType == 'stack') {
                return TaskUtils
                    .runPlaybook('tints/tint_install', scope)
                    .then(function() {
                        return TaskUtils.runPlaybook('install', scope, '/opt/bb/tints.d/' + scope.tintType + '/' + scope.tintId);
                    });
            } else {
                return TaskUtils
                    .runPlaybook('install', scope, '/opt/bb/tints.d/' + scope.tintType + '/' + scope.tintId);
            }
        }
    };
};