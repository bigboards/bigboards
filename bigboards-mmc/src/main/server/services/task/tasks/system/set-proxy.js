var Q = require('q'),
    winston = require('winston');

var TaskUtils = require('../../../../utils/task-utils');

module.exports = function(configuration, services) {
    return {
        code: 'set-proxy',
        description: 'Set the proxy server on all cluster nodes',
        type: 'ansible',
        parameters: [
            {
                key: 'http_proxy',
                description: 'The HTTP Proxy',
                required: true
            },
            {
                key: 'https_proxy',
                description: 'The HTTPS Proxy',
                required: false
            },
            {
                key: 'verbose',
                description: 'Used to print additional debug information',
                required: false
            }
        ],
        execute: function(env, scope) {
            return TaskUtils.playbook(env, 'system/set-proxy', scope);
        }
    };
};
