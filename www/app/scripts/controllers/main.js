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
                    $scope.breedStateMessage = 'My stars! A new amoeba is born!';
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
        
        if ($rootScope.sessionUser) {
             //Get the amoebae that this user owns.
            var myAmoebaeQuery = new Parse.Query(Amoeba);
            myAmoebaeQuery.equalTo("owner", $rootScope.sessionUser);
            myAmoebaeQuery.include("owner");
            myAmoebaeQuery.include("breeder");
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
            
        } else {
            console.log("Routing to login screen...");
            $location.url("/login");
        }
    }]);
