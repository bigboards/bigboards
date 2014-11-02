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
                  templateUrl: 'tpl/app.html'
              })
              .state('app.dashboard', {
                  url: '/dashboard',
                  templateUrl: 'tpl/app_dashboard.html',
                  resolve: {
                    deps: ['$ocLazyLoad',
                      function( $ocLazyLoad ){
                        return $ocLazyLoad.load(['js/controllers/chart.js']);
                    }]
                  }
              })
              .state('app.library', {
                  url: '/library',
                  templateUrl: 'tpl/app_library.html'
              })
              .state('app.node', {
                  url: '/node/:nodeName',
                  templateUrl: 'tpl/app_node.html',
                  controller: 'NodeCtrl'
              })
              .state('app.tint', {
                  url: '/tint/:type/*tintId',
                  templateUrl: 'tpl/app_tint.html',
                  controller: 'TintCtrl'
              })
      }
    ]
  );