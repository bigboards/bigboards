var Q = require('q'),
    winston = require('winston'),
    yaml = require("js-yaml"),
    fs = require('fs');

var TaskUtils = require('../../../utils/task-utils');

module.exports = function(settings, configuration) {
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
            scope.tintUri = scope.tintUri.replace(/%username%/g, scope.username);
            scope.tintUri = scope.tintUri.replace(/%password%/g, scope.password);

            // -- generate the playbook from the tint definition
            var writeFile = Q.denodeify(fs.writeFile);

            var play = settings.tintDirectory +
                '/' + scope.tint.type +
                '/' + scope.tint.owner +
                '/' + scope.tint.tint +
                '/install.yml';

            return writeFile(play, yaml.safeDump(scope.tint.play))
                .then(TaskUtils.runPlaybook(play, scope));

        }
    };
};