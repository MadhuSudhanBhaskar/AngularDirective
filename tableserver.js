angular.module('TableServer', [])

    .directive('tableserver', function ($filter,medea) {
        "use strict";
        return {

            restrict: 'A',
            
            replace: true,
            transclude: true,

            scope: {
                title: '@',   
                expandable: '@',
                collapsed: '@',
                itemsUrl: '@', 
                pageSize: '@',
                showFilter: '@',
                showFilterOptions: '@',
                filterOptions: '='
            },

            templateUrl: 'tables/tableserver.tpl.html',

            link: function(scope, elem, attrs) {
                /* see tableclient.js for more information */

                //Setting default and initial values
                scope.expandable = attrs.expandable = attrs.expandable || false;
                scope.collapsed = attrs.collapsed = attrs.collapsed || false;
                scope.pageSize = attrs.pageSize = attrs.pageSize || 5;
                scope.showFilter = attrs.showFilter = attrs.showFilter || false;
                scope.showFilterOptions = attrs.showFilterOptions = attrs.showFilterOptions || false;
                scope.currentPage = 0;
                scope.filter = {}; //for filter values
                scope.filter.searchText = ''; //text filter

                //Always default to first given option for filter-options
                if (scope.showFilterOptions && scope.filterOptions.length > 0) {
                    scope.filter.option = scope.filterOptions[0]; //option filter
                }

                scope.$watch('filter.searchText', function(searchText) {
                    scope.refilter();
                });

                if (attrs.contentfresh === "true") {
                    var contentFresh= setInterval(function() {
                        scope.fetchResult();
                    },10000);
                
                    scope.$on("$destroy", function(){
                        clearInterval(contentFresh);
                    });
                }
                //always do an initial fetch
                scope.fetchResult();
            },

            controller: function ($scope, $attrs, $http) {
                $scope.fetchResult = function() {
                    var url = $scope.itemsUrl + 
                              "?item-count=" + $scope.pageSize +
                              "&start-index=" + ($scope.currentPage * $scope.pageSize + 1);
                    if ($scope.showFilterOptions) {
                        url += "&filter-option=" + $scope.filter.option.value;
                    }
                    if ($scope.showFilter) {
                        url += "&filter=" + $scope.filter.searchText;
                    }
                    medea.dataProvider(url,'','GET').then(function (response) {
                        $scope.data = response;
                        $scope.pageCount = Math.ceil($scope.data.totalItems / $scope.pageSize);
                    });
                };

                $scope.refilter = function() {
                    $scope.currentPage = 0;
                    $scope.fetchResult();
                };

                $scope.prevPage = function() {
                    $scope.currentPage--;
                    $scope.fetchResult();
                };

                $scope.nextPage = function() {
                    $scope.currentPage++;
                    $scope.fetchResult();
                };
            }
        };
    });
