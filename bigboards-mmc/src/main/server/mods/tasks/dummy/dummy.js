var Ansible = require('node-ansible'),
    Q = require('q');

module.exports = function(configuration) {
    return {
        code: 'dummy',
        description: 'Perform a dummy task',
        type: 'ansible',
        parameters: [
            {
                key: 'duration',
                description: 'The duration of the dummy task',
                required: false
            },
            {
                key: 'error',
                description: 'The error message to display. If the error message is not specified, the task will succeed',
                required: false
            }
        ],
        execute: function (scope) {
            var duration = scope.duration ? scope.duration : 5000;
            var error = scope.error;

            var deferrer = Q.defer();

            setTimeout(function () {
                if (error) deferrer.reject(error);
                else deferrer.resolve();
            }, duration);

            return deferrer.promise;
        }
    }
};
