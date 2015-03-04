var rest = require('restler'),
    URL = require('url'),
    Q = require('q'),
    yaml = require('js-yaml');

module.exports.getDescriptor = function(url) {
    var defer = Q.defer();

    try {
        var ownerAndSlug = getOwnerAndSlug(url);

        rest.get("https://bitbucket.org/" + ownerAndSlug.owner + "/" + ownerAndSlug.slug + "/raw/master/tint.yml")
            .on('complete', function(result) {
                if (result instanceof Error) {
                    defer.reject(result);
                } else {
                    try {
                        defer.resolve(yaml.safeLoad(result));
                    } catch (error) {
                        defer.reject(error);
                    }
                }
            })
            .on('error', function(error) {
                defer.reject(error);
            });
    } catch (error) {
        defer.reject(error);
    }

    return defer.promise;
};

function getOwnerAndSlug(urlString) {
    var url = URL.parse(urlString);

    var parts = url.pathname.split('/');

    return {
        owner: parts[1],
        slug: parts[2]
    };
}