var HexSlot = require('./hex-slot');


function HexSlotManager(availableSlots) {
    this.slots = [];

    for (var i = 1; i <= availableSlots; i++) {
        this.slots[i] = new HexSlot(i);
    }
}

HexSlotManager.prototype.list = function() {
    var result = {};

    this.slots.forEach(function (slot) {
        var item = { slot: slot.id };

        // -- check if there is an occupant
        if (slot.isOccupied()) {
            item.occupant = {
                name: slot.occupant.name,
                health: slot.occupant.health
            };
        }

        result[slot.id] = item;
    });

    return result;
};

HexSlotManager.prototype.slot = function(slotId) {
    return this.slots[slotId];
};

module.exports = HexSlotManager;