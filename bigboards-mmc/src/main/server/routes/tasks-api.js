function TasksAPI(taskService) {
    this.taskService = taskService;
}

TasksAPI.prototype.list = function(req, res) {
    res.send(200, this.taskService.tasks);
};

TasksAPI.prototype.get = function(req, res) {
    var id = req.param('id');

    var result = (id == 'current') ? this.taskService.current() : this.taskService.get(id);

    if (!result) res.send(404, 'No task found with id ' + id);
    else res.send(200, result);
};

TasksAPI.prototype.invoke = function(req, res) {
    var id = req.param('id');
    if (!id) return res.send(400, 'no task id has been provided');

    // TODO: add logic for not running more then one task

    var parameters = req.body;
    this.taskService
        .invoke(id, parameters)
        .then(function() {
            res.send(200, 'The task with id ' + id + ' has been invoked');
        })
        .fail(function(error) {
            res.send(500, error.message);
        });
};

TasksAPI.prototype.history = function(req, res) {
    var id = req.param('id');
    if (!id) return res.send(400, 'no task id has been provided');

    res.send(500, 'This feature has not been implemented yet.');
};

module.exports = TasksAPI;