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
            Parse.FacebookUtils.logIn(null, {
                success: function(user) {
                    if (!user.existed()) {
                        //alert("User signed up and logged in through Facebook.");
                    } else {
                        //alert("User logged in through Facebook.");
                    }
                    console.log("Routing to main.");
                    $location.url('/');
                    $scope.$apply();
                },
                error: function(user, error) {
                    alert("User cancelled the Facebook login or did not fully authorize.");
                }
            });
        };
    }]);
