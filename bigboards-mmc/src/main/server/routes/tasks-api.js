function TasksAPI(tasks) {
    this.tasks = tasks;
}

TasksAPI.prototype.get = function(req, res) {
    res.send(this.tasks.current());
};

module.exports = TasksAPI;