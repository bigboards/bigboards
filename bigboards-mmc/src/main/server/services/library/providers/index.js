module.exports = {
    bitbucket: require('./bitbucket'),
    github: require('./github'),
    git: require('./git'),
    lookup: function(url) {
        if (url.indexof('bitbucket') != -1) return this.bitbucket;
        if (url.indexof('github') != -1) return this.github;
        else return this.git;
    }
};