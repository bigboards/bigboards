var ApiUtils = require('../../utils/api-utils'),
    Q = require('q');

function TutorialResource(tutorialService) {
    this.tutorialService = tutorialService;
}
/*********************************************************************************************************************
 * STACKS
 *********************************************************************************************************************/

TutorialResource.prototype.list = function(req, res) {
    return ApiUtils.handlePromise(res, this.tutorialService.list());
};

TutorialResource.prototype.get = function(req, res) {
    var owner = req.param('owner');
    if (!owner) return res.send(400, 'No owner has been passed!');

    var slug = req.param('slug');
    if (!slug) return res.send(400, 'No slug has been passed!');

    return ApiUtils.handlePromise(res, this.tutorialService.get(owner, slug));
};

TutorialResource.prototype.getChapter = function(req, res) {
    var owner = req.params[0];
    if (!owner) return res.send(400, 'No owner has been passed!');

    var slug = req.params[1];
    if (!slug) return res.send(400, 'No slug has been passed!');

    var path = req.params[2];
    if (!path) return res.send(400, 'No resource has been passed!');
    path = path.split('/');

    return ApiUtils.handlePromise(res, this.tutorialService.getChapter(owner, slug, path));
};

module.exports = TutorialResource;
