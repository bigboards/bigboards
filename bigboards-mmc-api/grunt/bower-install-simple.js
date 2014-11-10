module.exports = {
    options: {
        interactive: false,
        color: false,
        directory: 'src/main/client/bower_components'
    },
    "prod": {
        options: {
            production: true
        }
    },
    "dev": {
        options: {
            production: false
        }
    }
};
