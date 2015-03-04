var tutorModule = angular.module('bb.tints.tutor', ['ngResource']);

tutorModule.controller('TutorListController', function($scope, Tutors, $routeParams) {
    // -- load the tutor tints from the server
    $scope.tutors = Tutors.list();
});

tutorModule.controller('TutorDetailController', function($scope, Tutors, $routeParams) {
    // -- load the stack from the server
    //$scope.stack = Stacks.get({owner: $routeParams['owner'], id: $routeParams['id']});
});
