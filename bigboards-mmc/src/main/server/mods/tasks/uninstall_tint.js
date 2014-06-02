var Ansible = require('node-ansible'),
    Q = require('q'),
    async = require('async'),
    fs = require('fs');

module.exports = function(configuration) {
    return {
        code: 'uninstall_tint',
        description: 'Remove the given tint from the hex',
        type: 'ansible',
        parameters: [
            {
                key: 'tintId',
                description: 'The unique id of the tint',
                required: true
            }
        ],
        execute: function(scope) {
            var deferred = Q.defer();

            var outputBuffer = [];

            async.series([
                // -- Remove the tint from the configuration
                function(callback) {
                    // -- load the hex information
                    configuration.load().then(function(data) {
                        data.tint = null;

                        configuration.save(data.tint);
                    }).then(function(data) {
                        callback();
                    }, function(error) {
                        callback(error);
                    });
                },

                // -- Remove the tint source from the master node
                function(callback) {
                    try {
                        fs.unlinkSync('/opt/bb/tints.d/' + scope.tintId);

                        callback();
                    } catch (err) {
                        callback(err);
                    }
                },

                // -- Remove the container from the hex
                function(callback) {
                    new Ansible.AdHoc()
                        .inventory('/opt/bb/hosts')
                        .hosts('host')
                        .module('shell')
                        .asSudo()
                        .args('lxc-destroy -n ' + scope.tintId)
                        .then(function(result) {
                            if (result.code != 0) callback(new Error(result.output));
                            else {
                                parseAnsibleOutput(outputBuffer, result.output);

                                callback();
                            }
                        }, function(error) {
                            callback(error);
                        });
                }

            ], function(error) {
                if (error) deferred.reject(error);
                else deferred.resolve(outputBuffer);
            });

            return deferred.promise;
        }
    };
};

function parseAnsibleOutput(buffer, ansibleOutput) {
    var lines = ansibleOutput.split('\n');

    var currentRole = null;
    var currentStatement = null;

    lines.forEach(function(line) {
        var firstChars = line.substr(0, 4);

        if (firstChars == 'TASK') {
            var pattern = /.*\[(.*)\|(.*)\]/;

            var matches = line.match(pattern);

            currentRole = matches[1];
            currentStatement = matches[2];

        } else if (firstChars == 'ok: ' || firstChars == 'chan' || firstChars == 'fail') {
            var m2 = line.match(/(.*): \[(.*)\].*/);
            buffer.push({
                role: currentRole,
                statement: currentStatement,
                host: m2[2],
                status: m2[1]
            })
        }
    });
}
