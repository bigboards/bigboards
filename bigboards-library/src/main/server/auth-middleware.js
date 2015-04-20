module.exports.auth = function(authService) {
    return function(req, res, next) {
        if (req.path.indexOf('/api') == 0) {
            // -- get the token from the response
            var headerToken = req.header('Authorization');
            if (!headerToken) return res.status(403).send('Not Authenticated');

            var parts = headerToken.split(" ");
            if (parts[0] != 'Bearer') return res.status(403).send('Not Authenticated');

            authService.isAuthenticated(parts[1])
                .then(function(response) {
                    if (response.authenticated === true) {
                        req.profile = response.profile;
                        req.user = response.profile.id;
                        req.token = parts[1];
                        next();
                    } else return res.status(403).send('Not Authenticated');
                }).fail(function(error) {
                    return res.status(403).send(error.message);
                });
        } else {
            next();
        }
    };
};