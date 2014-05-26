var request = require('request'); // used to post messages to the main console

function PostMan(url, delay, fn) {
    this.url = url;
    this.delay = delay;
    this.fn = fn;

    var self = this;

    setInterval(function() {
        self.fn(function(data) {
            self.postMessage(data);
        });
    }, this.delay);

    console.log('Scheduled this node to send metric information every ' + this.delay + ' ms.')
}

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
        if (error) {
            console.error("Error caught on posting metrics!", error);
        }
        else if (response.statusCode == 200) {
//            console.log("Metrics successfully posted!", body);
        }
        else {
            console.log("Problem posting metrics!", response.statusCode, body);
        }
    });
};

module.exports = PostMan;

