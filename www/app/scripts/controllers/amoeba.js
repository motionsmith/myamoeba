'use strict';

angular.module('myAmoebaApp')
    .controller('AmoebaCtrl', ['$scope', '$location', '$rootScope', 'Amoeba', '$routeParams', function ($scope, $location, $rootScope, Amoeba, $routeParams) {

        $scope.pageReady = false;

        //Get info about this amoeba.
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
        });

        //Get this amoebae's ancestors
        Parse.Cloud.run('getAncestors', {"amoebaId": $routeParams.amoeba}, {
            success: function(result) {
                $scope.ancestors = result.ancestors;
                $scope.$apply();
            },
            error: function(result, error) {
                $scope.amoebaStatusMessage = "Problem getting ancestors: " + error.message;
                $scope.$apply();
            },
        });

        //Get this amoebae's descendents
        Parse.Cloud.run('getOffspring', {"amoebaId": $routeParams.amoeba}, {
            success: function(result) {
                $scope.descendents = result;
                $scope.$apply();
            },
            error: function(result, error) {
                $scope.amoebaStatusMessage = "Problem getting offspring: " + error.message;
                $scope.$apply();
            },
        });
    }]);