var winston = require('winston'),
    Q = require('q');

function PostMan(nodeService, node, serfer, delay, containers) {
    this.nodeService = nodeService;
    this.delay = delay;
    this.serfer = serfer;
    this.node = node;

    this.containers = containers;

    this.intervalHandle = null;
}

PostMan.prototype.startDelivery = function() {
    if (this.intervalHandle) return;

    var self = this;

    this.intervalHandle = setInterval(function() {
        self.containers.forEach(function(container) {
            Q(container.fn(self.nodeService)).then(function(value) {
                if (container.previous || container.previous != value) {
                    container.previous = value;
                    var payload = {node: self.node, metric: container.metric, value: value};

                    self.serfer.userEvent('metric', JSON.stringify(payload), false);
                }
            });
        });
    }, this.delay);

    winston.info('Started delivering metrics every ' + this.delay + ' ms.')
};

PostMan.prototype.stopDelivery = function() {
    if (! this.intervalHandle) return;

    clearInterval(this.intervalHandle);
    this.intervalHandle = null;

    winston.info('Stopped delivering');
};

module.exports = PostMan;

