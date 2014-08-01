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
        
        window.fbAsyncInit = function() {
              console.log("Facebook SDK downloaded. Attempting to initialize Facebook...");
              console.log("Initializing Facebook.");
              Parse.FacebookUtils.init({
                  appId         : '266061040264102',
                  cookie        : true,
                  xfbml         : true,
                  version       : 'v2.0'
              });
            $rootScope.fbInitialized = true;
            $rootScope.$broadcast("fbInitComplete");
          };
          
          console.log("Loading Facebook SDK.");
          (function(d, s, id){
              var js, fjs = d.getElementsByTagName(s)[0];
              if (d.getElementById(id)) {return;}
              js = d.createElement(s); js.id = id;
              js.src = "//connect.facebook.net/en_US/sdk.js";
              fjs.parentNode.insertBefore(js, fjs);
          }(document, 'script', 'facebook-jssdk'));
    }]);
