'use strict';

angular.module('myAmoebaApp')
    .controller('MainCtrl', ["$scope", "$location", function ($scope, $location) {
        var currentUser = Parse.User.current();
        
        $scope.handleLogoutClick = function() {
            Parse.User.logOut();
            currentUser = Parse.User.current();
            $location.url('/login');
        };
        
        
        if (currentUser) {
            console.log("MainCtrl sees " + currentUser.get("username"));
        } else {
            console.log("Routing to login screen...");
            $location.url("/login");
        }
    }]);
