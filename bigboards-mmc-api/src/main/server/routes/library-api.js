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
    this.library.refresh().then(function(data) {
        return res.send(200, data);
    }, function (err) {
        return res.send(500, err);
    });
};

module.exports = LibraryAPI;