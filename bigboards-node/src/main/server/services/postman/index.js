var request = require('request'),
    winston = require('winston'),
    Q = require('q');

function PostMan(delay, fn) {
    this.url = null;
    this.delay = delay;
    this.fn = fn;

    this.intervalHandle = null;
}

PostMan.prototype.startDelivery = function(url) {
    this.url = url;

    if (this.intervalHandle) return;

    var self = this;

    this.intervalHandle = setInterval(function() {
        Q(self.fn).then(function(data) {
            self.postMessage(data);
        });
    }, this.delay);

    winston.info('Started delivering every ' + this.delay + ' ms.')
};

PostMan.prototype.stopDelivery = function() {
    if (! this.intervalHandle) return;

    clearInterval(this.intervalHandle);

    winston.info('Stopped delivering');
};

/**
 * Function that actually post any message to a uri.
 *
 * @param message what to post
 */
PostMan.prototype.postMessage = function(message) {
    var requestMessage = {
        uri: this.url,
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(message)
    };

    request.post(requestMessage, function (error, response, body) {
        // -- todo: change this to error level
        if (error) return winston.log('info', "Error caught on posting metrics!", error);

        if (response.statusCode != 200)
            // -- todo: change this to warning level
            winston.log('info', "Problem posting metrics!", response.statusCode, body);

    });
};

module.exports = PostMan;

