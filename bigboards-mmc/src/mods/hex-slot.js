var util         = require("util"),
    EventEmitter = require('events').EventEmitter;

function HexSlot(id) {
    this.id = id;
    this.occupant = null;
}

util.inherits(HexSlot, EventEmitter);

HexSlot.prototype.isOccupied = function() {
    return this.occupant != null;
};

HexSlot.prototype.occupy = function(occupant) {
    this.occupant = occupant;
    this.emit('slot:occupied', this);
};

HexSlot.prototype.eject = function() {
    this.occupant = null;
    this.emit('slot:ejected', this);
};

module.exports = HexSlot;