/* global angular */
angular.module('atlas', ['ui.router', 'ui.bootstrap']).config(
  function ($stateProvider, $urlRouterProvider) {
    'use strict';

    $stateProvider.state('login', {
      templateUrl: 'views/login/tmpl.html',
      controller: 'loginCtrl',
      url: '/login'
    });

    $stateProvider.state('index', {
      templateUrl: 'views/index/tmpl.html',
      controller: 'indexCtrl',
      url: '/'
    });

    $stateProvider.state('tokens', {
      templateUrl: 'views/tokens/tmpl.html',
      controller: 'tokensCtrl',
      url: '/tokens'
    });

    $urlRouterProvider.otherwise('/');
  }
);
