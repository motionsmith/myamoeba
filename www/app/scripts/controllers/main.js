'use strict';

angular.module('myAmoebaApp')
    .controller('MainCtrl', ["$scope", "$location", 'MyAmoebaUser', 'Amoeba', '$rootScope', function ($scope, $location, MyAmoebaUser, Amoeba, $rootScope) {
        $scope.ownerAmoebaeLoaded = false;
        
        $scope.handleLogoutClick = function() {
            MyAmoebaUser.logOut();
            $location.url('/login');
        };
        
        $scope.handleBreedClick = function() {
            if ($scope.selectedAmoeba == $scope.breedWithAmoeba) {
                $scope.breedStateMessage = 'Amoebae don\'t breed asexually.';   
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
                },
                error: function(babyAmoebaAgain, error) {
                    $scope.breedStateMessage = error.message;
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
            amoebaToKill.destroy({
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
        }
        
        var fetchRecipients = function () {
            //Get users that this user can send an amoeba to.
            FB.api('/me/friends', function(response) {
                if (response && !response.error) {
                    $scope.recipients = response.data;
                    $scope.sendStateMessage = '';
                    $scope.selectedRecipient = $scope.recipients[0];
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
        
        if ($rootScope.sessionUser) {
            
             //Get the amoebae that this user owns.
            var myAmoebaeQuery = new Parse.Query(Amoeba);
            myAmoebaeQuery.equalTo("owner", $rootScope.sessionUser);
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
                    
            
            if ($rootScope.fbInitialized)
            {
               fetchRecipients();
            } else {
                $scope.$on("fbInitComplete", fetchRecipients);   
            }
            
        } else {
            console.log("Routing to login screen...");
            $location.url("/login");
        }
    }]);
