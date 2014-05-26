var HexSlot = require('./hex-slot');


function HexSlotManager(availableSlots) {
    this.slots = [];

    for (var i = 1; i <= availableSlots; i++) {
        this.slots[i] = new HexSlot(i);
    }
}

HexSlotManager.prototype.slot = function(slotId) {
    return this.slots[slotId];
};

module.exports = HexSlotManager;