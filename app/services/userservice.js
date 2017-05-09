angular
    .module('app.services.userservice', [])
    .factory('userService', userService);

userService.$inject = ['$http', '$cookies', '$q'];
function userService($http, $cookies, $q) {
    var services = {
        email: null,
        name: null,
        image: null,
        isAuthenticated: isAuthenticated,
        getEmail: getEmail,
        setEmail: setEmail,
        getName: getName,
        setName: setName,
        getImage: getImage,
        setImage: setImage,
        login: login,
        register: register,
        logout: logout,
        authentication: authentication
    }

    function isAuthenticated() {
        var token = $cookies.get('tokenTeamCode');
        var email = $cookies.get('emailTeamCode');
        if (token && email) {
            return true;
        }
        return false;
    }

    function getEmail() {
        return $cookies.get('emailTeamCode');
    }

    function setEmail(newEmail) {
        services.email = newEmail;
    }

    function getName() {
        return services.name;
    }

    function setName(newName) {
        services.name = newName;
    }

    function getImage() {
        return services.image;
    }

    function setImage(newImage) {
        services.image = newImage;
    }

    function login(data) {
        var deferred = $q.defer();
        $http({
            url: '/login',
            method: 'POST',
            data: data
        }).then(function success(response) {
            console.log(response);
            $cookies.put('tokenTeamCode', response.data.token, {'expires': new Date(response.data.expires)});
            $cookies.put('emailTeamCode', response.data.email, {'expires': new Date(response.data.expires)});
            deferred.resolve(response.data);
        }, function error(error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function register(data) {
        var deferred = $q.defer();
        $http({
            url: '/register',
            method: 'POST',
            data: data
        }).then(function success(response) {
            deferred.resolve(response.data);
        }, function error(error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function logout() {
        var deferred = $q.defer();
        var data = {email: $cookies.get('emailTeamCode'), token: $cookies.get('tokenTeamCode')};
        $http({
            url: '/logout',
            method: 'POST',
            data: data
        }).then(function success(response) {
            if (response.data.code == 200) {
                $cookies.remove('tokenTeamCode');
                $cookies.remove('emailTeamCode');
            }
            deferred.resolve(response.data);
        }, function error(error) {
            deferred.reject(error);
        });
        return deferred.promise;
    }

    function authentication() {
        var deferred = $q.defer();
        var data = {email: $cookies.get('emailTeamCode'), token: $cookies.get('tokenTeamCode')};
        console.log(data);
        $http({
            url: '/authentication',
            method: 'POST',
            data: data
        }).then(function success(response) {
            deferred.resolve(response.data);
        }, function error(error) {
            services.isAuthenticated = false;
            deferred.reject(error);
        });
        return deferred.promise;
    }

    return services;
}