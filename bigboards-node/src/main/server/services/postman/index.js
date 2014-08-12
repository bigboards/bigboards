var request = require('request'),
    winston = require('winston'),
    Q = require('q');

function PostMan(nodeService, node, delay, containers) {
    this.nodeService = nodeService;
    this.node = node;
    this.url = null;
    this.delay = delay;

    this.containers = containers;

    this.intervalHandle = null;
}

PostMan.prototype.startDelivery = function(url) {
    this.url = url;

    if (this.intervalHandle) return;

    var self = this;

    this.intervalHandle = setInterval(function() {
        self.containers.forEach(function(container) {
            Q(container.fn(self.nodeService)).then(function(value) {
                if (container.previous || container.previous != value) {
                    container.previous = value;
                    self.postMessage(container.metric, value);
                }
            });

        });
    }, this.delay);

    winston.info('Started delivering every ' + this.delay + ' ms. to ' + url)
};

PostMan.prototype.stopDelivery = function() {
    if (! this.intervalHandle) return;

    clearInterval(this.intervalHandle);
    this.intervalHandle = null;

    winston.info('Stopped delivering');
};

/**
 * Function that actually post any message to a uri.
 *
 * @param metric the metric to post
 * @param value what to post
 */
PostMan.prototype.postMessage = function(metric, value) {
    try {
        var requestMessage = {
            uri: this.url + '/' + this.node + '/' + metric,
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({ "data": value })
        };

        request.post(requestMessage, function (error, response, body) {
            // -- todo: change this to error level
            if (error) return winston.log('info', "Error caught on posting metrics!", error);

            if (response.statusCode != 200)
            // -- todo: change this to warning level
                winston.log('info', "Problem posting metrics!", response.statusCode, body);

        });
    } catch (error) {
        winston.info('Unable to post value ' + value + ' for metric ' + metric);
    }
};

module.exports = PostMan;

