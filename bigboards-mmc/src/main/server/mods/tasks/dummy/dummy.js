var Ansible = require('node-ansible'),
    Q = require('q');

module.exports = function(configuration) {
    return {
        code: 'dummy',
        description: 'Perform a dummy task',
        type: 'ansible',
        parameters: [
            {
                key: 'loops',
                description: 'The number of 1 sec loops',
                required: false
            }
        ],
        execute: function (scope) {
            var loops = scope.loops ? parseInt(scope.loops) : 10;

            var deferrer = Q.defer();

            var counter = loops;
            var intervalHandle = setInterval(function() {
                if (counter == 0) {
                    clearInterval(intervalHandle);
                    deferrer.resolve();
                } else {
                    deferrer.notify({data: 'Dummy task tick\n'});
                    counter--;
                }
            }, 1000);

            return deferrer.promise;
        }
    }
};
