function BootstrapAPI(hex) {
    this.hex = hex;
}

BootstrapAPI.prototype.post = function(req, res) {
    // -- Bootstrap the hex
    this.hex.bootstrap(function (err, data) {
        if (err) return res.send(500, err);

        return res.send(200, data);
    });
};

module.exports = BootstrapAPI;