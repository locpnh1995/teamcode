angular
    .module('app.controllers.logincontroller', [])
    .controller('loginController', loginController);

loginController.$inject = ['$scope', 'userService', '$state', '$timeout'];
function loginController($scope, userService, $state, $timeout) {
    var vm = this;

    vm.login = login;

    function login() {
        userService.login($scope.user)
            .then(function success(response) {
                if (response.code == 200) { // login success
                    Materialize.toast('Login success!', 2000);
                    $timeout(function () {
                        $state.go('structure.dashboard');
                    }, 2000);
                }
                else if (response.code == 214) { // wrong email
                    Materialize.toast('Email does not exist!', 4000);
                }
                else if (response.code == 215) { // wrong password
                    Materialize.toast('Invalid password!', 4000);
                }
                else {
                    Materialize.toast('Login failed!', 4000);
                }
            }, function error(error) {
                Materialize.toast(error, 4000);
            });
    }
}