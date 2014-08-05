'use strict';

angular.module('myAmoebaApp')
    .controller('InboxCtrl', ['$scope', '$location', '$rootScope', 'Amoeba', 'ShareAmoebaRequest', function ($scope, $location, $rootScope, Amoeba, ShareAmoebaRequest) {
        
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

        var requestAmoebaeWithFacebook = function () {
            var fbRecipientIds = [];
            for (var i = 0; i < $scope.recipients.length; i++) {
                fbRecipientIds[i] = $scope.recipients[i].id;
            }
            FB.ui( {
                method: 'apprequests',
                message: 'Hey, can you send me some amoebae? I\'d like to start breeding.',
                to: fbRecipientIds
            },
            function(response) {
                console.log("Facebook request response: " + response);
            });
        };

        var requestAmoebaeWithParse = function() {
            var userFriends = new Parse.Query("User");
            for (var i = 0; i < $scope.recipients.length; i++) {
                userFriends.equalTo('facebookId', $scope.recipients[i].id);
            }
            userFriends.find()
            .then(function(results) {
                var requests = [];
                for (var i = 0; i < results.length; i++) {
                    requests[i] = new ShareAmoebaRequest();
                    requests[i].requester = $rootScope.sessionUser;
                    requests[i].requestee = results[i];
                }
                return Parse.Object.saveAll(requests);
            })
            .then(function(results) {
                console.log("Parse request made.");
            },
            function(error) {
                console.log("Could not create the Parse AmoebaRequest: " + error.message);
            });
        };

        $scope.requestAmoebae = function () {
            var recipients = [];

            FB.api('/me/friends', function(response) {
                if (response && !response.error) {
                    $scope.recipients = response.data;
                    requestAmoebaeWithParse();
                    requestAmoebaeWithFacebook();
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