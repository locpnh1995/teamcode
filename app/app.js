'use strict';
angular
    .module('myApp', [
        'ngSanitize',
        'ngCookies',
        'ngAnimate',
        'ui.router',
        'app.controllers',
        'app.directives',
        'app.services'
    ])
    .config(config);

function config($stateProvider, $locationProvider, $urlRouterProvider) {
    $stateProvider
        .state('blank', {
            abstract: true,
            views: {
                'root': {
                    templateUrl: 'app/views/blank.html',
                }
            }
        })
        .state('structure', {
            abstract: true,
            views: {
                'root': {
                    templateUrl: 'app/views/structure.html',
                }
            }
        })
        .state('blank.login', {
            url: '/login',
            views: {
                '': {
                    templateUrl: 'app/views/login.html',
                    controller: 'loginController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                redirectIfAuthenticated: _redirectIfAuthenticated
            }
        })
        .state('blank.register', {
            url: '/register',
            views: {
                '': {
                    templateUrl: 'app/views/register.html',
                    controller: 'registerController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                redirectIfAuthenticated: _redirectIfAuthenticated
            }
        })
        .state('structure.about', {
            url: '/about',
            views: {
                'header': {
                    templateUrl: 'app/views/header.html'
                },
                'content': {
                    templateUrl: 'app/views/about.html'
                }
            }
        })
        .state('structure.homepage', {
            url: '/',
            views: {
                'header': {
                    templateUrl: 'app/views/header.html'
                },
                'content': {
                    templateUrl: 'app/views/home.html'
                }
            }
        });
    // Send to login if the URL was not found
    $urlRouterProvider.otherwise("/login");

    _redirectIfAuthenticated.$inject = ['$q', '$state', 'userService', '$timeout'];
    function _redirectIfAuthenticated($q, $state, userService, $timeout) {
        // var deferred = $q.defer();
        userService.authentication().then(function (response) {
            if (response.code == 200) {
                $timeout(function () {
                    $state.go('structure.homepage');
                });
                // deferred.reject();
            }
            // else {
            //     // deferred.resolve();
            // }
        });
        // return deferred.promise;
    }

    _redirectIfNotAuthenticated.$inject = ['$q', '$state', 'userService', '$timeout'];
    function _redirectIfNotAuthenticated($q, $state, userService, $timeout) {
        // var deferred = $q.defer();
        userService.authentication().then(function (response) {
            if (response.code == 200) {
                // deferred.resolve();
            } else {
                $timeout(function () {
                    $state.go('blank.login');
                });
                // deferred.reject();
            }
        })

        // return deferred.promise;
    }

    // authentication.$inject = ['$q', 'userService', '$state', '$timeout'];
    // function authentication($q, userService, $state, $timeout) {
    //     var promise =  $q.when(userService.authentication().then(function (response) {
    //         if (response.code == 401) {
    //             return;
    //         }
    //     });
    //     return promise;
    // userService.authentication().then(function (response) {
    //     if (response.code == 200) {
    //         return $q.when();
    //     }
    //     else {
    //         $timeout(function () {
    //             $state.go('loggedIn.blank.login');
    //         });
    //         return $q.reject();
    //     }
    // });
//}
}