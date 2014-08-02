'use strict';

angular
    .module('myAmoebaApp', [
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'MyAmoebaModels'
    ])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
        .when('/', {
            templateUrl: 'views/main.html',
            controller: 'MainCtrl'
        })
        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'LoginCtrl'
        })
        .when('/inbox', {
            templateUrl: 'views/inbox.html',
            controller: 'InboxCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
    }])
    .run(['$rootScope', '$location', 'MyAmoebaUser', function($rootScope, $location, MyAmoebaUser) {
        Parse.initialize("iLnBp9fs6Rt8bT4aFWZdiVShVs0fZuxhbpyh20UX", "UCNtTlpwG06wLcXBhY8YwlScUndCt3jKsx4VHY6H");
        
        $rootScope.sessionUser = MyAmoebaUser.current();
    }]);
