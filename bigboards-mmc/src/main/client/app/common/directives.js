app.directive('hex', function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            type: '@',
            helpRef: '@',
            bbClick: '='
        },
        controller: function ($scope) {
        },
        link: function ($scope, $element, $attributes) {
            // -- try to find the help element
            if ($scope.helpRef) {
                var hexElement = $($element.children("div.hex")[0]);

                if ($scope.bbClick)
                    hexElement.click($scope.bbClick);

                hexElement.hover(function() {
                    var helpElement = $("#" + $scope.helpRef + ' > div.hex > div.content');

                    if (helpElement)
                        helpElement.show();
                },function() {
                    var helpElement = $("#" + $scope.helpRef + ' > div.hex > div.content');

                    if (helpElement)
                        helpElement.hide();
                });
            }
        },
        templateUrl: 'app/common/directives/hex.html'
    };
});

app.directive('hexButton', function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            type: '@',
            helpRef: '@',
            bbClick: '=',
            attention: '='
        },
        controller: function ($scope) {
            $scope.additionalStyle = function() {
                if ($scope.attention) {
                    return $scope.type + ' attention attention-warn';
                } else
                    return $scope.type;
            };
        },
        link: function ($scope, $element, $attributes) {
            // -- try to find the help element
            if ($scope.helpRef) {
                var hexElement = $($element.children("div.hex")[0]);

                if ($scope.bbClick)
                    hexElement.click($scope.bbClick);

                hexElement.hover(function() {
                    var helpElement = $("#" + $scope.helpRef + ' > div.hex > div.content');

                    if (helpElement)
                        helpElement.show();
                },function() {
                    var helpElement = $("#" + $scope.helpRef + ' > div.hex > div.content');

                    if (helpElement)
                        helpElement.hide();
                });
            }
        },
        templateUrl: 'app/common/directives/hex-button.html'
    };
});

app.directive('hexHeader', function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            type: '@'
        },
        templateUrl: 'app/common/directives/hex-header.html'
    };
});

app.directive('hexHelp', function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            type: '@'
        },
        templateUrl: 'app/common/directives/hex-help.html'
    };
});

app.directive('hexSlot', function() {
    return {
        restrict: 'E',
        scope: {
            slot: '='
        },
        controller: function ($scope) {
            $scope.healthClass = function() {
                if (! $scope.slot) return '';

                if ($scope.slot.occupant) {
                    if ($scope.slot.occupant.health) return $scope.slot.occupant.health.availability;
                }

                return '';
            }
        },
        templateUrl: 'app/common/directives/hex-slot.html'
    };
});

app.directive('metricIndicator', function () {
    return {
        restrict: 'E',
        scope: {
            data: '=',
            title: '@',
            maxValue: '@',
            valueFunction: '=',
            totalFunction: '=',
            warningThreshold: '@',
            cautionThreshold: '@'
        },
        controller: function ($scope, googleChartApiPromise) {
            var dataTable = null;

            googleChartApiPromise.then(function () {
                dataTable = new google.visualization.DataTable();
                dataTable.addColumn("string", "time");
                dataTable.addColumn("number", $scope.title);
                dataTable.addColumn({type: "string", role: "style"}, "style");

                $scope.chartViewState = {
                    type: "ColumnChart",
                    data: dataTable,
                    options: {
                        isStacked: false,
                        backgroundColor: 'transparent',
                        bar: {
                            groupWidth: '90%'
                        },
                        chartArea: {
                            left: '0',
                            top: '0',
                            width: '100%',
                            height: '100%'
                        },
                        legend: {
                            position: 'none'
                        },
                        titlePosition: 'none',
                        axisTitlePosition: 'none',
                        tooltip: {
                            trigger: 'focus' // 'none' to disable, 'focus' to enable
                        },
                        hAxis: {
                            textPosition: 'none',
                            baselineColor: 'transparent',
                            gridlines: {
                                color: 'transparent'
                            }
                        },
                        vAxis: {
                            minValue: '0',
                            maxValue: '100', // we want to fix the scale to prevent bouncing of the columns
                            textPosition: 'none',
                            baselineColor: 'transparent',
                            gridlines: {
                                color: 'transparent'
                            }
                        }
                    }
                };

                $scope.$watch('data', function () {
                    $scope.update();
                });

                $scope.update = function () {
                    // Clear the table
                    dataTable.removeRows(0, dataTable.getNumberOfRows());

                    // Rebuild the table
                    var l = $scope.data.length;
                    for (var i = 0; i < l; i++) {
                        var h = $scope.data;
                        var metric = $scope.data[i];

                        if (metric != undefined && metric != null) {
                            var value = Math.round($scope.valueFunction(metric));
                            var total = Math.round($scope.totalFunction(metric));

                            var percentage = total == 0 ? 0 : Math.round(value * 100 / total);

                            var time_string = '';
                            if (metric.timestamp != '') {
                                var time = new Date(metric.timestamp);
                                time_string = time.toLocaleTimeString();
                            }

                            var color = percentage <= ($scope.warningThreshold == undefined ? 75 : $scope.warningThreshold)
                                ? 'darkgreen'
                                : percentage <= ($scope.cautionThreshold == undefined ? 90 : $scope.cautionThreshold)
                                ? 'orange'
                                : 'darkred';

                            if ($scope.chartViewState.options.vAxis.maxValue < total) {
                                $scope.chartViewState.options.vAxis.maxValue = total
                            }

                            dataTable.addRow([time_string, value, color]);
                        }
                        else {
                            dataTable.addRow(['', 0, '']);
                        }
                    }
                }
            });
        },
        templateUrl: 'app/common/directives/metric-indicator.html'
    };
});

