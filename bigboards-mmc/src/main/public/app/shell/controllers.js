shellModule.controller('ShellController', function($rootScope, $scope, $sce, $location) {
    $scope.shellUrl = $sce.trustAsResourceUrl($location.protocol() + '://' + $location.host() + ':57575/');
});