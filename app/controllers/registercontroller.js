angular
    .module('app.controllers.registercontroller', [])
    .controller('registerController', registerController);

registerController.$inject = ['$scope', 'registerService', '$state', '$timeout'];
function registerController($scope, registerService, $state, $timeout) {
    var vm = this;

    vm.register = register;

    function register() {
        if ($scope.user.password !== $scope.user.re_password) {
            Materialize.toast('Password and Re-Password don\'t match', 4000);
        }
        else {
            registerService.register($scope.user)
                .then(function (response) {
                    if (response.code == 200) { // register success
                        Materialize.toast('Register success', 4000);
                        $timeout(function () {
                            $state.go('blank.login');
                        }, 2000);
                    }
                    else {
                        Materialize.toast('Register failed', 4000);
                    }
                }, function error(error) {
                    Materialize.toast(error, 4000);
                });
        }
    }
}