app.directive('initFocus', function($timeout, $parse) {
    var timer;

    return function(scope, elm, attr) {
        if (timer) clearTimeout(timer);

        timer = setTimeout(function() {
            elm.focus();
            console.log('focus', elm);
        }, 0);
    };
});

app.directive('fldText', function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            name: '@',
            label: '@',
            model: '='
        },
        controller: function ($scope) {},
        templateUrl: 'app/common/directives/directives/fld_text.html'
    };
});

app.directive('tasks', function() {
    return {
        restrict: 'E',
        scope: {
            type: '@',
            helpRef: '@',
            bbClick: '='
        },
        controller: function ($scope, Tasks, socket) {
            $scope.visible = false;
            $scope.status = {
                state: 'running'
            };

            Tasks.get().$promise.then(function(task) {
                if (task == null) return;

                $scope.task = task;
                $scope.visible = true;
            }, function(error) {
                // -- disregard the error
            });

            $scope.hide = function() {
                $scope.visible = false;
            };

            socket.on('task:started', function(task) {
                $scope.task = task;
                $scope.visible = true;

                $scope.status = {
                    state: 'running'
                };
            });

            socket.on('task:finished', function(task) {
                $scope.visible = false;
                $scope.task = null;
            });

            socket.on('task:failed', function(task) {
                $scope.status = {
                    state: 'failed',
                    msg: task.error
                };
            });
        },
        link: function ($scope, $element, $attributes) {},
        templateUrl: 'app/common/directives/tasks.html'
    };
});


/**********************************************************************************************************************
 *
 *   PAGE LAYOUT
 *
 *********************************************************************************************************************/

app.directive('bbHeader', function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            icon: '@',
            title: '@'
        },
        controller: function ($scope) { },
        link: function ($scope, $element, $attributes) { },
        templateUrl: 'app/common/directives/header.html'
    };
});

app.directive('bbContent', function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: { },
        controller: function ($scope) {},
        templateUrl: 'app/common/directives/content.html'
    };
});

app.directive('bbSidepane', function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            icon: '@',
            actions: '='
        },
        controller: function ($rootScope, $scope, $location, $sce, Tasks, socket) {
            $scope.currentClass = "bb-sidepane-slim";
            $scope.taskError = null;

            $scope.task = Tasks.get(function(data) {
                if (data && data.code) $rootScope.$broadcast('tasks:show');
            });

            /**********************************************************************************************************
             * UI Actions
             *********************************************************************************************************/
            $scope.invokeBack = function() {
                if ($scope.currentClass == 'bb-sidepane-large') {
                    $scope.currentClass = 'bb-sidepane-slim';
                } else {
                    $location.path('/dashboard');
                }
            };

            $scope.invoke = function(action) {
                action.execute();
            };

            /**********************************************************************************************************
             * $Scope Events
             *********************************************************************************************************/
            $scope.$on('sidebar:show', function(event, data) {
                $scope.currentClass = "bb-sidepane-large";
                $scope.currentUrl = $sce.trustAsResourceUrl(data.view);
            });

            $scope.$on('sidebar:hide', function(event, data) {
                $scope.currentClass = "bb-sidepane-slim";
            });
        },
        templateUrl: 'app/common/directives/side_pane.html'
    };
});

app.directive('bbTaskTile', function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            icon: '@',
            actions: '='
        },
        controller: function ($rootScope, $scope, $location, $sce, Tasks, socket) {
            $scope.currentClass = "bb-sidepane-slim";
            $scope.taskError = null;

            $scope.task = Tasks.get(function(data) {
                if (data && data.code) $rootScope.$broadcast('tasks:show');
            });

            /**********************************************************************************************************
             * UI Actions
             *********************************************************************************************************/
            $scope.toggleTasks = function() {
                $rootScope.$broadcast('tasks:toggle');
            };

            /**********************************************************************************************************
             * React on Socket Events
             *********************************************************************************************************/
            socket.on('task:started', function(task) {
                $scope.task = task;
            });

            socket.on('task:success', function(code) {
                $scope.task = null;
            });

            socket.on('task:failed', function(error) {
                $scope.task = null;
                $scope.taskError = error;
            });
        },
        templateUrl: 'app/common/directives/task-tile.html'
    };
});