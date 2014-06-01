function HexNode(name) {
    this.name = name;
    this.health = {
        availability: 'bad'
    }
}

HexNode.prototype.updateHealth = function(property, healthLevel) {
    this.health[property] = healthLevel;
};



module.exports = HexNode;
