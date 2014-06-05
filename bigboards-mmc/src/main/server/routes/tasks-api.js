function TasksAPI(tasks) {
    this.tasks = tasks;
}

TasksAPI.prototype.get = function(req, res) {
    var currentTask = this.tasks.current();
    if (currentTask == null) res.send(404, 'No task is currently running');
    else res.send(200, currentTask);
};

module.exports = TasksAPI;