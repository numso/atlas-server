/* global angular */
angular.module('atlas').controller('tokensCtrl',
  function ($scope, $http) {
    'use strict';

    $scope.tokens = [];

    $http.get('/tokens').success(function (data) {
      if (!data.success) {
        $scope.error = data.err;
      } else {
        $scope.tokens = data.tokens || [];
      }
    });

    $scope.generateToken = function (date) {
      $http.post('/generateToken', { date: date }).success(function (data) {
        if (data.success) {
          $scope.tokens.push(data.token);
        }
      });
    };

    $scope.invalidate = function (token, i) {
      $http.post('/invalidateToken', { token: token }).success(function (data) {
        if (!data.success) {
          $scope.error = data.err;
        } else {
          $scope.tokens[i].isValid = false;
        }
      });
    };

    $scope.remove = function (token, i) {
      $http.post('/deleteToken', { token: token }).success(function (data) {
        if (!data.success) {
          $scope.error = data.err;
        } else {
          $scope.tokens.splice(i, 1);
        }
      });
    };

  }
);
