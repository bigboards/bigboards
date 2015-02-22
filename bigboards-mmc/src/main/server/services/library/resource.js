var ApiUtils = require('../../utils/api-utils');

function LibraryResource(libraryService) {
    this.libraryService = libraryService;
}

LibraryResource.prototype.refresh = function(req, res) {
    return ApiUtils.handlePromise(res, this.libraryService.refresh());
};

LibraryResource.prototype.listTintsForType = function(req, res) {
    var type = req.param('type');
    if (!type) return res.send(400, 'No type has been passed!');

    return ApiUtils.handlePromise(res, this.libraryService.listTintsForType(type));
};

LibraryResource.prototype.listTintsForOwner = function(req, res) {
    var type = req.param('type');
    if (!type) return res.send(400, 'No type has been passed!');

    var owner = req.param('owner');
    if (!owner) return res.send(400, 'No owner has been passed!');

    return ApiUtils.handlePromise(res, this.libraryService.listTintsForOwner(type, owner));
};

LibraryResource.prototype.getTint = function(req, res) {
    var type = req.param('type');
    if (!type) return res.send(400, 'No type has been passed!');

    var owner = req.param('owner');
    if (!owner) return res.send(400, 'No owner has been passed!');

    var tintId = req.param('tintId');
    if (!tintId) return res.send(400, 'No tintId has been passed!');

    return ApiUtils.handlePromise(res, this.libraryService.getTint(type, owner, tintId));
};

LibraryResource.prototype.createTint = function(req, res) {
    var url = req.body.url;
    if (!url) return res.send(400, 'No url has been passed!');

    return ApiUtils.handlePromise(res, this.libraryService.addTint(url));
};

LibraryResource.prototype.removeTint = function(req, res) {
    var type = req.param('type');
    if (!type) return res.send(400, 'No type has been passed!');

    var owner = req.param('owner');
    if (!owner) return res.send(400, 'No owner has been passed!');

    var tintId = req.param('tintId');
    if (!tintId) return res.send(400, 'No tintId has been passed!');

    return ApiUtils.handlePromise(res, this.libraryService.removeTint(type, owner, tintId));
};

module.exports = LibraryResource;