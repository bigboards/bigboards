'use strict';

/**
 * Config for the router
 */
angular.module('app')
  .run(
    [          '$rootScope', '$state', '$stateParams',
      function ($rootScope,   $state,   $stateParams) {
          $rootScope.$state = $state;
          $rootScope.$stateParams = $stateParams;
      }
    ]
  )
  .config(
    [          '$stateProvider', '$urlRouterProvider',
      function ($stateProvider,   $urlRouterProvider) {

          $urlRouterProvider
              .otherwise('/app/dashboard');
          $stateProvider
              .state('app', {
                  abstract: true,
                  url: '/app',
                  templateUrl: 'app/common/app.html',
                  resolve: {
                      deps: ['$ocLazyLoad',
                          function( $ocLazyLoad){
                              return $ocLazyLoad.load('toaster');
                          }]
                  }
              })
              .state('app.dashboard', {
                  url: '/dashboard',
                  templateUrl: 'app/dashboard/view.html',
                  resolve: {
                    deps: ['$ocLazyLoad', function( $ocLazyLoad ){
                        return $ocLazyLoad.load(['app/dashboard/controllers/dashboard-controller.js']);
                    }]
                  }
              })
              .state('app.library', {
                  url: '/library',
                  templateUrl: 'app/library/view.html',
                  resolve: {
                      deps: ['$ocLazyLoad', function( $ocLazyLoad ){
                          return $ocLazyLoad.load(['app/library/controllers/library-controller.js']);
                      }]
                  }
              })
              .state('app.library-item', {
                  url: '/library/*itemId',
                  templateUrl: 'app/library/detail.html',
                  resolve: {
                      deps: ['$ocLazyLoad', function( $ocLazyLoad ){
                          return $ocLazyLoad.load(['app/library/controllers/library-detail-controller.js']);
                      }]
                  }
              })
              .state('app.node', {
                  url: '/node/:nodeName',
                  templateUrl: 'app/node/view.html',
                  resolve: {
                      deps: ['$ocLazyLoad', function( $ocLazyLoad ){
                          return $ocLazyLoad.load(['app/node/controllers/node-controller.js']);
                      }]
                  }
              })
              .state('app.stack', {
                  url: '/stacks/:owner/:tint',
                  templateUrl: 'app/tint/stack/view.html',
                  resolve: {
                      deps: ['$ocLazyLoad', function( $ocLazyLoad ){
                          return $ocLazyLoad.load(['app/tint/stack/controllers/stack-controller.js']);
                      }]
                  }
              })
      }
    ]
  );