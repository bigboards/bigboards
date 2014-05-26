var HexNode = require('../mods/hex-node'),
    HexSlot = require('../mods/hex-slot');

function MetricAPI(hex) {
    this.hex = hex;
}

/**
 * Post the metrics about a node.
 *
 *  A node will actually be the one posting the metrics. We will not be receiving information from the slot itself.
 *  However, the data that is being sent will contain the slot id to which the node is attached.
 */
MetricAPI.prototype.post = function (req, res) {
    var envelope = req.body;

    // -- get the slot
    var slot = this.hex.slotManager.slot(envelope.slot);
    if (! slot) return res.send(400, 'An invalid slot id was passed.');

    // -- get the node
    // -- check if the node is already a member of this hex
    if (! this.hex.nodeManager.hasNodeWithName(envelope.node)) {
        // -- add the node to the node manager
        this.hex.nodeManager.attach(new HexNode(
            envelope.node
        ));
    }
    var node = this.hex.nodeManager.node(envelope.node);

    // -- link the slot with the node if needed
    if (slot.occupant == null) {
        slot.occupy(node);
    } else if (slot.occupant != node) {
        slot.eject();
        slot.occupy(node);
    }

    // -- update the metrics
    return this.hex.metricStore.push(req.body, function(err, data) {
        if (err) {
            return res.send(500, err);
        }

        return res.json(data);
    });
};

module.exports = MetricAPI;