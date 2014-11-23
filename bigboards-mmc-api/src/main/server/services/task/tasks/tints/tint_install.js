var Q = require('q'),
    winston = require('winston'),
    yaml = require("js-yaml"),
    mkdirp = require('mkdirp'),
    exec = require('child_process').exec,
    fs = require('fs');

var TaskUtils = require('../../../../utils/task-utils');

module.exports = function(configuration, services) {
    return {
        code: 'tint_install',
        description: 'installing the tint on the hex',
        type: 'ansible',
        parameters: [
            {
                key: 'tint',
                description: 'The tint',
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
            scope.tint.uri = scope.tint.uri.replace(/%username%/g, scope.username);
            scope.tint.uri = scope.tint.uri.replace(/%password%/g, scope.password);

            var defer = Q.defer();

            var path = '/opt/bb/tints.d/' + scope.tint.type + '/' + scope.tint.owner + '/' + scope.tint.tint;

            fs.exists(path, function(exists) {
                var gitCommand = 'git';

                if (exists) {
                    gitCommand += ' --git-dir=' + path + '/.git --work-tree=' + path + ' pull ';
                } else {
                    gitCommand += ' clone ' + scope.tint.uri + ' ' + path;
                }

                exec(gitCommand, function (err, stdout, stderr) {
                    if (err) {
                        defer.reject(err);
                    } else {
                        try {
                            var ymlTint = yaml.safeLoad(fs.readFileSync(path + '/tint.yml', 'utf8'));

                            // -- make sure the correct directory structure is available
                            fs.exists(path + '/downloads', function(exists) {
                                if (exists) return;

                                mkdirp.sync(path + '/downloads');
                            });


                            fs.writeFile(path + '/install.yml', yaml.safeDump(ymlTint.play), function (err) {
                                if (err) defer.reject(err);
                                else {
                                    var context = {
                                        verbose: scope.verbose,
                                        bb_tint_dir: path,
                                        bb_tint_owner: scope.tint.owner,
                                        bb_tint_tint: scope.tint.tint,
                                        bb_tint_type: scope.tint.type
                                    };

                                    defer.resolve(
                                        TaskUtils.runPlaybook('install', context, path)
                                    );
                                }
                            });
                        } catch (error) {
                            defer.reject(error);
                        }
                    }
                });
            });

            return defer.promise;
        }
    };
};