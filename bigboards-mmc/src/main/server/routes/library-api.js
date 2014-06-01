function LibraryAPI(library) {
    this.library = library;
}

LibraryAPI.prototype.list = function(req, res) {
    this.library.list().then(function(data) {
        return res.send(200, data);
    }, function (err) {
        return res.send(500, err);
    });
};

LibraryAPI.prototype.post = function(req, res) {
    var tintUri = req.body.tintUri;
    if (! tintUri) res.send(400, "No Tint URI has been provided");
    else {
        this.library.add(tintUri).then(function(data) {
            return res.send(200, data);
        }, function (err) {
            return res.send(500, err);
        });
    }
};

LibraryAPI.prototype.remove = function(req, res) {
    var tintId = req.params.tintId;
    if (! tintId) res.send(400, "No Tint ID has been provided");
    else {
        this.library.remove(tintId).then(function(data) {
            return res.send(200, data);
        }, function (err) {
            return res.send(500, err);
        });
    }
};

module.exports = LibraryAPI;