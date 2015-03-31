app.directive('tutorialViewer', function() {
    return {
        restrict: 'E',
        scope: {
            tutorial: '=',
            bookmark: '='
        },
        controller: function($scope, TintResources) {
            $scope.currentView = 'app/tutorials/directives/tutorial-viewer/toc.html';

            $scope.selectTocItem = function(tocItem) {
                if (tocItem.file) {
                    $scope.content = null;
                    $scope.error = null;

                    TintResources.read(
                        {
                            type: $scope.tutorial.type,
                            owner: $scope.tutorial.owner.username,
                            slug: $scope.tutorial.slug
                        },
                        tocItem.file
                    ).success(function(data, status, headers, config) {
                            $scope.content = data;
                            $scope.currentView = 'app/tutorials/directives/tutorial-viewer/content.html';
                    }).error(function(data, status, headers, config) {
                            $scope.error = data;
                            $scope.currentView = 'app/tutorials/directives/tutorial-viewer/content.html';
                    });
                }
            }
        },
        templateUrl: 'app/tutorials/directives/tutorial-viewer/view.html'
    };
});
