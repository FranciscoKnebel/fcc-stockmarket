'use strict';
module.exports = function (app, dirname, passport) {

	require('./static')(app, dirname);

	app.get('/', function (req, res) {
		res.render('index.ejs', {user: req.user});
	});

	app.get('/logout', isLoggedIn, function (req, res) {
		req.logout();

		res.redirect('/');
	});

	app.get('/profile', function (req, res) {
		res.render('profile.ejs', {user: req.user});
	});
}

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) 
		return next();
	else
		res.redirect('/login');
	}
