angular
    .module('app.controllers.logincontroller', [])
    .controller('loginController', loginController);

loginController.$inject = ['$scope', 'loginService'];
function loginController($scope, loginService) {
    var vm = this;

    vm.login = login;

    function login() {
        Materialize.toast('I am a toast!', 4000);
    }
}