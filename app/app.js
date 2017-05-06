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
    $locationProvider.html5Mode(true);
    $stateProvider
        .state('blank', {
            abstract: true,
            views: {
                'root': {
                    templateUrl: 'app/views/blank.html'
                }
            }
        })
        .state('structure', {
            abstract: true,
            views: {
                'root': {
                    templateUrl: 'app/views/structure.html'
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
}