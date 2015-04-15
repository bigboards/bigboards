var ApiUtils = require('../../utils/api-utils'),
    Q = require('q');

function ProfileResource(service) {
    this.service = service;
}
/*********************************************************************************************************************
 * STACKS
 *********************************************************************************************************************/

ProfileResource.prototype.search = function(req, res) {
    return ApiUtils.handlePromise(res, this.service.search(
        req.param('q') + '*',
        ApiUtils.parsePaging(req)
    ));
};

ProfileResource.prototype.get = function(req, res) {
    return ApiUtils.handlePromise(res, this.service.get(req.param['profileId']));
};

ProfileResource.prototype.add = function(req, res) {
    return ApiUtils.handlePromise(res, this.service.add(req.body));
};

ProfileResource.prototype.update = function(req, res) {
    return ApiUtils.handlePromise(res, this.service.update(req.param('profileId'), req.body));
};

ProfileResource.prototype.remove = function(req, res) {
    return ApiUtils.handlePromise(res, this.service.remove(req.param('profileId')));
};

module.exports = ProfileResource;
