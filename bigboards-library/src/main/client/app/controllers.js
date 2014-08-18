app.controller('ApplicationController', function($scope, Library){
    $scope.data = Library.query();
});