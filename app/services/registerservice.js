angular
    .module('app.services.registerservice', [])
    .factory('registerService', registerService);

registerService.$inject = ['$http', '$cookies', '$q'];
function registerService($http, $cookies, $q) {
    var services = {
        email: null,
        password: null,
        name: null,
        register: register
    }

    function register(data) {
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