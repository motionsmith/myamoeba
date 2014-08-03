'use strict';

angular.module('myAmoebaApp')
    .controller('OnboardingCtrl', ['$scope', '$location', '$rootScope', function ($scope, $location, $rootScope) {
        
        if (!$rootScope.sessionUser|| !$rootScope.sessionUser.authenticated()) {
            $location.url('/login');
        }

        if ($rootScope.sessionUser.surname) {
            $location.url('/');
        }

        $scope.onboardingReady = true;
        $scope.surname = $rootScope.sessionUser.lastName;

        $scope.submit = function () {
            $rootScope.sessionUser.surname = $scope.surname;
            $rootScope.sessionUser.save(null, {
                success: function(results) {
                    $location.url('/');
                    $scope.$apply();
                },
                error: function(results, error) {
                    $scope.onboardingStateMessage = error.message;
                }
            })
        };
    }]);