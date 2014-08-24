function TasksAPI(tasks) {
    this.tasks = tasks;
}

TasksAPI.prototype.list = function(req, res) {
    var id = req.param('id');
    if (id) {
        if (id == 'current') res.send(200, this.tasks.current());
        else res.send(200, this.tasks.tasks[id]);
    } else {
        res.send(200, this.tasks.tasks);
    }
};

TasksAPI.prototype.get = function(req, res) {
    var currentTask = this.tasks.current();
    if (currentTask == null) res.send(404, 'No task is currently running');
    else res.send(200, currentTask);
};

TasksAPI.prototype.history = function(req, res) {
    var id = req.param('id');
    if (!id) return res.send(404, 'no task id has been provided');

    res.send(500, 'This feature has not been implemented yet.');
};

module.exports = TasksAPI;