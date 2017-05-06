angular
    .module('app.controllers.maincontroller', [])
    .controller('mainController', mainController);

mainController.$inject = ['$scope'];
function mainController($scope) {
    var vm = this;
    vm.title = 'TeamCode';
}
