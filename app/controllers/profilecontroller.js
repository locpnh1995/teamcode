angular
    .module('app.controllers.profilecontroller', [])
    .controller('profileController', profileController);

profileController.$inject = ['$scope', 'userService'];
function profileController($scope, userService) {
    var vm = this;


}
