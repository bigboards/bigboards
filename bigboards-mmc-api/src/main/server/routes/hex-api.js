function HexAPI(taskService) {
    this.taskService = taskService;
}

HexAPI.prototype.node = function(req, res) {
    return res.send(200, this.taskService.tasks);
};

module.exports = HexAPI;