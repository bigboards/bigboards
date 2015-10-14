var Q = require('q'),
    winston = require('winston'),
    fs = require('fs'),
    fss = require('../../../../utils/fs-utils-sync'),
    deepcopy = require('deepcopy'),
    gift = require('gift');

var TaskUtils = require('../../../../utils/task-utils'),
    TintUtils = require('../../../../utils/tint-utils');

module.exports = function(configuration, services) {
    return {
        code: 'stack_install',
        description: 'installing the tint on the hex',
        type: 'ansible',
        parameters: [
            {
                key: 'tint',
                description: 'the tint descriptor',
                required: true
            },
            {
                key: 'verbose',
                description: 'Used to print additional debug information',
                required: false
            }
        ],
        execute: function(env, scope) {
            return services.hex.get().then(function(hex) {
                var variables = createVariableScope(env, hex, scope);

                // -- clean the views of the nodes variable
                //for (var viewIdx in scope.tint.stack.views) {
                //    delete scope.tint.stack.views[viewIdx].url;
                //}

                winston.info('Installing tint ' + scope.tint.type + '/' + scope.tint.owner + '/' + scope.tint.slug);

                env.hexConfig.set([
                    { key: 'stack.id', value: variables.tint.id },
                    { key: 'stack.status', value: 'installing' }
                ]);

                return setupTintStructure(variables).then(function() {
                    var tintEnv = {
                        workdir: variables.generator.ansible,
                        hostFile: variables.generator.hosts,
                        verbose: variables.verbose
                    };

                    winston.info('Installing the tint');
                    return TaskUtils.playbook(tintEnv, 'install', variables).then(function() {
                        env.hexConfig.set('stack.status', 'installed');
                    });
                });
            });
        }
    };
};

function cleanup(variables) {
    // -- remove the tint directory
    if (variables.generator.tint) fss.rmdir();
}

function setupTintStructure(variables) {
    // -- be sure the tint path exists
    fss.mkdir(variables.generator.tint);

    // -- checkout the configuration files from the git repository
    return checkoutIfNeeded(variables.tint.uri, variables.generator.git).then(function() {
        generateAnsibleCode(variables);
    });
}

function generateAnsibleCode(variables) {
    var templateHome = variables.generator.templates + '/tint';

    // -- make sure the directory in which we will generate the ansible code is available
    fss.mkdir(variables.generator.ansible);
    fss.generateFile(templateHome + '/hosts.j2', variables.generator.ansible + '/hosts', variables);
    fss.generateFile(templateHome + '/install.yml.j2', variables.generator.ansible + '/install.yml', variables);
    fss.generateFile(templateHome + '/uninstall.yml.j2', variables.generator.ansible + '/uninstall.yml', variables);

    // -- create the directories for the ansible playbook
    fss.mkdir(variables.generator.ansible + '/roles');

    // -- generate the roles
    variables.tint.stack.containers.forEach(function(container) {
        variables.role = container;
        variables.generator.role = variables.generator.ansible + '/roles/' + container.name;
        variables.dirs.role_data = variables.dirs.data + '/' + container.name;

        generateAnsibleRoleCode(variables);
    });
}

function generateAnsibleRoleCode(variables) {
    var templateHome = variables.generator.templates + '/tint/role';

    fss.mkdir(variables.generator.role);

    fss.mkdir(variables.generator.role + '/tasks');
    fss.generateFile(templateHome + '/role_install.yml.j2', variables.generator.role + '/tasks/install.yml', variables);
    fss.generateFile(templateHome + '/role_uninstall.yml.j2', variables.generator.role + '/tasks/uninstall.yml', variables);
    fss.generateFile(templateHome + '/role_main.yml.j2', variables.generator.role + '/tasks/main.yml', variables);

    fss.mkdir(variables.generator.role + '/files');
    fss.generateFile(templateHome + '/docker-init.conf.j2', variables.generator.role + '/files/' + variables.role.name + '.conf', variables);

    // -- volumes which don't start with a / are relative to the git config directory. This means we will need to
    // -- generate the config files from git into the templates folder
    fss.mkdir(variables.generator.role + '/templates');
    variables.role.volumes.forEach(function(volume) {
        if (volume.host.indexOf('/') != 0) return;
        if (! fss.exists(variables.dir.git + '/' + volume.host)) return;

        fss.mkdir(variables.generator.role + '/templates/' + volume.host);
        fss.generateDir(variables.generator.git + '/' + volume.host, variables.generator.role + '/templates/' + volume.host, variables);
    });
}

function checkoutIfNeeded(repoUrl, repoPath) {
    var defer = Q.defer();

    if (fss.exists(repoPath)) {
        var repo = gift(repoPath);

        repo.sync(function(err) {
            if (err) defer.reject(err);
            defer.resolve(repo);
        });
    } else {
        gift.clone(repoUrl, repoPath, function(err, repo) {
            if (err) defer.reject(err);

            defer.resolve(repo);
        });
    }

    return defer.promise;
}

function createVariableScope(env, hex, scope) {
    var tintPath = env.settings.dir.tints + '/' + scope.tint.type + '/' + scope.tint.owner + '/' + scope.tint.slug;

    // -- build the variables needed during the generation of files
    var variables = {
        hex: deepcopy(hex),
        tint: deepcopy(scope.tint),
        verbose: env.verbose,
        docker: {
            registry: env.settings.docker.registry
        },
        generator: {
            git: tintPath + '/git',
            tint: tintPath,
            ansible: tintPath + '/ansible',
            hosts: tintPath + '/ansible/hosts',
            templates: env.settings.dir.templates
        },
        dirs: {
            data: '/data' + '/' + scope.tint.owner + '_' + scope.tint.slug + '/data',
            config: '/data' + '/' + scope.tint.owner + '_' + scope.tint.slug + '/config'
        }
    };

    // -- the tint is missing a tint id, so we need to add that to it
    variables.tint.id = TintUtils.toTintId(scope.tint.type, scope.tint.owner, scope.tint.slug);

    return variables;
}