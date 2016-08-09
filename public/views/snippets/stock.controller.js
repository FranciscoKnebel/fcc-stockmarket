function findOptionIndex(array, value) {
	for (var i = 0; i < array.length; i++) {
		if (array[i] == value) {
			return i;
		}
	}
	return null;
}

var app = angular.module('myapp', ["highcharts-ng"]);

app.controller('stocks', function ($scope, $http, $timeout) {
	$scope.addStock = function () {
		if ($scope.loading != true) {
			$scope.loading = true;
			$scope.message = "";

			var obj = {
				stock: $scope.newStock.toUpperCase()
			}
			$http.post("/stock/new", obj).then(function (res) {
				if (res.status == 200) {
					if ($scope.stocks == undefined) {
						$scope.stocks = [];
					}
					let objec = {
						symbol: obj.stock
					}

					let elem = res.data[res.data.length - 1];

					$scope.chartConfig.series.push({name: elem.symbol, data: elem.data});

					$http.post("/snapshot", objec).then(function (resp) {
						$scope.stocks.push({symbol: resp.data.symbol, name: resp.data.name});
						$scope.loading = false;
					});

				} else {
					$scope.message = res.data;
					$scope.loading = false;
				}
			}, function (err) {
				$scope.message = err.data;
				$scope.loading = false;
			});
		}
	}

	$scope.removeStock = function (stock) {
		if ($scope.loading != true) {
			$scope.loading = true;
			$scope.message = "";

			$http.delete("/stock/" + stock.symbol).then(function (res) {
				var index = findOptionIndex($scope.stocks, stock);
				$scope.stocks.splice(index, 1);

				if ($scope.stocks.length === 0) {
					$scope.stocks = undefined;
					$scope.chartConfig.series = [];
				} else {
					$scope.chartConfig.series.splice(index, 1);
				}
				$scope.loading = false;
			}, function (err) {
				$scope.message = err.data;
				$scope.loading = false;
			})
		}
	}

	$scope.chartConfig = {
		options: {
			chart: {
				zoomType: 'x'
			},
			rangeSelector: {
				enabled: true
			},
			navigator: {
				enabled: true
			}
		},
		series: [],
		title: {
			text: 'Stock Market by <%= user.email %>'
		},
		useHighStocks: true
	}

	$scope.setInitial = function (stocks) {
		if (stocks != null) {
			$http.post("/initial", stocks).then(function (res) {
				res.data.forEach(elem => {
					$scope.chartConfig.series.push({name: elem.symbol, data: elem.data});
				});
			});
		}
	}

	$scope.closeMessage = function () {
		$scope.message = "";
	}

	<% if(user.stocks[0]) { %>
	$scope.stocks = [
		<% for(var i = 0; i < user.stocks.length -1; i++) { %>{
			symbol: '<%= user.stocks[i].symbol %>',
			name: '<%= user.stocks[i].name %>'
		},
		<% } %>{
			symbol: '<%= user.stocks[i].symbol %>',
			name: '<%= user.stocks[i].name %>'
		}
	]<% } %>

	$scope.newStock = "";
	$scope.loading = false;
	$scope.setInitial($scope.stocks);
	angular.element(document).find(".nojs").removeClass("nojs");
});
