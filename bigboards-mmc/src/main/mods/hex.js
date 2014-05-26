var exec = require('child_process').exec,
    HexNodeManager = require('./hex-node-manager'),
    HexConfigurationManager = require('./hex-configuration-manager'),
    HexSlotManager = require('./hex-slot-manager'),
    HexHealthManager = require('./hex-health-manager'),
    TintManager = require('./tint-manager'),
    MetricStore = require('./hex-metric-store'),
    util = require("util"),
    EventEmitter = require('events').EventEmitter,
    Ansible = require("node-ansible"),
    TaskManager = require("./task-manager.js");

function Hex(hexRootDir, metricStore) {
    var self = this;
    this.bootstrapScript = hexRootDir + '/runtimes/bootstrap.sh';

    // -- initialize the managers
    this.taskManager = new TaskManager(10);
    this.configurationManager = new HexConfigurationManager(this, hexRootDir + '/hex.yml');
    this.slotManager = new HexSlotManager(6);
    this.nodeManager = new HexNodeManager(this);
    this.healthManager = new HexHealthManager(this);
    this.metricStore = metricStore;
    this.tintManager = new TintManager(this.taskManager, hexRootDir + '/tints.d');

    // -- load the configuration
    this.configurationManager.load();

    // -- register the tasks for the taskmanager
    this.taskManager.register(require('./tasks/update.js'));
    this.taskManager.register(require('./tasks/install_tint.js')( this ));
    this.taskManager.register(require('./tasks/uninstall_tint.js')( this ));
    this.taskManager.register(require('./tasks/restart_containers.js'));
    this.taskManager.register(require('./tasks/dummy.js'));
}

// -- make sure the metric store inherits from the event emitter
util.inherits(Hex, EventEmitter);

/**
 * Attach a node to the hex.
 *
 * @param hexNode   the node to attach
 */
Hex.prototype.attach = function(hexNode) {
    this.nodeManager.attach(hexNode);
};

/**
 * Detach a node from the hex.
 *
 * @param hexNode   the node to detach
 */
Hex.prototype.detach = function(hexNode) {
    this.nodeManager.detach(hexNode);
};

/**
 * Update the hex with the latest version.
 *
 * @returns {*}
 */
Hex.prototype.update = function() {
    return this.taskManager.invoke('update');
};

/**
 * Bootstrap the hex.
 *
 *  Bootstrapping in this case actually means installing the mandatory components for the system to work. A
 *  bootstrap.sh script will be available inside the bigboards runtime directory for this purpose.
 *
 * @param cb    the callback to be called with an error object as well as the result data
 */
Hex.prototype.bootstrap = function(cb) {
    var self = this;

    exec(this.bootstrapScript, function(error, stdout, stderr) {
        if (error) return cb(error, stderr);

        // -- update the init state of the hex
        self.initialized = true;
        self.configurationManager.save();

        return cb(null, stdout);
    });
};

module.exports = Hex;