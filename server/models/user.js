const notFound = -1;

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
	email: String,
	password: String,
	stocks: [String]
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

userSchema.methods.addStock = function (stock) {
	var index = this.stocks.indexOf(stock);
	if (index === notFound) {
		this.stocks.push(stock);
		return this.stocks;
	} else {
		return false;
	}
}

userSchema.methods.removeStock = function (stock) {
	var index = this.stocks.indexOf(stock);
	if (index === notFound) {
		return false;
	} else {
		var stocks = this.stocks.splice(index, 1);
		this.stocks = stocks;

		return this.stocks;
	}
}

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
