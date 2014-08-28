var Ansible = require('node-ansible');

module.exports = {
    code: 'update',
    description: 'updating the firmware on the hex',
    type: 'ansible',
    execute: function(scope) {
        return new Ansible.AdHoc()
            .inventory('/opt/bb/hosts')
            .hosts('host-coordinators')
            .module('shell')
            .asSudo()
            .verbose('vvvv')
            .args('./update.sh')
            .exec({cwd: '/opt/bb/runtimes/bigboards-updater'});
    }
};
