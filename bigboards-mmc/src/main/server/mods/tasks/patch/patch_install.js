var TaskUtils = require('../../../utils/task-utils');

module.exports = function () {
    return {
        code: 'patch_install',
        description: 'installing a given patch on the hex',
        type: 'ansible',
        parameters: [
            {
                key: 'patchName',
                description: 'The unique name of the patch',
                required: true
            },
            {
                key: 'verbose',
                description: 'Used to print additional debug information',
                required: false
            }
        ],
        execute: function (scope) {
            var verbose = (scope.verbose && ((scope.verbose == 'yes') || (scope.verbose == 'true')));

            return TaskUtils.runShellCommand(
                '/opt/bb/runtimes/bigboards-updater/patch.sh ' + scope.patchName,
                verbose,
                undefined //'/opt/bb/runtimes/bigboards-updater'
            );
        }
    };
};
