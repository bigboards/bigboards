var async = require('async'),
    uuid = require('node-uuid'),
    ansibleParser = require('../utils/ansible-output-parser');

function SocketAPI(config, tasks, metrics, slots) {
    this.config = config;
    this.tasks = tasks;
    this.metrics = metrics;
    this.slots = slots;
}

SocketAPI.prototype.link = function(socket) {
    var self = this;

    linkTasks(socket, this.tasks);

    // -- send the information about the hex every second
    setInterval(function () {
        var result = {};

        async.parallel([
            function(callback) {
                self.metrics.get('hex', 1, function(err, data) {
                    result.metrics = data;
                    return callback(err);
                });
            },
            function(callback) {
                result.slots = {};

                for (var slotId in self.slots.slots) {
                    var slotResult = {
                        slot: slotId
                    };

                    // -- get the slot
                    var slot = self.slots.slot(slotId);

                    // -- check if there is an occupant
                    if (slot.isOccupied()) {
                        slotResult.occupant = {
                            name: slot.occupant.name,
                            health: slot.occupant.health
                        };
                    }

                    result.slots[slotId] = slotResult;
                }

                return callback();
            }

        ],function(err) {
            if (err) return err; // TODO: add error handling

            return socket.emit('send:metrics', result);
        });


    }, 1000);
};

function linkTasks(socket, tasks) {
    tasks.on('task:started', function(data) {
        socket.emit('task:started', {
            code: data.code,
            description: data.description,
            type: data.type,
            running: data.running
        });
    });

    tasks.on('task:finished', function(data) {
        socket.emit('task:finished', data);
    });

    tasks.on('task:failed', function(data) {
        socket.emit('task:failed', data);
    });

    tasks.on('task:busy', function(data) {
        socket.emit('task:busy', data.data);
    });
}

module.exports = SocketAPI;