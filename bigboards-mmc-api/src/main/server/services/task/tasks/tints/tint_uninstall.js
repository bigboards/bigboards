var Q = require('q'),
    winston = require('winston');

var TaskUtils = require('../../../utils/task-utils');

module.exports = function(configuration) {
    return {
        code: 'tint_uninstall',
        description: 'removing the tint from the hex',
        type: 'ansible',
        parameters: [
            {
                key: 'tintId',
                description: 'The unique id of the tint',
                required: true
            },
            {
                key: 'tintType',
                description: 'The type of tint we are uninstalling. Can be stack, edu or data',
                required: true
            },
            {
                key: 'verbose',
                description: 'Used to print additional debug information',
                required: false
            }
        ],
        execute: function(scope) {
            var flow = [];

            var verbose = (scope.verbose && ((scope.verbose == 'yes') || (scope.verbose == 'true')));

            winston.log('info', 'determining the flow of functions to invoke');

            flow.push(TaskUtils.removeFile(
                '/opt/bb/tints.d/' + scope.tintType + '/' + scope.tintId,
                verbose,
                '/opt/bb/tints.d/' + scope.tintType
            ));
            winston.log('info', 'added the executor for removing the tint');

            if (scope.tintType == 'stack') {
                flow.push(TaskUtils.runPlaybook('lxc/lxc-destroy', scope));
                winston.log('info', 'added the executor for destroying the container');
            }

            return Q.all(flow);
        }
    };
};
