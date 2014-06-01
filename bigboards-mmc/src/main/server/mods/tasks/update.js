var Ansible = require('node-ansible');

module.exports = {
    code: 'update',
    description: 'Update the firmware of the hex',
    type: 'ansible',
    execute: function(scope) {
        return new Ansible.Playbook()
            .inventory('/opt/bb/runtimes/bigboards-updater/hosts')
            .playbook('update')
            .exec({cwd: '/opt/bb/runtimes/bigboards-updater'});
    }
};
