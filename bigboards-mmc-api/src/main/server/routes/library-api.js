function LibraryAPI(library) {
    this.library = library;
}

LibraryAPI.prototype.get = function(req, res) {
    var tintId = req.param('tintId');
    if (! tintId) return res.send(400, "No Node name has been provided");

    this.library.get(tintId).then(function(data) {
        return res.send(200, data);
    }, function (err) {
        return res.send(500, err);
    });
};

LibraryAPI.prototype.list = function(req, res) {
    this.library.list().then(function(data) {
        return res.send(200, data);
    }, function (err) {
        return res.send(500, err);
    });
};

LibraryAPI.prototype.post = function(req, res) {
    this.library.refresh().then(function(data) {
        return res.send(200, data);
    }, function (err) {
        return res.send(500, err);
    });
};

module.exports = LibraryAPI;