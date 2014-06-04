var util = require("util"),
    EventEmitter = require('events').EventEmitter,
    uuid = require('node-uuid'),
    winston = require('winston'),
    Q = require('q');

var TaskManager = function() {
    this.tasks = {};
    this.currentTask = null;
};

util.inherits(TaskManager, EventEmitter);

TaskManager.prototype.current = function() {
    return this.currentTask;
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

    if (!taskCode) deferred.reject(new Error('Invalid task code'));

    var task = this.tasks[taskCode];
    if (!this.tasks[taskCode]) deferred.reject(new Error('Invalid task code'));

    if (task.running)
        deferred.reject(new Error('the task with code ' + taskCode + ' is already being invoked'));

    this.tasks[taskCode].running = true;
    this.currentTask = this.tasks[taskCode];

    var executionScope = {};
    task.parameters.forEach(function(parameter) {
        if ((!parameters) || (parameter.required && !parameters[parameter.key]))
            deferred.reject(new Error('Executing ' + taskCode + ' requires parameter ' + parameter.key + ' but it has not been provided'));

        executionScope[parameter.key] = parameters[parameter.key];
    });

    // -- invoke the task
    winston.log('info', 'invoking task "%s": %s', taskCode, task.description);
    eventEmitter.emit('task:started', task);
    try {
        task.execute(executionScope).then(function(data) {
            if (task.type == 'ansible') {
                if (data.code != 0) {
                    deferred.reject(data.output);
                    eventEmitter.emit('task:failed', { code: taskCode, error: data.output });
                } else {
                    deferred.resolve(data);
                    eventEmitter.emit('task:finished', { code: taskCode, result: data.code });
                }
            } else {
                eventEmitter.emit('task:finished', { code: taskCode, result: data });
            }

            self.tasks[taskCode].running = false;
            self.currentTask = null;

        }, function(error) {
            self.tasks[taskCode].running = false;
            self.currentTask = null;

            deferred.reject(error);
            eventEmitter.emit('task:failed', { code: taskCode, error: error });
        }, function(progress) {
            deferred.notify(progress);
            eventEmitter.emit('task:busy', { code: taskCode, data: progress });
        });
    } catch (err) {
        deferred.reject(err);
        eventEmitter.emit('task:failed', { code: taskCode, error: err });
    }

    return deferred.promise;
};

module.exports = TaskManager;