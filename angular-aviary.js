/*
	angular-aviary v0.5.1
	(c) 2015 Massimiliano Sartoretto <massimilianosartoretto@gmail.com>
	License: MIT
*/

'format amd';
/* global define */

(function () {
  'use strict';

  function ngAviary(angular, Aviary) {

    return angular
      .module('ngAviary', [])
      .directive('ngAviary', ['ngAviary', ngAviaryDirective])
      .provider('ngAviary', ngAviaryProvider);

    function ngAviaryDirective(ngAviary) {
      return {
        restrict: 'E',
        scope: {
          targetSelector: '@',
          targetSrc: '@',
          onSave: '&',
          onSaveButtonClicked: '&',
					appendTo: '@',
					open:'=',
          onReady: '&'
        },
        link: function (scope, element, attrs) {
					//debugger;
          var targetImage = window.document.querySelector(scope.targetSelector);
					
					scope.$watch('open',function(newValue,oldValue){
						
						if(newValue === true){
							setTimeout(function(){ 
									console.log('I was clicked');
								return launchEditor(); }, 2000);
						}
						
					});


          // Callbacks obj
          var cbs = {
            onSaveButtonClicked: onSaveButtonClickedCb,
            onSave: onSaveCb,
            onError: onErrorCb,
            onClose: onCloseCb,
			theme: 'minimum',
            onReady: onReadyCb

          };

          var featherEditor = new Aviary.Feather(
            angular.extend({}, ngAviary.configuration, cbs)
          );

          function launchEditor() {
            var options = {
              image: targetImage,
							url: scope.targetSrc || targetImage.src
            };
						
						if(scope.appendTo){
							var container =  window.document.querySelector(scope.appendTo);
							options.appendTo = container;
						}
						
						featherEditor.launch(options);
		
						
            return false;
          }

          function onSaveButtonClickedCb(imageID) {
            // User onSaveButtonClicked callback
            (scope.onSaveButtonClicked || angular.noop)({id: imageID});
          }

          function onSaveCb(imageID, newURL) {
            // User onSave callback
            (scope.onSave || angular.noop)({
              id: imageID,
              newURL: newURL
            });

            if(scope.closeOnSave || ngAviary.configuration.closeOnSave){
              featherEditor.close();
            }
          }
          
          function onReadyCb(){
            (scope.onReady || angular.noop)();
          }

          function onErrorCb(errorObj) {
            // User errback
            (scope.onError || angular.noop)({
              error: errorObj
            });
          }

          function onCloseCb(isDirty) {
            // User onClose callback
            (scope.onClose || angular.noop)({
              isDirty: isDirty
            });
          }
        }
      };
    }

    function ngAviaryProvider(){
      /* jshint validthis:true */

      var defaults = {
        apiKey: null
      };

      var requiredKeys = [
        'apiKey'
      ];

      var config;

      this.configure = function(params) {
        // Can only be configured once
        if (config) {
          throw new Error('Already configured.');
        }

        // Check if it is an `object`
        if (!(params instanceof Object)) {
          throw new TypeError('Invalid argument: `config` must be an `Object`.');
        }

        // Extend default configuration
        config = angular.extend({}, defaults, params);

        // Check if all required keys are set
        angular.forEach(requiredKeys, function(key) {
          if (!config[key]) {
            throw new Error('Missing parameter:', key);
          }
        });

        return config;
      };

      this.$get = function() {
        if(!config) {
          throw new Error('ngAviary must be configured first.');
        }

        var getConfig = (function() {
          return config;
        })();

        return {
          configuration: getConfig
        };
      };
    }
  }

  if (typeof define === 'function' && define.amd) {
		define(['angular', 'Aviary'], ngAviary);
	} else if (typeof module !== 'undefined' && module && module.exports) {
		ngAviary(angular, require('Aviary'));
		module.exports = 'ngAviary';
	} else {
		ngAviary(angular, (typeof global !== 'undefined' ? global : window).Aviary);
	}
})();