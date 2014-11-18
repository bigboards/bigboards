var TaskUtils = require('../../../utils/task-utils');

module.exports = function(configuration) {
    return {
        code: 'lxc_destroy',
        description: 'permanently remove the lxc containers on all nodes of the hex',
        type: 'ansible',
        parameters: [
            {
                key: 'verbose',
                description: 'Used to print additional debug information',
                required: false
            }
        ],
        execute: function (scope) {
            return TaskUtils.runPlaybook('lxc/lxc-destroy', scope);
        }
    }
};
