var Ansible = require('node-ansible'),
    Q = require('q'),
    async = require('async');

module.exports = function(hex) {
    return {
        code: 'install_tint',
        description: 'Install the given tint on the hex',
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
                key: 'username',
                description: 'The username which has access to the tint',
                required: false
            },
            {
                key: 'password',
                description: 'The password of the user having access to the tint',
                required: false
            }
        ],
        execute: function(scope) {
            var deferred = Q.defer();

            // -- replace the username and password in the tint uri
            scope.tintUri = scope.tintUri.replace(/%username%/g, scope.username);
            scope.tintUri = scope.tintUri.replace(/%password%/g, scope.password);

            var outputBuffer = [];

            async.series([
                // -- Initialize the container
                function(callback) {
                    new Ansible.Playbook()
                        .inventory('/opt/bb/hosts')
                        .playbook('container-init')
                        .variables({
                            tintId: scope.tintId,
                            tintUri: scope.tintUri
                        })
                        .exec({cwd: '/opt/bb/runtimes/bigboards-mmc/ansible'})
                        .then(function(result) {
                            if (result.code != 0) callback(new Error(result.output));
                            else {
                                parseAnsibleOutput(outputBuffer, result.output);

                                callback();
                            }
                        }, function(error) {
                            callback(error);
                        });
                },

                // -- execute the tint playbook
                function(callback) {
                    new Ansible.Playbook()
                        .inventory('/opt/bb/hosts')
                        .playbook('install')
                        .variables(scope)
                        .exec({cwd: '/opt/bb/tints.d/' + scope.tintId})
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
                else {
                    try {
                        // -- load the tint information
                        hex.tint = hex.tintManager.load(scope.tintId);

                        // -- update the tint setting in the configuration
                        hex.configurationManager.save();

                        deferred.resolve(outputBuffer);
                    } catch (error) {
                        deferred.reject(error);
                    }
                }
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
