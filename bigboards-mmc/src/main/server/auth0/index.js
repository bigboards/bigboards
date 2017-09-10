var request = require('request');
var Q = require('q');
var jwt = require('jsonwebtoken');

module.exports = {
    user: {
        updateMetadata: updateMetadata,
        get: getUser
    },
    token: {
        blacklist: blacklistToken
    }
};

function blacklistToken(token) {
    var decodedToken = jwt.decode(token);

    var defer = Q.defer();

    var uri = 'https://bigboards.auth0.com:443/api/v2/blacklist/tokens';
    var options = {
        method: 'POST',
        headers: {
            'Authorization': "Bearer " + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ aud: decodedToken.aud, jti: decodedToken.jti })
    };

    request(uri, options, function(error, response, body) {
        if (error) return defer.reject(error);

        if (response.statusCode == 200) defer.resolve(JSON.parse(body));
        else defer.reject(body);
    });

    return defer.promise;
}

function getUser(token) {
    var decodedToken = jwt.decode(token);

    // -- link the device to the profile. We can do this by calling auth0 and adding it to the metadata. I think we
    // -- should make use of a dedicated api from auth0 for this but I don't find any documentation about that yet.
    // -- look at https://github.com/auth0/docs/issues/416 for that.
    var defer = Q.defer();

    var uri = 'https://bigboards.auth0.com:443/api/v2/users/' + decodedToken.sub;
    var options = {
        method: 'GET',
        headers: {
            'Authorization': "Bearer " + token,
            'Content-Type': 'application/json'
        }
    };

    request(uri, options, function(error, response, body) {
        if (error) return defer.reject(error);

        if (response.statusCode == 200) defer.resolve(JSON.parse(body));
        else defer.reject(body);
    });

    return defer.promise;
}

function updateMetadata(token, metadata) {
    var decodedToken = jwt.decode(token);

    // -- link the device to the profile. We can do this by calling auth0 and adding it to the metadata. I think we
    // -- should make use of a dedicated api from auth0 for this but I don't find any documentation about that yet.
    // -- look at https://github.com/auth0/docs/issues/416 for that.
    var defer = Q.defer();

    var uri = 'https://bigboards.auth0.com:443/api/v2/users/' + decodedToken.sub;
    var options = {
        method: 'PATCH',
        headers: {
            'Authorization': "Bearer " + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ app_metadata: metadata })
    };

    request(uri, options, function(error, response, body) {
        if (error) return defer.reject(error);

        if (response.statusCode == 200) defer.resolve(JSON.parse(body));
        else defer.reject(body);
    });

    return defer.promise;
}
