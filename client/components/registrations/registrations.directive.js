'use strict';

var app = angular.module('myApp.registrations.directives', []);

app.directive('createHolding', ['Holding', 'User', 'locationHelper', '$routeParams', '$location', '$cookies', 'menu', 'gettextCatalog', function(Holding, User, locationHelper, $routeParams, $location, $cookies, menu, gettextCatalog) {

  var link = function( scope, element, attrs ) {

    var domain = locationHelper.domain();
    var subdomain = locationHelper.subdomain();

    menu.hideToolbar = false;
    menu.hideBurger = true;
    menu.isOpenLeft = false;
    menu.isOpen = false;

    scope.brand_name = 'MIMO';
    scope.user = {};

    var cookies = $cookies.get('_cth', { domain: domain });
    if (cookies) {
      scope.cookies = JSON.parse(cookies);
    }

    scope.create = function() {
      scope.invited   = true;
      scope.cookies   = { d: new Date().getTime(), u: scope.user };
      var now         = new Date();
      var ts          = now.setDate(now.getDate() + 1);
      var expires     = new Date(ts);
      var holding_account = {};
      holding_account.email = scope.user.email;
      $cookies.put('_cth', JSON.stringify(scope.cookies), { domain: domain, expires: expires } );
      Holding.create({},holding_account).$promise.then(function(data) {
      }, function() {
        scope.clearCookies();
      });
    };

    scope.clearCookies = function() {
      scope.cookies = undefined;
      $cookies.remove('_cth', { domain: domain });
    };

  };

  return {
    link: link,
    scope: {},
    templateUrl: 'components/registrations/_create.html'
  };

}]);

app.directive('buildFlow', ['Holding', '$routeParams', '$location', '$rootScope', 'locationHelper', '$cookies', 'menu', 'Me', 'showErrors', 'showToast', 'gettextCatalog','$timeout', function(Holding, $routeParams, $location, $rootScope, locationHelper, $cookies, menu, Me, showErrors, showToast, gettextCatalog, $timeout) {

  var link = function( scope, element, attrs ) {

    var domain = locationHelper.domain();

    menu.hideToolbar = false;
    menu.hideBurger = true;
    menu.isOpenLeft = false;
    menu.isOpen = false;

    scope.stage = $location.hash();
    scope.holding = {
      id: $routeParams.id
    };
    scope.loading = true;

    // if ($routeParams.id) {
    //   var now         = new Date();
    //   var ts          = now.setDate(now.getDate() + 1);
    //   var expires     = new Date(ts);
    //   $cookies.put('_cttid', $routeParams.id, { domain: domain, expires: expires } );
    // } else {
    //   var cookie = $cookies.get('_cttid', { domain: domain });
    //   if (cookie) {
    //     scope.holding.id = cookie;
    //   } else {
    //     $location.path('/create');
    //   }
    // }

    var setHeadings = function() {
      if (scope.stage === 4) {
        scope.title = gettextCatalog.getString('The elves are making your MIMO dashboard.');
        scope.subhead = gettextCatalog.getString('They won\'t be long, please wait about 3 seconds.');
      } else if (scope.stage === 'user') {
        scope.title = gettextCatalog.getString('Step 2 - what\'s your name?');
        scope.subhead = gettextCatalog.getString('It\'s a pleasure to meet you!');
      } else if (scope.stage === 'confirm') {
        scope.title = gettextCatalog.getString('Step 3 - nearly done, phew!');
        scope.subhead = gettextCatalog.getString('By signing-up, you\'re agreeing to our terms of use. Read these at oh-mimo.com/terms');
      } else if (!scope.creatingAccount) {
        scope.title = gettextCatalog.getString('Step 1 (of 3) - create a location');
        scope.subhead = gettextCatalog.getString('MIMO organises everything into locations. Each location can have multiple access points. It\'s really quite simple. Go ahead and create your first one.');
      }
    };

    setHeadings();

    var login = function(domain, loginArgs) {
      $cookies.remove('_cth', { domain: domain });
      $cookies.remove('_cttid', { domain: domain });
      $rootScope.$broadcast('login', loginArgs);
    };

    var getMe = function(data) {
      Me.get({}).$promise.then(function(res) {
        var search = {};
        var loginArgs = { data: res, search: search, path: '/' + data.location_slug + '/guide'};

        var domain = locationHelper.domain();
        Holding.destroy({}, {id: $routeParams.id}).$promise.then(function(data) {
          login(domain, loginArgs);
        }, function() {
          login(domain, loginArgs);
        });
        $rootScope.$broadcast('login', loginArgs);
      });
    };

    var save = function() {
      Holding.update({}, {id: $routeParams.id, holding_account: scope.holding}).$promise.then(function(data) {
        scope.errors = undefined;
        if (scope.holding.finalised) {
          $cookies.put('_mta', data.token, {domain: '.' + domain});
          var timer = $timeout(function() {
            $timeout.cancel(timer);
            getMe(data);
          }, 3000);
        }
      }, function(err) {
        setHeadings();
        showErrors(err);
        scope.updating = undefined;
      });
    };


    var setStage = function() {
      if (scope.stage === 1) {
        $location.hash('user');
      } else if (scope.stage === 2) {
        $location.hash('user');
      } else if (scope.stage === 3) {
        $location.hash('confirm');
      }
      setHeadings();
    };

    var init = function() {
      Holding.get({}, {id: scope.holding.id}).$promise.then(function(data) {
        console.log(data);
        scope.holding = data;
        scope.loading = undefined;
      }, function(err) {
        $cookies.remove('_cth', { domain: domain });
        $cookies.remove('_cttid', { domain: domain });
        $location.path('/create');
      });
    };

    scope.update = function(stage) {
      scope.stage = stage;
      setStage();
      if (scope.stage === 4) { scope.holding.finalised = true; }
      save();
    };

    init();
  };

  return {
    link: link,
    scope: {},
    templateUrl: 'components/registrations/_flow.html'
  };

}]);

app.directive('successSignup', ['Holding', '$routeParams', '$location', function(Holding, $routeParams, $location) {

  var link = function( scope, element, attrs ) {

  };

  return {
    link: link,
    scope: {}
  };

}]);
