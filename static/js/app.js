angular.module('app.services', ['ui', 'ngResource']).
  factory("Profile", function($resource){
    return $resource("api/v1/profile/", {_raw:1});
  }).
  filter("defaults", function() {
    return function(input, def) {
      return input || def;
    };
  }).
  directive("uniqueProfile", function($http) {
    return {
      //restrict: 'E',
      require: 'ngModel',
      link: function(scope, elem, attr, ctrl) {
        
        scope.$watch(attr.ngModel, function(value) {
          if (!value) {
            return;
          }
          if (value.length < 5) {
            ctrl.$setValidity('notLongEnough', false);
            return;
          }
          var toId;

          ctrl.$setValidity('notLongEnough', true);
          if(toId) clearTimeout(toId);

          toId = setTimeout(function(){
            toId = false;
            scope.checkingProfileName = true;
            scope.nameChecked = false;
            // call to some API that returns { isValid: true } or { isValid: false }
            $http.get('/api/v1/profile/exists?profile_name='+ value
              ).success(function(data) {
                scope.checkingProfileName = false;
                var res = false;
                if (data.result) {
                  res = true;
                }
                ctrl.$setValidity('notUniqueProfile', !res);
                if (!res) scope.nameChecked = "checked";
                if(!scope.$$phase) {
                  scope.$digest();
                }
            });
          }, 200);
        });
      }
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
  controller ("DashboardCtrl", function($scope, Profile) {
    $scope.profiles = Profile.query();
    $scope.addProfile = function() {
      var newProfile = Profile({name: $scope.profileName});
      $scope.profileName = "";
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