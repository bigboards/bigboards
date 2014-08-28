var Ansible = require('node-ansible'),
    Q = require('q');

module.exports = {
    code: 'restart_containers',
    description: 'restarting the tint containers on the hex',
    type: 'ansible',
    execute: function(scope) {
        return new Ansible.AdHoc()
            .inventory('/opt/bb/hosts')
            .hosts('lxc')
            .module('shell')
            .asSudo()
            .args('reboot ')
            .exec();
    }
};
