function TasksAPI(hex) {
    this.hex = hex;
}

TasksAPI.prototype.get = function(req, res) {
    res.send(this.hex.taskManager.current());
};

module.exports = TasksAPI;