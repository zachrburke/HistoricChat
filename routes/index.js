/*
 * GET home page.
 */

exports.index = function(req, res, db) {
	res.render('index', { title: 'Historic Chat' });
};

