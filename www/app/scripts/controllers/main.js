'use strict';

angular.module('myAmoebaApp')
    .controller('MainCtrl', ["$scope", "$location", 'MyAmoebaUser', 'Amoeba', '$rootScope', function ($scope, $location, MyAmoebaUser, Amoeba, $rootScope) {
        //$scope.myAmoebae = [{"name": "Loading....................................."}];
        $scope.ownerAmoebaeLoaded = false;
        $scope.handleLogoutClick = function() {
            MyAmoebaUser.logOut();
            $location.url('/login');
        };
        
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
