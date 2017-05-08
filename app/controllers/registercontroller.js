angular
    .module('app.controllers.registercontroller', [])
    .controller('registerController', registerController);

registerController.$inject = ['$scope', 'userService', '$state', '$timeout'];
function registerController($scope, userService, $state, $timeout) {
    var vm = this;

    vm.register = register;

    function register() {
        if ($scope.user.password !== $scope.user.re_password) {
            Materialize.toast('Password and Re-Password don\'t match', 4000);
        }
        else {
            userService.register($scope.user)
                .then(function (response) {
                    if (response.code == 201) { // register success
                        Materialize.toast('Register success!', 4000);
                        $timeout(function () {
                            $state.go('blank.login');
                        }, 2000);
                    }
                    else if (response.code == 211) {
                        Materialize.toast('Email already exists!', 4000);
                    }
                    else {
                        Materialize.toast('Register failed!', 4000);
                    }
                }, function error(error) {
                    Materialize.toast(error, 4000);
                });
        }
    }
}