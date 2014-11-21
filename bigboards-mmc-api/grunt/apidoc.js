module.exports = {
    'mmc-api': {
        'src': 'src/main/server/services',
        'dest': 'target/apidoc/',
        'options': {
            'debug': true,
            'includeFilters': [ "resource\\.js$" ],
            'excludeFilters': [ "node_modules/" ],
            'marked': {
                'gfm': true
            }
        }
    }
};

