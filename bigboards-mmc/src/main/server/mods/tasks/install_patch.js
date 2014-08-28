var Ansible = require('node-ansible'),
    Q = require('q');

module.exports = function (configuration) {
    return {
        code: 'install_patch',
        description: 'installing a given patch on the hex',
        type: 'ansible',
        parameters: [
            {
                key: 'patchName',
                description: 'The unique name of the patch',
                required: true
            }
        ],
        execute: function (scope) {
            return new Ansible.AdHoc()
                .inventory('/opt/bb/hosts')
                .hosts('host-coordinators')
                .module('shell')
                .asSudo()
                .args('./patch.sh ' + scope.patchName)
                .exec({cwd: '/opt/bb/runtimes/bigboards-updater'});
        }
    };
};
