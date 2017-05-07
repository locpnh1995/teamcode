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
            url: '/teamcode/server/login',
            method: 'POST',
            data: data
        }).then(function success(response) {
            $cookies.put('tokenTeamCode', response.data.token, {'expires': response.data.expires});
            deferred.resolve(response.data);
        }, function error(error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    return services;
}