var ApiUtils = require('../../utils/api-utils'),
    Q = require('q');

function HexResource(hexService, serf) {
    this.hexService = hexService;
    this.serf = serf;
}

/**
 * @api {get} /api/v1/hex Request Hex information
 * @apiName GetHex
 * @apiGroup Hex
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

/*********************************************************************************************************************
 * NODES
 *********************************************************************************************************************/

/**
 * @api {get} /api/v1/hex/nodes Request the nodes information
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
 * @apiName GetStacks
 * @apiGroup Hex
 * @apiStructure Stack
 */
HexResource.prototype.listStacks = function(req, res) {
    return ApiUtils.handlePromise(res, this.hexService.listTints('stack'));
};

/**
 * @api {get} /api/v1/hex/stacks/:owner/:tintId Request Stack tint information
 * @apiName GetStack
 * @apiGroup Hex
 * @apiStructure Stack
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
 * @apiName InstallStack
 * @apiGroup Hex
 * @apiStructure Stack
 *
 * @apiParam {String} owner     Tint owner.
 * @apiParam {String} tintId    Tint id.
 * @apiParam {String} uri       URI to the git repo hosting the tint.
 */
HexResource.prototype.installStack = function(req, res) {
    var owner = req.body('owner');
    if (!owner) return res.send(400, 'No owner has been passed!');

    var tintId = req.body('tint');
    if (!tintId) return res.send(400, 'No tintId has been passed!');

    var gitUri = req.body('uri');
    if (!gitUri) return res.send(400, 'No git URI has been passed!');

    return ApiUtils.handlePromise(res, this.hexService.installTint('stack', owner, tintId, gitUri));
};

/**
 * @api {delete} /api/v1/hex/stacks/:owner/:tintId Remove a Stack tint
 * @apiName RemoveStack
 * @apiGroup Hex
 * @apiStructure Stack
 *
 * @apiParam {String} owner     Tint owner.
 * @apiParam {String} tintId    Tint id.
 */
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

/**
 * @api {get} /api/v1/hex/datasets Request the installed datasets
 * @apiName GetDatasets
 * @apiGroup Hex
 * @apiStructure Dataset
 */
HexResource.prototype.listDatasets = function(req, res) {
    return ApiUtils.handlePromise(res, this.hexService.listTints('dataset'));
};

/**
 * @api {get} /api/v1/hex/datasets/:owner/:tintId Request Dataset tint information
 * @apiName GetDataset
 * @apiGroup Hex
 * @apiStructure Dataset
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
 * @apiName InstallDataset
 * @apiGroup Hex
 * @apiStructure Dataset
 *
 * @apiParam {String} owner     Tint owner.
 * @apiParam {String} tintId    Tint id.
 * @apiParam {String} uri       URI to the git repo hosting the tint.
 */
HexResource.prototype.installDataset = function(req, res) {
    var owner = req.body('owner');
    if (!owner) return res.send(400, 'No owner has been passed!');

    var tintId = req.body('tint');
    if (!tintId) return res.send(400, 'No tintId has been passed!');

    var gitUri = req.body('uri');
    if (!gitUri) return res.send(400, 'No git URI has been passed!');

    return ApiUtils.handlePromise(res, this.hexService.installTint('dataset', owner, tintId, gitUri));
};

/**
 * @api {delete} /api/v1/hex/datasets/:owner/:tintId Remove a dataset tint
 * @apiName RemoveDataset
 * @apiGroup Hex
 * @apiStructure Dataset
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
 * @apiName GetTutors
 * @apiGroup Hex
 * @apiStructure Tutor
 */
HexResource.prototype.listTutors = function(req, res) {
    return ApiUtils.handlePromise(res, this.hexService.listTints('tutor'));
};

/**
 * @api {get} /api/v1/hex/tutors/:owner/:tintId Request tutor tint information
 * @apiName GetTutor
 * @apiGroup Hex
 * @apiStructure Tutor
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
 * @apiName InstallTutor
 * @apiGroup Hex
 * @apiStructure Tutor
 *
 * @apiParam {String} owner     Tint owner.
 * @apiParam {String} tintId    Tint id.
 * @apiParam {String} uri       URI to the git repo hosting the tint.
 */
HexResource.prototype.installTutor = function(req, res) {
    var owner = req.body('owner');
    if (!owner) return res.send(400, 'No owner has been passed!');

    var tintId = req.body('tint');
    if (!tintId) return res.send(400, 'No tintId has been passed!');

    var gitUri = req.body('uri');
    if (!gitUri) return res.send(400, 'No git URI has been passed!');

    return ApiUtils.handlePromise(res, this.hexService.installTint('tutor', owner, tintId, gitUri));
};

/**
 * @api {delete} /api/v1/hex/tutors/:owner/:tintId Remove a tutor tint
 * @apiName RemoveTutor
 * @apiGroup Hex
 * @apiStructure Tutor
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