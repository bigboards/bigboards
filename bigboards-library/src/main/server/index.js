var express = require('express');
var bodyParser     = require('body-parser');
var errorHandler   = require('error-handler');
var elasticsearch = require('elasticsearch');
var AuthMiddleware = require('./auth-middleware');
var winston = require('winston');

/* -- Configuration -- */
var Config = require('./config').lookupEnvironment();

/* -- Storage -- */
var storage = require('./storage')(
    new elasticsearch.Client(Config.elasticsearch),
    'bigboards-library'
);

/* -- Services -- */
var Auth = require('./services/auth');
var Profile = require('./services/profile');

var services = {};
services.Profile = new Profile.Service(storage);
services.Auth = new Auth.Service(storage);

/* -- Security -- */
var passport = require('passport');
passport.serializeUser(function(user, done) { done(null, user); });
passport.deserializeUser(function(obj, done) { done(null, obj); });

var BitbucketStrategy = require('passport-bitbucket').Strategy;
passport.use(new BitbucketStrategy(Config.oauth.bitbucket,
    function(token, tokenSecret, profile, done) {
        services.Profile.getOrAdd({ bitbucketId: profile.username }, function (err, user) {
            return done(err, user);
        });

        var profileId = profile.username;
        var profileData = {
            username: profile.username,
            name: profile.display_name,
            origin: 'bitbucket'
        };

        services.Auth.login(profileId, token, profileData)
            .then(function(user) { return done(null, user); })
            .fail(function(error) { return done(error, null); });
    }
));

var GitHubStrategy = require('passport-github').Strategy;
passport.use(new GitHubStrategy(Config.oauth.github,
    function(accessToken, refreshToken, profile, done) {
        var profileId = profile.id;
        var profileData = {
            username: profile.id,
            name: profile.name,
            email: profile.email,
            bio: profile.bio,
            avatar_url: profile.avatar_url,
            gravatar_id: profile.gravatar_id,
            origin: 'github'
        };

        services.Auth.login(profileId, accessToken, profileData)
            .then(function(user) { return done(null, user); })
            .fail(function(error) { return done(error, null); });
    }
));

var app = express();
app.use(passport.initialize());
app.use(AuthMiddleware.auth(services.Auth));
app.use(express.static(__dirname + '/client'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(errorHandler);

Auth.link(app, services, passport);
Profile.link(app, services, passport);

app.listen(Config.port, function () {
    winston.info();
    winston.info('BigBoards library listening on port ' + Config.port);
    winston.info();
});
