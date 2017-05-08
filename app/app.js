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
// .run(run);

// function run($rootScope, $state, userService) {
//     console.log("ok");
//     $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
//         console.log(toState);
//         userService.authentication().then(function (response) {
//             if (toState.authenticate && (response.code == 401 || response.code == 404)) {
//                 // User isn’t authenticated
//                 $state.transitionTo("loggedIn.blank.login");
//                 event.preventDefault();
//             }
//         });
//     });
// }
function config($stateProvider, $locationProvider, $urlRouterProvider) {
    $stateProvider
        .state('loggedIn', {
            abstract: true,
            views: {
                'root': {
                    template: '<div ui-view="root"></div>',
                    // controller: function ($rootScope, userService, $state) {
                    //     console.log("abc");
                    //     $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
                    //         console.log(toState);
                    //         console.log("abc");
                    //     });
                    // }
                }
            },
            // resolve: {
            //     authentication: _redirectIfNotAuthenticated
            // }
            // authenticate: true
        })
        .state('loggedIn.blank', {
            abstract: true,
            views: {
                'root': {
                    templateUrl: 'app/views/blank.html',
                }
            }
        })
        .state('loggedIn.structure', {
            abstract: true,
            views: {
                'root': {
                    templateUrl: 'app/views/structure.html',
                }
            }
        })
        .state('loggedIn.blank.login', {
            url: '/login',
            views: {
                '': {
                    templateUrl: 'app/views/login.html',
                    controller: 'loginController',
                    controllerAs: 'vm'
                }
            }
        })
        .state('loggedIn.blank.register', {
            url: '/register',
            views: {
                '': {
                    templateUrl: 'app/views/register.html',
                    controller: 'registerController',
                    controllerAs: 'vm'
                }
            }
        })
        .state('loggedIn.structure.about', {
            url: '/about',
            views: {
                'header': {
                    templateUrl: 'app/views/header.html'
                },
                'content': {
                    templateUrl: 'app/views/about.html'
                }
            },
            resolve: {
                authentication: _redirectIfNotAuthenticated
            }
        })
        .state('loggedIn.structure.homepage', {
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

    _redirectIfNotAuthenticated.$inject = ['$q', '$state', 'userService', '$timeout'];
    function _redirectIfNotAuthenticated($q, $state, userService, $timeout) {
        var deferred = $q.defer();
        userService.authentication().then(function (response) {
            if (response.code == 200) {
                deferred.resolve();
            } else {
                $timeout(function () {
                    $state.go('loggedIn.blank.login');
                });
                deferred.reject();
            }
        })

        return deferred.promise;
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