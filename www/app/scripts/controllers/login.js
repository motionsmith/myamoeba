'use strict';

angular.module('myAmoebaApp')
    .controller('LoginCtrl', ['$scope', '$location', '$rootScope', function ($scope, $location, $rootScope) {
        
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
                                user.set('firstName', response.first_name);
                                user.set('lastName', response.last_name);
                                user.set('username', response.first_name + " " + response.last_name);
                                user.set('facebookId', response.id);
                                user.save(null, {
                                    success: function(userAgain) {    
                                        $location.url('/');
                                        $scope.$apply();
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
