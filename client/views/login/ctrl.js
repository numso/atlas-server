/* global angular */
angular.module('atlas').controller('loginCtrl',
  function ($scope, $http, $state) {
    'use strict';

    $scope.login = function (name, pass) {
      var obj = {
        name: name,
        pass: pass
      };
      $http.post('/login', obj).success(function (data) {
        if (!data.success) {
          $scope.error = data.err;
        } else {
          $state.transitionTo('index');
        }
      });
    };
  }
);
