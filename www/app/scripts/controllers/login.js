'use strict';

angular.module('myAmoebaApp')
    .controller('LoginCtrl', ['$scope', '$location', '$rootScope', 'Amoeba', function ($scope, $location, $rootScope, Amoeba) {
        
        //Don't hang out on the login screen if we're already logged in.
        if ($rootScope.sessionUser && $rootScope.sessionUser.authenticated()) {
            $location.url('/');
        }
        
        $scope.handleLogInClick = function() {
            //Handle log in through Facebook.
            Parse.FacebookUtils.logIn("public_profile,user_friends,email", {
                success: function(user) {
                    $rootScope.sessionUser = user;
                    if (!user.existed()) {
                        FB.api('/me', 'get', {fields: "first_name, last_name"}, function(response) {
                            if (!response.error) {
                                $scope.loginStateMessage = "Welcome! Creating your account...";
                                $scope.$apply();
                                user.set('firstName', response.first_name);
                                user.set('lastName', response.last_name);
                                user.set('username', response.first_name + " " + response.last_name);
                                user.set('facebookId', response.id);
                                user.save(null, {
                                    success: function(userAgain) {
                                        $scope.loginStateMessage = "Account created. Breeding your first amoeba...";
                                        $scope.$apply();

                                        //Create an initial Amoeba for the user.
                                        var firstAmoeba = new Amoeba();
                                        firstAmoeba.set('name', 'Adam');
                                        firstAmoeba.set('owner', user);
                                        firstAmoeba.set('breeder', user);
                                        firstAmoeba.save(null, {
                                            success: function(firstAmoebaResponse) {
                                               $location.url('/');
                                               $scope.$apply();
                                            },
                                            error: function(firstAmoebaResponse, error) {
                                                $scope.loginStateMessage = "Error creating first amoeba: " + error.message;
                                                $scope.$apply();
                                            }
                                        });
                                    },
                                    error: function(userAgain, error) {
                                        console.log(error.message);
                                        $scope.loginStateMessage = "There was a problem: " + error.message;
                                        $scope.$apply();
                                    }
                                }); 
                            }
                       });
                    } else {
                        $location.url('/');
                        $scope.$apply();
                    }
                },
                error: function(user, error) {
                    $scope.loginStateMessage = "There was a problem: " + error.message;
                    $scope.$apply();
                }
            });
        };
    }]);
