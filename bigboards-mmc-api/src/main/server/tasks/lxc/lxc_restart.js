var TaskUtils = require('../../../utils/task-utils');

module.exports = function(configuration) {
    return {
        code: 'lxc_restart',
        description: 'restarting the lxc containers on the hex',
        type: 'ansible',
        parameters: [
            {
                key: 'verbose',
                description: 'Used to print additional debug information',
                required: false
            }
        ],
        execute: function (scope) {
            return TaskUtils.runPlaybook('lxc/lxc-restart', scope);
        }
    }
};
