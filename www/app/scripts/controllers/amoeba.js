'use strict';

angular.module('myAmoebaApp')
    .controller('AmoebaCtrl', ['$scope', '$location', '$rootScope', 'Amoeba', '$routeParams', function ($scope, $location, $rootScope, Amoeba, $routeParams) {

        $scope.pageReady = false;

        var amoebaQuery = new Parse.Query(Amoeba);
        amoebaQuery.equalTo('objectId', $routeParams.amoeba);
        amoebaQuery.include('owner');
        amoebaQuery.include('parentA');
        amoebaQuery.include('parentB');
        amoebaQuery.include('breeder');
        amoebaQuery.first({
            success: function(result) {
                $scope.amoeba = result;
                $scope.pageReady = true;
                $scope.$apply();
            },
            error: function (result, error) {
                $scope.amoebaStatusMessage = "A problem happened: " + error.message;
                $scope.$apply();
            }
        })
    }]);