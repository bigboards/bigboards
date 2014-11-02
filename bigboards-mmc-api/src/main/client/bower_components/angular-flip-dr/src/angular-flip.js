'use strict';

angular.module('drFlip', [])
  .directive('drFlip', function() {
    return {
      restrict: 'AE',
      transclude: true,
      replace: true,
      scope: {
        drFlipped: '=?'
      },
      template:
        '<div class="dr-flip" ng-transclude>' +
        '</div>',
      controller: ['$scope', '$element', function($scope, $element) {
        this.toggle = function() {
          var flipped = !$element.hasClass('flipped');
          $scope.$apply(function() {
            $scope.drFlipped = flipped;
          });
        };

        this.flipFront = function() {
          $scope.drFlipped = false;
        };

        this.flipBack = function() {
          $scope.drFlipped = true;
        };
        this.ie = function() {
          var undef,
            v = 3,
            div = document.createElement('div'),
            all = div.getElementsByTagName('i');

          while (
            div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
            all[0]
          ) {}
          return v > 4 ? v : undef;
        };
        if (this.ie() <= 8) {
          document.createElement('dr-flip');
          document.createElement('dr-flip-front');
          document.createElement('dr-flip-back');
        }
      }],
      link: function(scope, elm, attrs, controller) {
        if (controller.ie() <= 9) {
          elm.addClass('fallback');
        }

        scope.$watch('drFlipped', function(newValue, oldValue) {
          if (newValue) {
            elm.addClass('flipped');
            elm.removeClass('unflipped');
          } else {
            elm.removeClass('flipped');
            elm.addClass('unflipped');
          }
        });
      }
    };
  })
  .directive('drFlipFront', function() {
    return {
      require: '^drFlip',
      restrict: 'AE',
      replace: true,
      transclude: true,
      template:
        '<div class="face front" ng-transclude></div>'
    };
  })
  .directive('drFlipBack', function() {
    return {
      require: '^drFlip',
      restrict: 'AE',
      replace: true,
      transclude: true,
      template:
       '<div class="face back" ng-transclude></div>'
    };
  })
  .directive('drFlipToggle', function() {
    return {
      require: '^drFlip',
      restrict: 'A',
      link: function(scope, elm, attrs, controller) {
        var previousValue;

        attrs.$observe('drFlipToggle', function(value) {
          if (!value) {
            value = 'click';
          }

          if (previousValue) {
            elm.off(previousValue, controller.toggle);
          }

          previousValue = value;

          elm.on(value, controller.toggle);
        });
      }
    };
  });
