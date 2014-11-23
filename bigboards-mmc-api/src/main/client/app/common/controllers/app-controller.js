'use strict';

/* Controllers */

angular.module('app')
    .controller('AppCtrl', ['$scope', '$localStorage', '$window', 'toaster', 'socket', 'Hex', 'Nodes', 'Tasks', 'Stacks', 'Datasets', 'Tutors',
        function(            $scope,   $localStorage,   $window ,  toaster,   socket,   Hex,   Nodes,   Tasks,   Stacks,   Datasets,   Tutors) {
            // add 'ie' classes to html
            var isIE = !!navigator.userAgent.match(/MSIE/i);
            isIE && angular.element($window.document.body).addClass('ie');
            isSmartDevice( $window ) && angular.element($window.document.body).addClass('smart');

            // config
            $scope.app = {
                name: 'BigBoards',
                version: '2.2.0',
                // for chart colors
                color: {
                    primary: '#7266ba',
                    info:    '#23b7e5',
                    success: '#27c24c',
                    warning: '#fad733',
                    danger:  '#f05050',
                    light:   '#e8eff0',
                    dark:    '#3a3f51',
                    black:   '#1c2b36'
                },
                settings: {
                    themeID: 1,
                    navbarHeaderColor: 'bg-black',
                    navbarCollapseColor: 'bg-white-only',
                    asideColor: 'bg-black',
                    headerFixed: true,
                    asideFixed: false,
                    asideFolded: false,
                    asideDock: false,
                    container: false
                }
            };

            $scope.hex = {
                identity: Hex.identity(),
                metrics: {},
                nodes: Nodes.list(),
                tints: {
                    stack: Stacks.list(),
                    data: Datasets.list(),
                    edu: Tutors.list()
                },
                tasks: Tasks.get()
            };

            socket.on('metrics', function(data) {
                $scope.hex.metrics = data;
            });

            socket.on('task:started', function(task) {
                $scope.current = task;
                toaster.pop('info', 'Task started', 'Started ' + task.description);
            });

            socket.on('task:finished', function(task) {
                $scope.current = null;
                toaster.pop('success', 'Task finished', 'Successfully executed ' + task.description);
            });

            socket.on('task:failed', function(task) {
                $scope.current = null;

                toaster.pop('error', 'Task failed', 'Execution failed of ' + task.description);
            });



            // save settings to local storage
            if ( angular.isDefined($localStorage.settings) ) {
                $scope.app.settings = $localStorage.settings;
            } else {
                $localStorage.settings = $scope.app.settings;
            }
            $scope.$watch('app.settings', function(){
                if( $scope.app.settings.asideDock  &&  $scope.app.settings.asideFixed ){
                    // aside dock and fixed must set the header fixed.
                    $scope.app.settings.headerFixed = true;
                }
                // save to local storage
                $localStorage.settings = $scope.app.settings;
            }, true);

            // angular translate
//      $scope.lang = { isopen: false };
//      $scope.langs = {en:'English', de_DE:'German', it_IT:'Italian'};
//      $scope.selectLang = $scope.langs[$translate.proposedLanguage()] || "English";
//      $scope.setLang = function(langKey, $event) {
//        // set the current lang
//        $scope.selectLang = $scope.langs[langKey];
//        // You can change the language during runtime
//        $translate.use(langKey);
//        $scope.lang.isopen = !$scope.lang.isopen;
//      };

            function isSmartDevice( $window )
            {
                // Adapted from http://www.detectmobilebrowsers.com
                var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
                // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
                return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
            }

        }]);
