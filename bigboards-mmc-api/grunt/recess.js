module.exports = {
	app: {
        files: {
          'src/main/client/css/app.css': [
            'src/main/client/css/less/app.less'
          ]
        },
        options: {
          compile: true
        }
    },
    min: {
        files: {
            'dist/css/app.min.css': [
                'src/main/client/css/bootstrap.css',
                'src/main/client/css/*.css'
            ]
        },
        options: {
            compress: true
        }
    }
}
