tintModule.controller('TintConfigurationController', function($rootScope, $scope, socket) {


    socket.emit('hex:tint:configuration', null, function(data) {
        $scope.configuration = data;
    });
});

tintModule.controller('TintDetailController', function($rootScope, $scope) {
    $scope.currentAction = null;
    $scope.actionState = "none";
    $scope.actionsClass = null;

    $scope.invokeAction = function(action) {
        $scope.currentAction = action;
        $scope.actionState = "executing";
        $scope.actionsClass = "disabled";

        Tint.save(
            {category: 'actions', categoryId: action.id},
            null,
            function(data) {
                $scope.actionState = "completed";
                $scope.feedback = data;
                $scope.actionsClass = null;
            },
            function(data) {
                $scope.actionState = "failed";
                $scope.feedback = data;
                $scope.actionsClass = null;
            }
        );
    }
});

tintModule.controller('TintViewController', function($rootScope, $scope, $sce, $routeParams, Tints) {


    // -- if the views are not available we will register a listener so they are handled
    // -- the moment they do become available
    if ((! $rootScope.tint.views) || ($rootScope.tint.views.length == 0)) {
        $rootScope.$on('viewsLoaded', boot);
    } else {
        boot();
    }

    function boot() {
        $scope.tintId = $routeParams['tintId'];
        $scope.viewId = $routeParams['viewId'];

        $scope.view = $rootScope.tint.views[$scope.viewId];
        $scope.url = $sce.trustAsResourceUrl($scope.view.url);
    }


});

tintModule.controller('TintViewSelectorController', function($scope, $sce, $routeParams, $location, Tints) {
    $scope.tint = Tints.get({tintId: $scope.hex.tint}, function(tint) {
        if (! tint.views) return;

        if (tint.views.length == 1) {
            $scope.currentView = tint.views[0];
            $scope.url = $sce.trustAsResourceUrl($scope.currentView.url.replace('{{external_ip}}', $location.host()));
        } else {
            // -- parse the actions
            tint.views.forEach(function (view) {
                $scope.actions.push({
                    iconClass: view.icon,
                    execute: function() {
                        $scope.currentView = view;
                        $scope.url = $sce.trustAsResourceUrl($scope.currentView.url.replace('{{external_ip}}', $location.host()));
                    }
                });
            });
        }
    });

    $scope.url = "";
    $scope.actions = [];

    $scope.select = function(view) {
        $scope.currentView = view;
        $scope.url = $sce.trustAsResourceUrl($scope.currentView.url.replace('{{external_ip}}', $location.host()));
    };
});