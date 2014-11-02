var util = require("util"),
    EventEmitter = require('events').EventEmitter,
    winston = require('winston'),
    Q = require('q');

var Errors = require('../../errors');

var TaskManager = function() {
    this.tasks = {};
    this.currentTask = null;
};

util.inherits(TaskManager, EventEmitter);

TaskManager.prototype.current = function() {
    return this.currentTask;
};

TaskManager.prototype.get = function(code) {
    return this.tasks[code];
};

TaskManager.prototype.registerDefaultTasks = function(configuration) {
    // -- dummy
    this.register(require('./dummy/dummy')(configuration));

    // -- network
    this.register(require('./network/network_internal')(configuration));

    // -- lxc tasks
    this.register(require('./lxc/lxc_destroy')(configuration));
    this.register(require('./lxc/lxc_restart')(configuration));

    // -- tint tasks
    this.register(require('./tints/tint_install')(configuration));
    this.register(require('./tints/tint_uninstall')(configuration));

    // -- update / patch
    this.register(require('./patch/update')(configuration));
    this.register(require('./patch/patch_install')(configuration));
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
TaskManager.prototype.register = function(taskDefinition) {
    if (! taskDefinition) throw new Error('Invalid task definition format!');
    if (! taskDefinition.code) throw new Error('Invalid task definition format!');
    if (! taskDefinition.description) throw new Error('Invalid task definition format!');

    this.tasks[taskDefinition.code] = taskDefinition;
    this.tasks[taskDefinition.code].running = false;

    if (! taskDefinition.parameters) this.tasks[taskDefinition.code].parameters = [];

    winston.log('info', '"%s" task registered', taskDefinition.code);
};

/**
 * Invoke the task with the given code.
 *
 * @param taskCode      the unique code of the task
 * @param parameters    An object holding key/values for the parameters
 */
TaskManager.prototype.invoke = function(taskCode, parameters) {
    var eventEmitter = this;
    var self = this;

    var deferred = Q.defer();

    if (this.currentTask) {
        deferred.reject(new Errors.TasksRunnerBusyError('the task runner is already busy executing tasks.'));
        return deferred.promise;
    }

    if (!taskCode) {
        deferred.reject(new Error('Invalid task code'));
    } else {
        var task = this.tasks[taskCode];
        if (!task) {
            deferred.reject(new Error('Invalid task code'));
        }
        else {
            if (task.running) {
                deferred.reject(new Errors.TaskAlreadyStartedError('the task with code ' + taskCode + ' is already being invoked'));
                return deferred.promise;
            }
            else {
                this.currentTask = this.tasks[taskCode];

                // -- set an empty list for the parameters
                if (! parameters) parameters = {};

                var executionScope = {};
                var parameterError = null;
                task.parameters.forEach(function (parameter) {
                    if (parameter.required && !parameters[parameter.key]) {
                        parameterError = new Errors.TaskParameterError('Executing ' + taskCode + ' requires parameter ' + parameter.key + ' but it has not been provided');
                        return;
                    }

                    executionScope[parameter.key] = parameters[parameter.key];
                });

                if (parameterError) {
                    deferred.reject(parameterError);
                    return deferred.promise;
                }

                // -- invoke the task
                winston.log('info', 'invoking task "%s": %s', taskCode, task.description);
                eventEmitter.emit('task:started', task);
                try {
                    task.execute(executionScope).then(function (data) {
                        eventEmitter.emit('task:finished', { code: taskCode, description: task.description, data: data });

                        self.currentTask = null;

                    }, function (error) {
                        winston.log('info', 'Task invocation resulted in an error: ' + error);
                        winston.log('info', error.stack);

                        self.currentTask = null;

                        eventEmitter.emit('task:failed', { code: taskCode, description: task.description, error: error });
                    }, function (progress) {
                        eventEmitter.emit('task:busy', { code: taskCode, data: progress });
                    });

                    deferred.resolve();
                } catch (err) {
                    deferred.reject(err);
                    winston.log('info', 'Unable to invoke a task: ' + err);
                    winston.log('info', err.stack);
                    eventEmitter.emit('task:failed', { code: taskCode, description: task.description, error: err });
                }
            }
        }
    }

    return deferred.promise;
};

module.exports = TaskManager;
