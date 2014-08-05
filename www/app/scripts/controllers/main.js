'use strict';

angular.module('myAmoebaApp')
    .controller('MainCtrl', ["$scope", "$location", 'MyAmoebaUser', 'Amoeba', '$rootScope', 'ShareAmoebaRequest', function ($scope, $location, MyAmoebaUser, Amoeba, $rootScope, ShareAmoebaRequest) {
        
        var fetchRecipients = function () {
            console.log("Fetch recipients");
            //Get users that this user can send an amoeba to.
            FB.api('/me/friends', function(response) {
                if (response && !response.error) {
                    $scope.recipients = response.data;
                    $scope.sendStateMessage = '';
                    if ($scope.recipients.length > 0) {
                        $scope.selectedRecipient = $scope.recipients[0];
                    }

                    //Update the number of friends this user has in the game.
                    //This affects the amoeba fame.
                    $rootScope.sessionUser.numFriends = $scope.recipients.length;
                    $rootScope.sessionUser.save();

                    $scope.$apply();
                }
                else if (response.error) {
                    $scope.sendStateMessage = "Could not get friends: " + response.error.message;
                    $scope.$apply();
                }
                else {
                    $scope.sendStateMessage = "Could not get friends. Unknown error.";
                    $scope.$apply();
                }
            });
        };

        $scope.ownerAmoebaeLoaded = false;

        if (!$rootScope.sessionUser || !$rootScope.sessionUser.authenticated()) {
             $location.url("/login");
        }

        if (!$rootScope.sessionUser.surname) {
            $location.url('/onboarding');
        }

        $scope.getAmoebaShareRequest = function() {
            var requestsQuery = new Parse.Query(ShareAmoebaRequest);
            requestsQuery.equalTo("requestee", $rootScope.sessionUser);
            requestsQuery.include("requester");
            requestsQuery.first().then(function(result) {
                $scope.incomingAmoebaRequest = result;
            },
            function(error) {
                $scope.incomingAmoebaRequest = null;
            });
        };

        if ($rootScope.sessionUser) {
            
             //Get the amoebae that this user owns.
            var myAmoebaeQuery = new Parse.Query(Amoeba);
            myAmoebaeQuery.equalTo("owner", $rootScope.sessionUser);
            myAmoebaeQuery.notEqualTo("isDead", true);
            myAmoebaeQuery.include("owner");
            myAmoebaeQuery.include("breeder");
            myAmoebaeQuery.include("parentA");
            myAmoebaeQuery.include("parentB");
            myAmoebaeQuery.include("recipient");
            myAmoebaeQuery.find({
                success: function(results) {
                    $scope.myAmoebae = results;
                    $scope.selectedAmoeba = $scope.myAmoebae[0];
                    $scope.breedWithAmoeba = $scope.myAmoebae[0];
                    $scope.ownerAmoebaeLoaded = true;
                    $scope.$apply();
                },
                error: function(error) {
                    console.log(error.message);
                }
            });
            
            //Get any amoebae that have been sent to you.
            var incomingAmoebaQuery = new Parse.Query(Amoeba);
            incomingAmoebaQuery.equalTo("recipient", $rootScope.sessionUser);
            incomingAmoebaQuery.count({
                success: function(count) {
                    $scope.numIncomingAmoebae = count;
                    $scope.$apply();
                },
                error: function(results, error) {
                    console.log(error.message);
                }
            });
            
            //Get the user's Facebook friends who play this game.
            if ($rootScope.isFbReady)
            {
                console.log("Fetching recipients");
               fetchRecipients();
            } else {
                console.log("Cannot fetch recipients. FB.init() has not completed.");
                $rootScope.$on("onFbInitialized", fetchRecipients);
            }
            
            //Get a list of requests
            $scope.getAmoebaShareRequest();
        }

        $scope.clearAmoebaShareRequest = function() {
            var currRequest = $scope.incomingAmoebaRequest;

            if (!currRequest) {
                return;
            }

            $scope.incomingAmoebaRequest = null;
            currRequest.destroy()
            .then(function(result) {
                $scope.getAmoebaShareRequest();
            },
            function(error) {
                console.log("Problem clearing amoeba share request: " + error.message);
            });
        };
        
        $scope.handleLogoutClick = function() {
            MyAmoebaUser.logOut();
            $location.url('/login');
        };
        
        $scope.handleBreedClick = function() {
            if ($scope.selectedAmoeba == $scope.breedWithAmoeba) {
                $scope.breedStateMessage = 'Amoebae don\'t breed asexually.';
                return;   
            } else {
                $scope.breedStateMessage = 'Breeding...';
            }
            
            var parentA = $scope.selectedAmoeba;
            var parentB = $scope.breedWithAmoeba;
            var babyAmoeba = new Amoeba();
            babyAmoeba.set('name', 'Baby of ' + parentA.name + ' and ' + parentB.name);
            babyAmoeba.set('owner', $rootScope.sessionUser);
            babyAmoeba.set('breeder', $rootScope.sessionUser);
            babyAmoeba.set('parentA', parentA);
            babyAmoeba.set('parentB', parentB);
            $scope.myAmoebae.push(babyAmoeba);
            $scope.selectedAmoeba = babyAmoeba;
            babyAmoeba.save(null, {
                success: function(babyAmoebaAgain) {
                    $scope.breedStateMessage = 'Hark! A new amoeba is born!';
                    $scope.$apply();

                    //Create the amoeba on FB
                    /*FB.api('me/objects/vulcaninc:amoeba',
                        'post',
                        {
                            object: {
                                app_id: $rootScope.fbAppId,
                                url: 'http://myamoeba.parseapp.com/amoeba/' + babyAmoeba.id,
                                title: babyAmoeba.getFullName()
                            }
                        },
                        function (response) {
                            if (!response.error) {
                                $scope.breedStateMessage = "The birth was a success.";
                                $scope.$apply();
                            } else {
                                $scope.breedStateMessage = "Facebook error: " + response.error.message;
                                $scope.$apply();
                                if (response.error.code == 200) {
                                    FB.login(function(response) {
                                        
                                    },
                                    {
                                        scope: 'publish_actions'
                                    });
                                }
                            }
                        }
                    );*/
                },
                error: function(babyAmoebaAgain, error) {
                    $scope.breedStateMessage = "Parse error: " + error.message;
                    $scope.$apply();
                }
            });
        };
        
        $scope.handleRenameClick = function() {
            var amoebaToRename = $scope.selectedAmoeba;
            amoebaToRename.save(null, {
                success: function(amoebaAgain) {
                    $scope.renameStateMessage = "Name changed!";
                    $scope.$apply();
                },
                error: function(amoebaAgain, error) {
                    $scope.renameStateMessage = error.message;
                    $scope.$apply();
                }
            });
        }
        
        $scope.handleKillClick = function() {
            if ($scope.myAmoebae.length <= 1) {
                $scope.killStateMessage = "You must keep at least one amoeba.";
                return;
            }
            var amoebaToKill = $scope.selectedAmoeba;
            $scope.myAmoebae.splice($scope.myAmoebae.indexOf(amoebaToKill), 1);
            $scope.selectedAmoeba = $scope.myAmoebae[0];
            amoebaToKill.isDead = true;
            amoebaToKill.save(null, {
                success: function(amoebaAgain) {
                    $scope.killStateMessage = amoebaAgain.name + " is dead.";
                    $scope.$apply();
                },
                error: function(amoebaAgain, error) {
                    $scope.killStateMessage = error.message;
                    $scope.$apply();
                }
            });
        }
        
        $scope.handleSendClick = function () {
            var amoebaToSend = $scope.selectedAmoeba;
            
            var recipientUserQuery = new Parse.Query(MyAmoebaUser);
            recipientUserQuery.equalTo('facebookId', $scope.selectedRecipient.id);
            recipientUserQuery.first({
                success: function(recipientUser) {
                    amoebaToSend.recipient = recipientUser;
                    amoebaToSend.save(null, {
                        success: function(recipientUserAgain) {

                            //If we shared with a user who's request is pending, clear that request.
                            if ($scope.incomingAmoebaRequest.requester.id == recipientUser.id) {
                                $scope.clearAmoebaShareRequest();
                            }

                            $scope.sendStateMessage = "Send requested.";
                            $scope.$apply();
                        },
                        error: function(recipientUserAgain, error) {
                            $scope.sendStateMessage = error.message;
                            $scope.$apply();
                        }
                    });
                },
                error: function(error) {
                    $scope.sendStateMessage = error.message;
                }
            });
        };
        
        $scope.handleTakeBackClick = function () {
            var amoebaToTakeBack = $scope.selectedAmoeba;
            amoebaToTakeBack.unset("recipient");
            amoebaToTakeBack.save(null, {
                success: function(amoebaAgain) {
                    $scope.sendStateMessage = '';
                },
                error: function(amoebaAgain, error) {
                    $scope.sendStateMessage = error.message;
                }
            });
        };

        $scope.getAncestors = function() {
           if ($scope.ancestors) {
                $scope.ancestors.length = 0;
           }
            Parse.Cloud.run('getAncestors', {"amoebaId": $scope.selectedAmoeba.id}, {
                success: function(result) {
                    $scope.ancestors = result.ancestors;
                    $scope.$apply();
                },
                error: function(result, error) {
                    console.log(error.message);
                },
            });
        };

        $scope.facebookInvite = function () {
            FB.ui( {
                method: 'apprequests',
                message: 'I want to infect you with some amoebae that I\'m breeding. Lollers, I know that sounds bad, but trust me!'
            },
            function(response) {

            });
        };

        $scope.requestAmoebae = function() {
            requestAmoebaeWithParse();
            requestAmoebaeWithFacebook();
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
    }]);
