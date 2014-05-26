var async = require('async'),
    uuid = require('node-uuid');

function SocketAPI(config, hex, metricStore) {
    this.config = config;
    this.hex = hex;
    this.metricStore = metricStore;
}

SocketAPI.prototype.connect = function(socket) {
    var self = this;

    // -- send all the hex information.
    socket.on('hex:identify', function(data, fn) {
        fn({
            'id': self.hex.id,
            'name': self.hex.name,
            'initialized': self.hex.initialized,
            'tint': ((self.hex.tint) ? self.hex.tint.manifest : null)
        });
    });

    socket.on('hex:bootstrap', function(data, fn) {
        self.hex.bootstrap(function (err, data) {
            return fn(err, data);
        })
    });

    socket.on('hex:update', function() {
        self.hex.update();
    });

    /**
     * Request a list of all the slots
     */
    socket.on('slots:list', function(data, fn) {
        var slots = {};

        self.hex.slotManager.slots.forEach(function(slot) {
            slots[slot.id] = {
                'occupied': slot.isOccupied(),
                'occupant': (slot.isOccupied() ? slot.occupant.name : null),
                'health': (slot.isOccupied() ? slot.occupant.health : null)
            }
        });

        fn(slots);
    });

    socket.on('hex:tint:install', function(data, fn) {
        self.hex.tintManager.install(data).then(function(result) {
            fn(null, result);
        }, function(error) {
            fn(error)
        });
    });

    socket.on('hex:tint:update', function(data, fn) {
        self.hex.tintManager.update(data).then(function(result) {
            fn(null, result);
        }, function(error) {
            fn(error)
        });
    });

    socket.on('hex:tint:uninstall', function(data, fn) {
        self.hex.tintManager.uninstall(data).then(function(result) {
            fn(null, result);
        }, function(error) {
            fn(error)
        });
    });

    socket.on('hex:tint:actions', function(data, fn) {
        if (! self.hex.tint) return null;

        return fn(self.hex.tint.actions);
    });

    socket.on('hex:tint:views', function(data, fn) {
        if (! self.hex.tint) return null;

        return fn(self.hex.tint.views);
    });

    socket.on('hex:tint:configuration', function(data, fn) {
        if (! self.hex.tint) return null;

        return self.hex.tint.retrieveConfiguration(function(err, config) {
            fn(config);
        });
    });

    self.hex.taskManager.on('task:started', function(data) {
        socket.emit('task:started', {
            code: data.code,
            description: data.description,
            type: data.type,
            running: data.running
        });
    });

    self.hex.taskManager.on('task:finished', function(data) {
        socket.emit('task:finished', data);
    });

    self.hex.taskManager.on('task:failed', function(data) {
        socket.emit('task:failed', data);
    });

    self.hex.taskManager.on('task:busy', function(data) {
        socket.emit('task:busy', data);
    });

    // -- send the information about the hex every second
    setInterval(function () {
        var result = {};

        async.parallel([
            function(callback) {
                self.metricStore.get('hex', 1, function(err, data) {
                    result.metrics = data;
                    return callback(err);
                });
            },
            function(callback) {
                result.slots = {};

                for (var slotId in self.hex.slotManager.slots) {
                    var slotResult = {
                        slot: slotId
                    };

                    // -- get the slot
                    var slot = self.hex.slotManager.slot(slotId);

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

module.exports = SocketAPI;