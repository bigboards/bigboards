var Container = {
    errors: require('./errors'),

    Configuration: require('./mods/configuration'),
    Firmware: require('./mods/firmware'),
    Library: require('./mods/library'),
    Metrics: require('./mods/metrics'),
    Nodes: require('./mods/nodes'),
    Slots: require('./mods/slots'),
    Tasks: require('./mods/tasks'),
    Tints: require('./mods/tints')
};

module.exports = Container;