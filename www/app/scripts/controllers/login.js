'use strict';

angular.module('myAmoebaApp')
    .controller('LoginCtrl', ['$scope', '$location', function ($scope, $location) {
        
        //Don't hang out on the login screen if we're already logged in.
        var currentUser = Parse.User.current();
        if (currentUser) {
            $location.url('/');
        }
        
        $scope.handleLogInClick = function() {
            //Handle log in through Facebook.
            Parse.FacebookUtils.logIn("public_profile,user_friends,email", {
                success: function(user) {
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
                    
                }
            });
        };
    }]);
