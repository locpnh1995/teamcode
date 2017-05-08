angular
    .module('app.controllers.maincontroller', [])
    .controller('mainController', mainController);

mainController.$inject = ['$scope', 'userService', '$state'];
function mainController($scope, loginService, $state) {
    var vm = this;
    vm.title = 'TeamCode';

    vm.logout = logout;

    function logout() {
        userService.logout()
            .then(function success(response) {
                if (response.code == 200) {
                    Materialize.toast('Logout successful!', 4000);
                    $timeout(function () {
                        $state.go('blank.login');
                    }, 2000);
                }
                else {
                    Materialize.toast('Logout error!', 4000);
                }
            }, function error(error) {
                Materialize.toast(error, 4000);
            });
    }

}
