angular.module('app.services', ['ui', 'ngResource']).
  factory("Profile", function($resource){
    return $resource("api/v1/profiles/", {_raw:1});
  }).
  filter("defaults", function() {
    return function(input, def) {
      return input || def;
    };
  }).
  directive('twModal', function() {
    return {
      scope: true,
      link: function(scope, element, attr, ctrl) {
          scope.show = function() {
            $(element).modal("show");
          };
          scope.dismiss = function() {
            $(element).modal("hide");
          };
          $(element).on("show", function(){
            scope.$emit("modalShow", arguments);
          });
          $(element).on("shown", function(){
            scope.$emit("modalShown", arguments);
          });
          $(element).on("hide", function(){
            scope.$emit("modalHide", arguments);
          });
          $(element).on("hidden", function(){
            scope.$emit("modalHidden", arguments);
          });
        }
      };
  }).
  directive('editable', function() {
    return {
      require: 'ngModel',
      link: function(scope, elm, attrs, model) {
        elm.editable($.extend({
          emptytext: "(empty)",
          "emptyclass": "",
          "unsavedclass": ""
        }, scope.$eval(attrs.editable)));
        model.$render = function() {
            elm.editable('setValue', model.$viewValue);
        };
        elm.on('save', function(e, params) {
            model.$setViewValue(params.newValue);
            scope.$apply();
        });
        if (attrs.editableSaved) {
          elm.on('save', function(){
            scope.$eval(attrs.editableSaved);
           });
        }
      }
    };
  });

angular.module('app', ["app.services"]).
  config(function($routeProvider) {
     $routeProvider.
       when('/', {controller:"HomeCtrl", templateUrl:'tmpl/home.tmpl'}).
       when('/:profileId/dashboard', {controller:"ProfileDashboardCtrl",
            templateUrl:'tmpl/home.tmpl'}).
       when('/changelog', {controller:"ChangesCtrl", templateUrl:'tmpl/changelog.tmpl'}).
       when('/dashboard', {controller:"DashboardCtrl", templateUrl:'tmpl/dashboard.tmpl'}).
      otherwise({redirectTo:'/'});
  }).
  controller ("ChangesCtrl", function($scope, $rootScope, $location) {
  }).

  controller ("ProfileDashboardCtrl", function($scope, $rootScope, $location) {
  }).
  controller ("DashboardCtrl", function($scope, Profile, $location) {
    $scope.profiles = Profile.query();
    $scope.createProfile = function(profileName) {
      var newProfile = new Profile({name: profileName});
      $scope.profiles.push(newProfile);
      newProfile.$save(function() {
        $location.path("/" + newProfile.id + "/dashboard");
      });
    };
  }).
  controller ("HomeCtrl", function($scope, $rootScope) {
  }).
  controller ("MainCtrl", function ($scope, $http, $location, $rootScope, $route) {
    $scope.app_name = "daNumbers";
    $http.get("/api/v1/me/").success(
      function(resp) {
        var user = resp.result;
        if(user) {
            $scope.user = user;
            $location.path("/dashboard");
          }
      });

  });