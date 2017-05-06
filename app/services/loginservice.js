angular
    .module('app.services.loginservice', [])
    .factory('loginService', loginService);

loginService.$inject = ['$http', '$cookies', '$q'];
function loginService($http, $cookies, $q) {
    var services = {
        email: null,
        password: null,
        login: login
    }

    function login(data) {
        var deferred = $q.defer();
        $http({
            url: '',
            method: 'POST',
            data: data
        }).then(function success(response) {
            deferred.resolve(response);
        }, function error(error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    return services;
}