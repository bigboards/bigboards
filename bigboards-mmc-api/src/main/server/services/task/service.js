var util = require("util"),
    EventEmitter = require('events').EventEmitter,
    winston = require('winston'),
    fs = require('fs'),
    uuid = require('node-uuid'),
    Tail = require('always-tail'),
    mkdirp = require('mkdirp'),
    Q = require('q');

var Errors = require('../../errors');

var TaskService = function(settings) {
    this.settings = settings;
    this.tasks = {};
    this.currentTask = null;

    mkdirp.sync(this.settings.dir.tasks);
};

util.inherits(TaskService, EventEmitter);

TaskService.prototype.current = function() {
    return this.currentTask;
};

TaskService.prototype.get = function(code) {
    return this.tasks[code];
};

TaskService.prototype.listTasks = function() {
    return Q(this.tasks);
};

TaskService.prototype.removeAttempts = function(taskCode) {
    var defer = Q.defer();
    var self = this;

    fs.exists(this.settings.dir.tasks + '/' + taskCode, function(exists) {
        if (exists) {
            fs.readdir(self.settings.dir.tasks + '/' + taskCode, function (err) {
                if (err) defer.reject(err);
                else defer.resolve();
            });
        } else {
            defer.resolve();
        }
    });

    return defer.promise;
};

TaskService.prototype.listAttempts = function(taskCode) {
    var defer = Q.defer();
    var self = this;

    fs.exists(this.settings.dir.tasks + '/' + taskCode, function(exists) {
        if (exists) {
            fs.readdir(self.settings.dir.tasks + '/' + taskCode, function (err, files) {
                if (err) defer.reject(err);
                else defer.resolve(files);
            });
        } else {
            defer.resolve([]);
        }
    });

    return defer.promise;
};

TaskService.prototype.registerDefaultTasks = function(configuration, services) {
    // -- dummy
    this.register(require('./tasks/dummy/dummy')(configuration));

    // -- network
//    this.register(require('./tasks/network/network_internal')(configuration));

    // -- lxc tasks
//    this.register(require('./tasks/lxc/lxc_destroy')(configuration));
//    this.register(require('./tasks/lxc/lxc_restart')(configuration));

    // -- tint tasks
    this.register(require('./tasks/tints/tint_install')(configuration, services));
//    this.register(require('./tasks/tints/tint_uninstall')(configuration));

    // -- update / patch
//    this.register(require('./tasks/patch/update')(configuration));
//    this.register(require('./tasks/patch/patch_install')(configuration));
};

/**
 * Register the given task.
 *
 *   A registered task can be executed by the hex. We do this to prevent multiple instances of a task to
 *   execute at the same time.
 *
 *   A task has the following layout:
 *   {
 *      code: <the unique task code, used as a handle for invocation>,
 *      description: <a description of what the task actually does>,
 *      type: <currently only ansible is supported>,
 *      parameters: [
 *          {
 *             key: <the key for this parameter>,
 *             description: <a description of what should be passed>,
 *             required: <true or false where true indicates this parameter has to be set with every invocation>
 *          }
 *      ]
 *   }
 */
TaskService.prototype.register = function(taskDefinition) {
    if (! taskDefinition) throw new Error('Invalid task definition format!');
    if (! taskDefinition.code) throw new Error('Invalid task definition format!');
    if (! taskDefinition.description) throw new Error('Invalid task definition format!');

    this.tasks[taskDefinition.code] = taskDefinition;
    this.tasks[taskDefinition.code].running = false;

    if (! taskDefinition.parameters) this.tasks[taskDefinition.code].parameters = [];

    winston.log('info', '"%s" task registered', taskDefinition.code);
};

TaskService.prototype.output = function(taskCode, taskId) {
    var defer = Q.defer();

    fs.readFile(this.settings.dir.tasks + '/' + taskCode + '/' + taskId + '/output.log', "utf-8", function(err, content) {
        if (err) defer.reject(err);
        else defer.resolve(content);
    });

    return defer.promise;
};

TaskService.prototype.error = function(taskCode, taskId) {
    var defer = Q.defer();

    fs.readFile(this.settings.dir.tasks + '/' + taskCode + '/' + taskId + '/error.log', "utf-8", function(err, content) {
        if (err) defer.reject(err);
        else defer.resolve(content);
    });

    return defer.promise;
};

/**
 * Invoke the task with the given code.
 *
 * @param taskCode      the unique code of the task
 * @param parameters    An object holding key/values for the parameters
 */
TaskService.prototype.invoke = function(taskCode, parameters) {
    var eventEmitter = this;
    var self = this;

    var deferred = Q.defer();

    if (!taskCode) {
        deferred.reject(new Error('Invalid task code'));
    } else {
        var task = this.tasks[taskCode];
        if (!task) {
            deferred.reject(new Error('Invalid task code'));
        }
        else {
            var taskId = uuid.v4();

            try {
                var executionScope = buildTaskScope(task, parameters);
                var taskLogDir = this.settings.dir.tasks + '/' + taskCode + '/' + taskId;

                // -- create the output streams
                mkdirp.sync(this.settings.dir.tasks + '/' + taskCode + '/' + taskId);
                var errorStream = fs.createWriteStream(taskLogDir + '/error.log');
                var outputStream = fs.createWriteStream(taskLogDir + '/output.log');

                // -- invoke the task
                winston.log('info', 'invoking task "%s": %s', taskCode, task.description);
                eventEmitter.emit('task:started', {
                    attempt: taskId,
                    task: {
                        code: task.code,
                        description: task.description
                    }
                });

                try {
                    task.execute(executionScope).then(function (data) {
                        eventEmitter.emit('task:finished', { attempt: taskId, data: data });

                        outputStream.close();
                        errorStream.close();

                    }, function (error) {
                        winston.log('info', 'Task invocation resulted in an error: ' + error);
                        winston.log('info', error.stack);

                        outputStream.close();
                        errorStream.close();

                        eventEmitter.emit('task:failed', { attempt: taskId, error: error });
                    }, function (progress) {
                        if (progress.channel == 'output') outputStream.write(progress.data);
                        else if (progress.channel == 'error') errorStream.write(progress.data);

                        eventEmitter.emit('task:busy', { attempt: taskId, data: progress });
                    });

                    deferred.resolve({
                        attempt: taskId,
                        task: {
                            code: task.code,
                            description: task.description
                        }
                    });
                } catch (err) {
                    deferred.reject(err);
                    winston.log('info', 'Unable to invoke a task: ' + err);
                    winston.log('info', err.stack);

                    eventEmitter.emit('task:failed', { attempt: taskId, error: err });
                }

            } catch (error) {
                deferred.reject(error);
            }
        }
    }

    return deferred.promise;
};

function buildTaskScope(task, parameters) {
    // -- set an empty list for the parameters
    if (! parameters) parameters = {};

    var executionScope = {};
    task.parameters.forEach(function (parameter) {
        if (parameter.required && !parameters[parameter.key]) {
            throw new Errors.TaskParameterError('Executing ' + task.code + ' requires parameter ' + parameter.key + ' but it has not been provided');
        }

        executionScope[parameter.key] = parameters[parameter.key];
    });

    return executionScope;
}

module.exports = TaskService;