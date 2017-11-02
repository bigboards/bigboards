var Q = require('q'),
    log = require('winston'),
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

                log.info('Installing tint ' + scope.tint.type + '/' + scope.tint.owner + '/' + scope.tint.slug);

                return TintUtils
                    .setTintState(env.settings.dir.tints, variables.tint, 'installing')
                    .then(function() {
                        return setupTintStructure(variables, services.registry).then(function() {
                            var tintEnv = {
                                workdir: variables.generator.ansible,
                                hostFile: variables.generator.hosts,
                                verbose: variables.verbose
                            };

                            log.info('Installing the tint');
                            return TaskUtils.playbook(tintEnv, 'install', variables).then(function() {
                                return TintUtils.setTintState(env.settings.dir.tints, variables.tint, 'installed');
                            });
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

function setupTintStructure(variables, registryService) {
    // -- be sure the tint path exists
    fss.mkdir(variables.generator.tint);

    // -- checkout the configuration files from the git repository
    return checkoutIfNeeded(variables.tint.uri, variables.generator.git, variables.firmware).then(function() {
        generateAnsibleCode(variables, registryService);
    });
}

function generateAnsibleCode(variables, registryService) {
    var templateHome = variables.generator.templates + '/tint';

    // -- make sure the directory in which we will generate the ansible code is available
    fss.mkdir(variables.generator.ansible);
    generateHostsInventoryFile(variables.hex, variables.generator.ansible + '/hosts');
    fss.generateFile(templateHome + '/install.yml.j2', variables.generator.ansible + '/install.yml', variables);
    fss.generateFile(templateHome + '/uninstall.yml.j2', variables.generator.ansible + '/uninstall.yml', variables);

    // -- create the directories for the ansible playbook
    fss.mkdir(variables.generator.ansible + '/roles');

    // -- generate the roles
    variables.tint.stack.containers.forEach(function(container) {
        variables.role = container;
        variables.generator.role = variables.generator.ansible + '/roles/' + container.name;
        variables.generator.pre_install = variables.generator.git + '/scripts/' + container.pre_install;
        variables.generator.post_install = variables.generator.git + '/scripts/' + container.post_install;
        variables.dirs.role_data = variables.dirs.data + '/' + container.name;
        variables.dirs.role_scripts = variables.dirs.scripts + '/' + container.name;

        // -- check if the role has a registry set. If it has one, we will look for registry credentials in the hex
        if (container.registry) {
            // -- check if we can find credentials for this registry
            var registry = registryService.getRegistry(container.registry, true);
            if (registry) container.registry = registry;
            else throw new Error('Unable to find a mapping for registry ' +  container.registry);
        }

        // -- substitute the role image with an updated one.
        // -- In case of bigboards images we append the hex architecture if its not already there
        if (container.image && (container.image.indexOf('bigboards/') == 0) && (container.image.indexOf(variables.hex.arch) == -1)) {
            // -- we must support image tags which are appended as :tag
            var index = container.image.lastIndexOf(":");
            if (index != -1) {
                container.image = container.image.substring(0,index) + '-' + variables.hex.arch + container.image.substring(index)
            }
            else {
                container.image = container.image + '-' + variables.hex.arch;
            }
        }

        generateAnsibleRoleCode(variables);
    });
}

/**
 * Generate the ansible role.
 *   This method will generate the tasks, files, templates and scripts directories for the role to use.
 * @param variables
 */
function generateAnsibleRoleCode(variables) {
    var templateHome = variables.generator.templates + '/tint/role';

    log.log('info', 'processing role ' + JSON.stringify(variables.role));

    fss.mkdir(variables.generator.role);

    // -- role tasks
    fss.mkdir(variables.generator.role + '/tasks');
    fss.generateFile(templateHome + '/role_install.yml.j2', variables.generator.role + '/tasks/install.yml', variables);
    fss.generateFile(templateHome + '/role_uninstall.yml.j2', variables.generator.role + '/tasks/uninstall.yml', variables);
    fss.generateFile(templateHome + '/role_main.yml.j2', variables.generator.role + '/tasks/main.yml', variables);

    // -- role files
    fss.mkdir(variables.generator.role + '/files');
    fss.mkdir(variables.generator.role + '/files/init');
    fss.generateFile(templateHome + '/docker-init.conf.j2', variables.generator.role + '/files/init/' + variables.role.name + '.conf', variables);

    // -- volumes which don't start with a / are relative to the git config directory. This means we will need to
    // -- generate the config files from git into the templates folder
    fss.mkdir(variables.generator.role + '/templates');
    variables.role.volumes.forEach(function(volume) {
        if (! volume.host) return;
        if (volume.host.indexOf('/') == 0) return;
        if (! fss.exists(variables.generator.git + '/config/' + volume.host)) return;

        if (fss.isDirectory(variables.generator.git + '/config/' + volume.host)) {
            fss.mkdir(variables.generator.role + '/templates/' + volume.host);
            fss.generateDir(variables.generator.git + '/config/' + volume.host, variables.generator.role + '/templates/' + volume.host, variables);
        } else {
            // -- create the parent directory
            fss.mkdir(fss.parentFileName(variables.generator.role + '/templates/' + volume.host));
            fss.generateFile(variables.generator.git + '/config/' + volume.host, variables.generator.role + '/templates/' + volume.host, variables);
        }
    });
}

function generateHostsInventoryFile(hex, path) {
    var content = "";

    content += "[first]\n";
    content += hex.name + "-n1	ansible_ssh_user=bb\n\n";

    content += "[last]\n";
    content += hex.name + "-n" + hex.node_count + "	ansible_ssh_user=bb\n\n";

    for (var i = 1; i <= hex.node_count; i++) {
        content += "[n" + i + "]\n";
        content += hex.name + "-n" + i + "	ansible_ssh_user=bb\n\n";
    }

    fss.writeFile(path, content);
}

function checkoutIfNeeded(repoUrl, repoPath, firmware) {
    var defer = Q.defer();

    fss.rmdir(repoPath);

    log.info("Cloning the configuration repository " + repoUrl + " to " + repoPath);
    defer.notify({channel: 'output', data: "Cloning the configuration repository " + repoUrl + " to " + repoPath + "\n"});

    gift.clone(repoUrl, repoPath, function(err, repo) {
        if (err) defer.reject(err);

        // -- try to checkout the branch with the current firmware
        defer.notify({channel: 'output', data: "Checking if a firmware branch is available for firmware " + firmware + "\n"});
        if (!repo) {
            defer.notify({channel: 'output', data: "No repository found for given URL " + repoUrl});
        }
        else {
            repo.checkout(firmware, function(err) {
                if (err) {
                    defer.notify({channel: 'output', data: "Using the master as configuration branch " + firmware + "\n"});
                    defer.resolve(repo);
                } else {
                    defer.notify({channel: 'output', data: "Using configuration branch " + firmware + "\n"});

                    repo.checkout(firmware, function(err) {
                        if (err) defer.reject(err);
                        else defer.resolve(repo);
                    });
                }
            });
        }
    });

    return defer.promise;
}

function createVariableScope(env, hex, scope) {
    var tintPath = env.settings.dir.tints + '/' + scope.tint.type + '/' + scope.tint.owner + '/' + scope.tint.slug;

    // -- build the variables needed during the generation of files
    var variables = {
        hex: deepcopy(hex),
        tint: deepcopy(scope.tint),
        verbose: env.verbose,
        firmware: env.settings.firmware,
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
            config: '/data' + '/' + scope.tint.owner + '_' + scope.tint.slug + '/config',
            scripts: '/data' + '/' + scope.tint.owner + '_' + scope.tint.slug + '/scripts'
        }
    };

    // -- the tint is missing a tint id, so we need to add that to it
    variables.tint.id = TintUtils.toTintId(scope.tint.type, scope.tint.owner, scope.tint.slug);
    variables.hex.node_count = hex.node_count || 6;

    return variables;
}