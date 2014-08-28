var TaskUtils = require('../../../utils/task-utils');

module.exports = {
    code: 'update',
    description: 'updating the firmware on the hex',
    type: 'ansible',
    parameters: [
        {
            key: 'verbose',
            description: 'Used to print additional debug information',
            required: false
        }
    ],
    execute: function(scope) {
        var verbose = (scope.verbose && ((scope.verbose == 'yes') || (scope.verbose == 'true')));

        return TaskUtils.runShellCommand(
            './update.sh',
            verbose,
            '/opt/bb/runtimes/bigboards-updater'
        );
    }
};
