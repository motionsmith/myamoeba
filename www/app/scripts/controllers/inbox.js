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

        $scope.requestAmoebae = function () {
            var recipients = [];

            FB.api('/me/friends', function(response) {
                if (response && !response.error) {
                    $scope.recipients = response.data;
                    for (var i = 0; i < response.data.length; i++) {
                        recipients[i] = response.data[i].id;
                    }

                    FB.ui( {
                        method: 'apprequests',
                        message: 'Hey, can you send me some amoebae? I\'d like to start breeding.',
                        to: recipients
                    },
                    function(response) {

                    });

                }
                else if (response.error) {
                    console.log("Could not get friends: " + response.error.message);
                }
                else {
                     console.log("Could not get friends: Unknown error.");
                }
            });
        };
        
        if ($rootScope.sessionUser) {
             //Get any amoebae that have been sent to you.
            var incomingAmoebaQuery = new Parse.Query(Amoeba);
            incomingAmoebaQuery.equalTo("recipient", $rootScope.sessionUser);
            incomingAmoebaQuery.include("owner");
            incomingAmoebaQuery.include('breeder');
            incomingAmoebaQuery.find({
                success: function(results) {
                    $scope.incomingAmoebae = results;
                    if ($scope.incomingAmoebae.length == 0) {
                        $scope.inboxStateMessage = "You have no incoming Amoebae.";
                    }
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