module.exports = {
  dist:{
    src:[
      'src/main/client/vendor/jquery/jquery.min.js',
      'src/main/client/vendor/angular/angular.js',
      'src/main/client/vendor/angular/**/*.js',
      'src/main/client/js/*.js',
      'src/main/client/js/directives/*.js',
      'src/main/client/js/services/*.js',
      'src/main/client/js/filters/*.js',
      'src/main/client/js/controllers/bootstrap.js'
    ],
    dest:'dist/js/dist.js'
  }
}
