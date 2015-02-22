var ApiUtils = require('../../utils/api-utils'),
    Q = require('q');

function HexResource(hexService, serf) {
    this.hexService = hexService;
    this.serf = serf;
}

/**
 * @api {get} /api/v1/hex Request Hex information
 * @apiVersion 1.0.5
 *
 * @apiName GetHex
 * @apiGroup Hex
 * @apiGroupDescription all APIs to fully control your Hex
 *
 * @apiSuccess {String} id      Unique id of the hex.
 * @apiSuccess {String} name    Name of the hex.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         "id": "cced64d1-1b52-471c-92fe-cca09d8c53e6",
 *         "name": "alice"
 *     }
 */
HexResource.prototype.get = function(req, res) {
    return ApiUtils.handlePromise(res, this.hexService.get());
};

/**
 * @api {delete} /api/v1/hex Prepare the hex for power down.
 * @apiVersion 1.0.5
 *
 * @apiName PowerDownHex
 * @apiGroup Hex
 * @apiGroupDescription all APIs to fully control your Hex
 */
HexResource.prototype.powerdown = function(req, res) {
    return ApiUtils.handlePromise(res, this.hexService.powerdown());
};

/*********************************************************************************************************************
 * NODES
 *********************************************************************************************************************/

/**
 * @api {get} /api/v1/hex/nodes Request the nodes information
 * @apiVersion 1.0.5
 *
 * @apiName GetNodes
 * @apiGroup Hex
 */
HexResource.prototype.listNodes = function(req, res) {
    return ApiUtils.handlePromise(res, this.hexService.listNodes());
};

/*********************************************************************************************************************
 * STACKS
 *********************************************************************************************************************/
/**
 * @api {get} /api/v1/hex/stacks Request the installed stacks
 * @apiVersion 1.0.5
 *
 * @apiName GetStacks
 * @apiGroup HexStack
 * @apiGroupDescription Control the stack tints of your Hex.
 */
HexResource.prototype.listStacks = function(req, res) {
    return ApiUtils.handlePromise(res, this.hexService.listTints('stack'));
};

/**
 * @api {get} /api/v1/hex/stacks/:owner/:tintId Request Stack tint information
 * @apiVersion 1.0.5
 *
 * @apiName GetStack
 * @apiGroup HexStack
 *
 * @apiParam {String} owner     Tint owner.
 * @apiParam {String} tintId    Tint id.
 */
HexResource.prototype.getStack = function(req, res) {
    var owner = req.param('owner');
    if (!owner) return res.send(400, 'No owner has been passed!');

    var tintId = req.param('tintId');
    if (!tintId) return res.send(400, 'No tintId has been passed!');

    return ApiUtils.handlePromise(res, this.hexService.getTint('stack', owner, tintId));
};

/**
 * @api {post} /api/v1/hex/stacks Install a stack tint
 * @apiVersion 1.0.5
 *
 * @apiName InstallStack
 * @apiGroup HexStack
 *
 * @apiParam {String} owner     Tint owner.
 * @apiParam {String} tintId    Tint id.
 * @apiParam {String} uri       URI to the git repo hosting the tint.
 */
HexResource.prototype.installStack = function(req, res) {
    var tint = req.body.tint;
    if (! ApiUtils.isTint(tint)) return res.send(400, 'No valid tint has been passed!');

    return ApiUtils.handlePromise(res, this.hexService.installTint(tint));
};

/**
 * @api {delete} /api/v1/hex/stacks/:owner/:tintId Remove a Stack tint
 * @apiVersion 1.0.5
 *
 * @apiName RemoveStack
 * @apiGroup HexStack
 *
 * @apiParam {String} owner     Tint owner.
 * @apiParam {String} tintId    Tint id.
 */
HexResource.prototype.removeStack = function(req, res) {
    var owner = req.param('owner');
    if (!owner) return res.send(400, 'No owner has been passed!');

    var tintId = req.param('tintId');
    if (!tintId) return res.send(400, 'No tintId has been passed!');

    return ApiUtils.handlePromise(res, this.hexService.removeTint({
        type: 'stack',
        owner: owner,
        id: tintId
    }));
};

/*********************************************************************************************************************
 * DATASETS
 *********************************************************************************************************************/

/**
 * @api {get} /api/v1/hex/datasets Request the installed datasets
 * @apiVersion 1.0.5
 *
 * @apiName GetDatasets
 * @apiGroup HexDataset
 * @apiGroupDescription Control the dataset tints of your Hex.
 */
