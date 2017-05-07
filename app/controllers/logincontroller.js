angular
    .module('app.controllers.logincontroller', [])
    .controller('loginController', loginController);

loginController.$inject = ['$scope', 'loginService', '$state', '$timeout'];
function loginController($scope, loginService, $state, $timeout) {
    var vm = this;

    vm.login = login;

    function login() {
        loginService.login($scope.user)
            .then(function success(response) {
                if (response.code == 200) { // login success
                    Materialize.toast('Login success', 4000);
                    $timeout(function () {
                        $state.go('/');
                    }, 2000);
                }
                else if (response.code == 201) { // wrong email
                    Materialize.toast('Email does not exist', 4000);
                }
                else if (response.code == 202) { // wrong password
                    Materialize.toast('Invalid password', 4000);
                }
                else {
                    Materialize.toast('Login failed', 4000);
                }
            }, function error(error) {
                Materialize.toast(error, 4000);
            });
    }
}