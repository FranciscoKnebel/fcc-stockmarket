var User = require('../models/user');

module.exports = function (app, dirname) {

	app.get('/stock', isLoggedIn, function (req, res) {
		User.findOne({
			_id: req.user.id
		}, function (err, user) {
			if (err)
				throw err;

			var chart = createChart(user.stocks);
			res.status(200).send(chart);
		});
	});

	app.post('/stock/new', isLoggedIn, function (req, res) {
		var stock = req.body.stock;
		console.log(stock);

		if (!stock || 0 === stock.length) { //empty, null, undefined
			res.send("Undefined stock name.");
		} else {
			User.findOne({
				_id: req.user.id
			}, function (err, user) {
				if (err)
					throw err;

				var stocks = user.addStock(stock);
				if (!stocks)
					res.send("User already added this stock.");
				else {
					user.save(function (err) {
						if (err)
							throw err;

						var chart = createChart(user.stocks);
						res.status(200).send(chart);
					})
				}
			});
		}
	});

	app.delete('/stock/', isLoggedIn, function (req, res) {
		var stock = req.body.stock;
		console.log(stock);

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

					var chart = createChart(user.stocks);
					res.status(200).send(chart);
					console.log("User removed stock " + stock);
				});
			}
		});
	});
};

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();
	else {
		res.redirect('/login');
	}
}

function createChart(stocks) {

	return stocks;
}