HexResource.prototype.listDatasets = function(req, res) {
    return ApiUtils.handlePromise(res, this.hexService.listTints('dataset'));
};

/**
 * @api {get} /api/v1/hex/datasets/:owner/:tintId Request Dataset tint information
 * @apiVersion 1.0.5
 *
 * @apiName GetDataset
 * @apiGroup HexDataset
 *
 * @apiParam {String} owner     Tint owner.
 * @apiParam {String} tintId    Tint id.
 */
HexResource.prototype.getDataset = function(req, res) {
    var owner = req.param('owner');
    if (!owner) return res.send(400, 'No owner has been passed!');

    var tintId = req.param('tintId');
    if (!tintId) return res.send(400, 'No tintId has been passed!');

    return ApiUtils.handlePromise(res, this.hexService.getTint('dataset', owner, tintId));
};

/**
 * @api {post} /api/v1/hex/datasets Install a dataset tint
 * @apiVersion 1.0.5
 *
 * @apiName InstallDataset
 * @apiGroup HexDataset
 *
 * @apiParam {String} owner     Tint owner.
 * @apiParam {String} tintId    Tint id.
 * @apiParam {String} uri       URI to the git repo hosting the tint.
 */
HexResource.prototype.installDataset = function(req, res) {
    var tint = req.body('tint');
    if (! ApiUtils.isTint(tint)) return res.send(400, 'No valid tint has been passed!');

    return ApiUtils.handlePromise(res, this.hexService.installTint(tint));
};

/**
 * @api {delete} /api/v1/hex/datasets/:owner/:tintId Remove a dataset tint
 * @apiVersion 1.0.5
 *
 * @apiName RemoveDataset
 * @apiGroup HexDataset
 *
 * @apiParam {String} owner     Tint owner.
 * @apiParam {String} tintId    Tint id.
 */
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

/**
 * @api {get} /api/v1/hex/tutors Request the installed tutor tints
 * @apiVersion 1.0.5
 *
 * @apiName GetTutors
 * @apiGroup HexTutor
 */
HexResource.prototype.listTutors = function(req, res) {
    return ApiUtils.handlePromise(res, this.hexService.listTints('tutor'));
};

/**
 * @api {get} /api/v1/hex/tutors/:owner/:tintId Request tutor tint information
 * @apiVersion 1.0.5
 *
 * @apiName GetTutor
 * @apiGroup HexTutor
 * @apiGroupDescription Control the tutorial tints of your Hex.
 *
 * @apiParam {String} owner     Tint owner.
 * @apiParam {String} tintId    Tint id.
 */
HexResource.prototype.getTutor = function(req, res) {
    var owner = req.param('owner');
    if (!owner) return res.send(400, 'No owner has been passed!');

    var tintId = req.param('tintId');
    if (!tintId) return res.send(400, 'No tintId has been passed!');

    return ApiUtils.handlePromise(res, this.hexService.getTint('tutor', owner, tintId));
};

/**
 * @api {post} /api/v1/hex/tutors Install a tutor tint
 * @apiVersion 1.0.5
 *
 * @apiName InstallTutor
 * @apiGroup HexTutor
 *
 * @apiParam {String} owner     Tint owner.
 * @apiParam {String} tintId    Tint id.
 * @apiParam {String} uri       URI to the git repo hosting the tint.
 */
HexResource.prototype.installTutor = function(req, res) {
    var tint = req.body('tint');
    if (! ApiUtils.isTint(tint)) return res.send(400, 'No valid tint has been passed!');

    return ApiUtils.handlePromise(res, this.hexService.installTint(tint));
};

/**
 * @api {delete} /api/v1/hex/tutors/:owner/:tintId Remove a tutor tint
 * @apiVersion 1.0.5
 *
 * @apiName RemoveTutor
 * @apiGroup HexTutor
 *
 * @apiParam {String} owner     Tint owner.
 * @apiParam {String} tintId    Tint id.
 */
HexResource.prototype.removeTutor = function(req, res) {
    var owner = req.param('owner');
    if (!owner) return res.send(400, 'No owner has been passed!');

    var tintId = req.param('tintId');
    if (!tintId) return res.send(400, 'No tintId has been passed!');

    return ApiUtils.handlePromise(res, this.hexService.removeTint('tutor', owner, tintId));
};

module.exports = HexResource;
