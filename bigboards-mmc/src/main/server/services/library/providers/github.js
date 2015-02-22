var rest = require('restler'),
    URL = require('url');

module.exports.getDescriptor = function(url) {
    var defer = Q.defer();

    try {
        var ownerAndSlug = getOwnerAndSlug(url);

        rest.get("https://raw.githubusercontent.com/" + ownerAndSlug.owner + "/" + ownerAndSlug.slug + "/master/tint.yml")
            .on('complete', function(result) {
                if (result instanceof Error) {
                    defer.reject(result);
                } else {
                    defer.resolve(result);
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
        owner: parts[0],
        slug: parts[1]
    };
}