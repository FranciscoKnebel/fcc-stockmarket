const notFound = -1;

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var yahooFinance = require('yahoo-finance');

// define the schema for our user model
var userSchema = mongoose.Schema({
	email: String,
	password: String,
	stocks: [
		{
			symbol: String,
			name: String
		}
	]
}, {
	timestamps: {
		createdAt: 'createdAt',
		updatedAt: 'updatedAt'
	}
});

// generating a hash
userSchema.methods.generateHash = function (password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function (password) {
	return bcrypt.compareSync(password, this.password);
};

userSchema.methods.addStock = function (symbol, callback) {
	var index = findOptionIndex(this.stocks, 'symbol', symbol)
	var stocks = this.stocks;

	if (index === notFound) {
		yahooFinance.snapshot({
			symbol: symbol,
			fields: ['s', 'n']
		}).then(function (snapshot) {
			if (snapshot.name == null) {
				//invalid stock symbol
				console.log("Invalid stock " + symbol);
				callback(false, undefined);
			} else {
				stocks.push({symbol: snapshot.symbol, name: snapshot.name});
				callback(stocks, snapshot);
			}
		});
	} else {
		console.log("Stock already added");
		callback(false, undefined)
	}
}

userSchema.methods.removeStock = function (stock) {
	var index = findOptionIndex(this.stocks, 'symbol', stock);

	if (index === null) {
		return false;
	} else {
		var stocks = this.stocks.splice(index, 1);

		return this.stocks;
	}
}

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);

function findOptionIndex(array, key, value) {
	for (var i = 0; i < array.length; i++) {
		if (array[i][key] == value) {
			return i;
		}
	}
	return notFound;
}
