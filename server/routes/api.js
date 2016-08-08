var User = require('../models/user');
var yahooFinance = require('yahoo-finance');

const stockAge = 3; // Amount of years you want to get stock data.

module.exports = function (app, dirname) {

	app.get('/stock', isLoggedIn, function (req, res) {
		User.findOne({
			_id: req.user.id
		}, function (err, user) {
			if (err)
				throw err;

			var chart = createStocks(user.stocks);
			res.status(200).send(chart);
		});
	});

	app.post('/stock/new', isLoggedIn, function (req, res) {
		var stock = req.body.stock;

		if (!stock || 0 === stock.length || stock === "") { //empty, null, undefined
			res.status(403).send("Undefined stock name.");
		} else {
			User.findOne({
				_id: req.user.id
			}, function (err, user) {
				if (err)
					throw err;

				user.addStock(stock, function (stocks) {
					if (!stocks)
						res.status(403).send("User already added this stock or stock is invalid.");
					else {
						user.save(function (err) {
							if (err)
								throw err;

							createStocks(user.stocks, res);
						})
					}
				});
			});
		}
	});

	app.delete('/stock/:stock', isLoggedIn, function (req, res) {
		var stock = req.params.stock;

		User.findOne({
			_id: req.user.id
		}, function (err, user) {
			if (err)
				throw err;

			var stocks = user.removeStock(stock);
			if (!stocks) {
				res.status(404).send("Stock not found.");
			} else {
				user.save(function (err) {
					if (err)
						throw err;

					console.log("User removed stock " + stock);
					createStocks(user.stocks, res);
				});
			}
		});
	});

	app.post('/snapshot', function (req, res) {
		var obj = {};
		yahooFinance.snapshot({
			symbol: req.body.symbol,
			fields: ['s', 'n']
		}).then(function (snapshot) {
			if (snapshot.name == null) {
				//invalid stock symbol
				console.log("Invalid stock " + req.body.symbol);
				res.send(undefined);
			} else {
				obj = {
					symbol: snapshot.symbol,
					name: snapshot.name
				};
				res.send(obj);
			}
		});
	});

	app.post('/initial/', isLoggedIn, function (req, res) {
		createStocks(req.body, res);
	});
};

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();
	else {
		res.redirect('/login');
	}
}

function createStocks(stocks, res) {
	var symbols = [];
	stocks.forEach(elem => {
		symbols.push(elem.symbol);
	});

	if (symbols.length > 0) {
		var aux = new Date();
		aux.setFullYear(aux.getFullYear() - stockAge); // stockAge years prior

		var then = aux.toISOString().split('T')[0]; // get yyyy-mm-dd format
		var now = new Date().toISOString().split('T')[0];

		yahooFinance.historical({
			symbols: symbols,
			from: then,
			to: now,
			period: 'd'
		}, function (err, results) {
			if (err)
				console.error(err);

			res.status(200).send(parseStocks(results));
		});
	} else {
		res.status(200).send(undefined);
	}
}

function parseStocks(results) {
	var stocks = [];
	if (results) {
		Object.keys(results).forEach(function (key, index) {
			if (!key || 0 === key.length || key === "") {
				//invalid stock
				console.log("Invalid stock: " + key);
			} else {
				var stock = {
					symbol: key
				}

				var data = [];
				results[key].forEach(elem => {
					var date = new Date(elem.date);
					data.push([date.getTime(), elem.close]);
				});
				stock.data = data;
				stocks.push(stock);
			}
		});
	}

	return stocks;
}
