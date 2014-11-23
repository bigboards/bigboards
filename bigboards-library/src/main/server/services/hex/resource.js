var ApiUtils = require('../../utils/api-utils');

function HexResource(hexService) {
    this.hexService = hexService;
}

HexResource.prototype.get = function(req, res) {
    return ApiUtils.handlePromise(res, this.hexService.get());
};

/*********************************************************************************************************************
 * STACKS
 *********************************************************************************************************************/
HexResource.prototype.listStacks = function(req, res) {
    return ApiUtils.handlePromise(res, this.hexService.listTints('stack'));
};

HexResource.prototype.getStack = function(req, res) {
    var owner = req.param('owner');
    if (!owner) return res.send(400, 'No owner has been passed!');

    var tintId = req.param('tintId');
    if (!tintId) return res.send(400, 'No tintId has been passed!');

    return ApiUtils.handlePromise(res, this.hexService.getTint('stack', owner, tintId));
};

//HexResource.prototype.installStack = function(req, res) {
//    var gitUri = req.body('uri');
//    if (!owner) return res.send(400, 'No owner has been passed!');
//
//    var tintId = req.param('tintId');
//    if (!tintId) return res.send(400, 'No tintId has been passed!');
//
//    return ApiUtils.handlePromise(res, this.hexService.installTint('stack'));
//};

HexResource.prototype.removeStack = function(req, res) {
    var owner = req.param('owner');
    if (!owner) return res.send(400, 'No owner has been passed!');

    var tintId = req.param('tintId');
    if (!tintId) return res.send(400, 'No tintId has been passed!');

    return ApiUtils.handlePromise(res, this.hexService.removeTint('stack', owner, tintId));
};

/*********************************************************************************************************************
 * DATASETS
 *********************************************************************************************************************/

HexResource.prototype.listDatasets = function(req, res) {
    return ApiUtils.handlePromise(res, this.hexService.listTints('dataset'));
};

HexResource.prototype.getDataset = function(req, res) {
    var owner = req.param('owner');
    if (!owner) return res.send(400, 'No owner has been passed!');

    var tintId = req.param('tintId');
    if (!tintId) return res.send(400, 'No tintId has been passed!');

    return ApiUtils.handlePromise(res, this.hexService.getTint('dataset', owner, tintId));
};

HexResource.prototype.removeDataset = function(req, res) {
    var owner = req.param('owner');
    if (!owner) return res.send(400, 'No owner has been passed!');

    var tintId = req.param('tintId');
    if (!tintId) return res.send(400, 'No tintId has been passed!');

    return ApiUtils.handlePromise(res, this.hexService.removeTint('dataset', owner, tintId));
};

/*********************************************************************************************************************
 * TUTORS
 *********************************************************************************************************************/

HexResource.prototype.listTutors = function(req, res) {
    return ApiUtils.handlePromise(res, this.hexService.listTints('tutor'));
};

HexResource.prototype.getTutor = function(req, res) {
    var owner = req.param('owner');
    if (!owner) return res.send(400, 'No owner has been passed!');

    var tintId = req.param('tintId');
    if (!tintId) return res.send(400, 'No tintId has been passed!');

    return ApiUtils.handlePromise(res, this.hexService.getTint('tutor', owner, tintId));
};

HexResource.prototype.removeTutor = function(req, res) {
    var owner = req.param('owner');
    if (!owner) return res.send(400, 'No owner has been passed!');

    var tintId = req.param('tintId');
    if (!tintId) return res.send(400, 'No tintId has been passed!');

    return ApiUtils.handlePromise(res, this.hexService.removeTint('tutor', owner, tintId));
};

module.exports = HexResource;