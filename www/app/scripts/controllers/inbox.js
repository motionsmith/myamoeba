'use strict';

angular.module('myAmoebaApp')
    .controller('InboxCtrl', ['$scope', '$location', '$rootScope', 'Amoeba', function ($scope, $location, $rootScope, Amoeba) {
        
        $scope.accept = function (index) {
            var acceptedAmoeba = $scope.incomingAmoebae[index];
            acceptedAmoeba.owner = $rootScope.sessionUser;
            acceptedAmoeba.unset("recipient");
            $scope.incomingAmoebae.splice(index, 1);
            acceptedAmoeba.save(null, {
                success: function(amoebaAgain) {
                    $scope.inboxStateMessage = "You accepted " + acceptedAmoeba.name + " into your amoeba family.";
                    $scope.$apply();
                },
                error: function(amoebaAgain, error) {
                    $scope.inboxStateMessage = error.message;
                    $scope.$apply();
                }
            });
        };
        
        $scope.decline = function (index) {
            var declinedAmoeba = $scope.incomingAmoebae[index];
            acceptedAmoeba.unset("recipient");
            $scope.incomingAmoebae.splice(index, 1);
            acceptedAmoeba.save(null, {
                success: function(amoebaAgain) {
                    $scope.inboxStateMessage = "You declined " + acceptedAmoeba.name + ".";
                    $scope.$apply();
                },
                error: function(amoebaAgain, error) {
                    $scope.inboxStateMessage = error.message;
                    $scope.$apply();
                }
            });
        };
        
        if ($rootScope.sessionUser) {
             //Get any amoebae that have been sent to you.
            var incomingAmoebaQuery = new Parse.Query(Amoeba);
            incomingAmoebaQuery.equalTo("recipient", $rootScope.sessionUser);
            incomingAmoebaQuery.include("owner");
            incomingAmoebaQuery.find({
                success: function(results) {
                    $scope.incomingAmoebae = results;
                    $scope.$apply();
                },
                error: function(results, error) {
                    console.log(error.message);
                }
            });
        } else {
             $location.url("/login");
        }
    }]);