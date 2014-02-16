"use strict";

var ChatProvider = require('../providers/chatProvider').ChatProvider;
var Message = require('../models/message').Message;
var dateformat = require('dateformat');

/*
	POST /api/send send message to chatroom
	@nickname: name to appear in chat
	@text: body of the message
*/
exports.send = function(req, res, db, io) {
	var chatProvider = new ChatProvider(db);

	var message = new Message(req.body.nickname, req.body.text);
	message.created_at = new Date();
	message.timestamp = dateformat(message.created_at, '(HH:MM:ss)');

	chatProvider.addToArchive(message, function(error) {
		if (error)
			res.json({ error: error });

		io.sockets.emit('msg', message);
		res.json({ status: 'ok' });
	});
};


/*
	GET /api/history/:limit pull down history
	@limit: number of messages to pull down, max of 1000
*/
exports.history = function(req, res, db) {
	var chatProvider = new ChatProvider(db);

	var limit = req.params.limit > 1000 ? 1000 : req.params.limit;

	chatProvider.getChatHistory(limit, function(error, results) {
		if (error) {
			res.json({ error: error });
		}

		res.json(results);
	})
}

