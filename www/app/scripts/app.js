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
        .when('/onboarding', {
            templateUrl: 'views/onboarding.html',
            controller: 'OnboardingCtrl'
        })
        .when('/amoeba/:amoeba', {
          templateUrl: 'views/amoeba.html',
          controller: 'AmoebaCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
    }])
    .run(['$rootScope', '$location', 'MyAmoebaUser', function($rootScope, $location, MyAmoebaUser) {

      console.log("Angular run");
      $rootScope.isFbReady = false;
      Parse.initialize("iLnBp9fs6Rt8bT4aFWZdiVShVs0fZuxhbpyh20UX", "UCNtTlpwG06wLcXBhY8YwlScUndCt3jKsx4VHY6H");
      $rootScope.fbAppId = '266061040264102';

          window.fbAsyncInit = function() {
              console.log("Facebook SDK downloaded. Attempting to initialize Facebook...");
              console.log("Initializing Facebook.");
              Parse.FacebookUtils.init({
                  appId         : $rootScope.fbAppId,
                  cookie        : true,
                  xfbml         : true,
                  version       : 'v2.0'
              });
              $rootScope.isFbReady = true;
              $rootScope.$broadcast("onFbInitialized")
          };
          
          console.log("Loading Facebook SDK.");
          (function(d, s, id){
              var js, fjs = d.getElementsByTagName(s)[0];
              if (d.getElementById(id)) {return;}
              js = d.createElement(s); js.id = id;
              js.src = "//connect.facebook.net/en_US/sdk.js";
              fjs.parentNode.insertBefore(js, fjs);
          }(document, 'script', 'facebook-jssdk'));

        $rootScope.sessionUser = MyAmoebaUser.current();
    }]);
