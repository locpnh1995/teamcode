angular
    .module('app.controllers.dashboardcontroller', [])
    .controller('dashboardController', dashboardController);

dashboardController.$inject = ['$scope', 'userService', '$state', '$timeout'];
function dashboardController($scope, userService, $state, $timeout) {
    var vm = this;

    vm.project = {
        project_name: null,
        project_stack: 'lamp_stack'
    }

    vm.createEnv = createEnv;

    function createEnv() {
        // userService.createProject(vm.project).then(function () {
        //
        // }, function () {
        //
        // });
    }
}