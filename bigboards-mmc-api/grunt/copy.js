module.exports = {
    dev: {
        nonull: true,
        files: [
            // Include our bower JS dependencies

            // angular
            {src: "main/client/bower_components/angular/angular.js", dest: "src/vendor/angular/angular.js"},
            {src: "main/client/bower_components/angular-animate/angular-animate.js", dest: "src/vendor/angular/angular-animate/angular-animate.js"},
            {src: "main/client/bower_components/angular-cookies/angular-cookies.js", dest: "src/vendor/angular/angular-cookies/angular-cookies.js"},
            {src: "main/client/bower_components/angular-resource/angular-resource.js", dest: "src/vendor/angular/angular-resource/angular-resource.js"},
            {src: "main/client/bower_components/angular-sanitize/angular-sanitize.js", dest: "src/vendor/angular/angular-sanitize/angular-sanitize.js"},
            {src: "main/client/bower_components/angular-touch/angular-touch.js", dest: "src/vendor/angular/angular-touch/angular-touch.js"},
          
            // bootstrap
            {src: "main/client/bower_components/bootstrap/dist/css/bootstrap.css", dest: "src/css/bootstrap.css"},
            {src: "main/client/bower_components/bootstrap/dist/js/bootstrap.js", dest: "src/vendor/jquery/bootstrap.js"},
            {src: "**", dest: "src/fonts", cwd: 'main/client/bower_components/bootstrap/fonts', expand : true},

            // fontawesome
            {src: "main/client/bower_components/font-awesome/css/font-awesome.min.css", dest: "src/css/font-awesome.min.css"},
            {src: "**", dest: "src/fonts", cwd: 'main/client/bower_components/font-awesome/fonts', expand : true},

            // libs
            {src: "main/client/bower_components/moment/min/moment.min.js", dest: "src/vendor/libs/moment.min.js"},
            {src: "main/client/bower_components/screenfull/dist/screenfull.min.js", dest: "src/vendor/libs/screenfull.min.js"},

            // core
            {src: "main/client/bower_components/angular-ui-router/release/angular-ui-router.js", dest: "src/vendor/angular/angular-ui-router/angular-ui-router.js"},
            {src: "main/client/bower_components/angular-bootstrap/ui-bootstrap-tpls.js", dest: "src/vendor/angular/angular-bootstrap/ui-bootstrap-tpls.js"},
            {src: "main/client/bower_components/angular-translate/angular-translate.js", dest: "src/vendor/angular/angular-translate/angular-translate.js"},
            {src: "main/client/bower_components/angular-ui-utils/ui-utils.js", dest: "src/vendor/angular/angular-ui-utils/ui-utils.js"},
            {src: "main/client/bower_components/ngstorage/ngStorage.js", dest: "src/vendor/angular/ngstorage/ngStorage.js"},
            {src: "main/client/bower_components/oclazyload/dist/ocLazyLoad.js", dest: "src/vendor/angular/oclazyload/ocLazyLoad.js"},

            // modules for lazy load
            {src: "main/client/bower_components/angular-ui-select/dist/select.min.js", dest: "src/vendor/modules/angular-ui-select/select.min.js"},
            {src: "main/client/bower_components/angular-ui-select/dist/select.min.css", dest: "src/vendor/modules/angular-ui-select/select.min.css"},

            {src: "main/client/bower_components/textAngular/dist/textAngular.min.js", dest: "src/vendor/modules/textAngular/textAngular.min.js"},
            {src: "main/client/bower_components/textAngular/dist/textAngular-sanitize.min.js", dest: "src/vendor/modules/textAngular/textAngular-sanitize.min.js"},

            {src: "main/client/bower_components/venturocket-angular-slider/build/angular-slider.min.js", dest: "src/vendor/modules/angular-slider/angular-slider.min.js"},
            
            {src: "main/client/bower_components/angular-bootstrap-nav-tree/dist/abn_tree_directive.js", dest: "src/vendor/modules/angular-bootstrap-nav-tree/abn_tree_directive.js"},
            {src: "main/client/bower_components/angular-bootstrap-nav-tree/dist/abn_tree.css", dest: "src/vendor/modules/angular-bootstrap-nav-tree/abn_tree.css"},

            {src: "main/client/bower_components/angular-file-upload/angular-file-upload.min.js", dest: "src/vendor/modules/angular-file-upload/angular-file-upload.min.js"},

            {src: "main/client/bower_components/ngImgCrop/compile/minified/ng-img-crop.js", dest: "src/vendor/modules/ngImgCrop/ng-img-crop.js"},
            {src: "main/client/bower_components/ngImgCrop/compile/minified/ng-img-crop.css", dest: "src/vendor/modules/ngImgCrop/ng-img-crop.css"},

            {src: "main/client/bower_components/angular-ui-map/ui-map.js", dest: "src/vendor/modules/angular-ui-map/ui-map.js"},

            {src: "main/client/bower_components/angularjs-toaster/toaster.js", dest: "src/vendor/modules/angularjs-toaster/toaster.js"},
            {src: "main/client/bower_components/angularjs-toaster/toaster.css", dest: "src/vendor/modules/angularjs-toaster/toaster.css"},

            {src: "main/client/bower_components/ng-grid/build/ng-grid.min.js", dest: "src/vendor/modules/ng-grid/ng-grid.min.js"},
            {src: "main/client/bower_components/ng-grid/ng-grid.min.css", dest: "src/vendor/modules/ng-grid/ng-grid.min.css"},

        ]
    },
    dist: {
        files: [
            {expand: true, dest: 'dist/', src:'**', cwd:'src/main/client'},
            {dest: 'dist/index.html', src:'src/main/client/index.min.html'}
        ]
    }
};
