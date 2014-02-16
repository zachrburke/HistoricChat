"use strict";

var ChatProvider = require('../providers/chatProvider').ChatProvider;
var Message = require('../models/message').Message;
var dateformat = require('dateformat');

var ChatBridge = function(db) {
	this.db = db;
	this.nicknames = [];
	this.chatProvider = new ChatProvider(db);
}

ChatBridge.prototype.initSocket = function(io) {
	var self = this;
	self.io = io;

	io.sockets.on('connection', function(socket) {
		self.chatProvider.getChatHistory(10, null, function(error, results) {
			socket.emit('nicknames', self.nicknames);
			
			if (error) {
				console.log(error);
				return;
			}	

			socket.emit('history', results);
		})
		
		socket.on('join', function(nickname) {
			self.onJoin(socket, nickname);
		});
		socket.on('msg', function(message) {
			self.onMessage(message);
		});
		socket.on('disconnect', function() {
			self.onDisconnect(socket);
		});

	});
};

ChatBridge.prototype.addUser = function(nickname) {
	this.nicknames.push(nickname);
};

ChatBridge.prototype.removeUser = function(nickname) {
	var index = this.nicknames.indexOf(nickname);
	this.nicknames.splice(index, 1);
};

ChatBridge.prototype.onJoin = function(socket, nickname) {
	var self = this;

	socket.set('nickname', nickname, function() {
		self.addUser(nickname);

		var message = new Message('HistoricChat', nickname + ' has joined the room');

		self.chatProvider.addToArchive(message, function(error) {
			self.io.sockets.emit('newUserJoined', {nicknames: self.nicknames});
			self.io.sockets.emit('msg', message);
		});
	});
};

ChatBridge.prototype.onMessage = function(message) {
	var self = this;

	message = new Message(message.nickname, message.text);

	this.chatProvider.addToArchive(message, function(error) {
		if (error)
			console.log(error);

		self.io.sockets.emit('msg', message);
	});

};

ChatBridge.prototype.onDisconnect = function(socket) {
	var self = this;

	socket.get('nickname', function(err, nickname) {
		if (err) {
			console.log('there was an error', err);
			return;
		}
		if (!nickname)
			return;

		self.removeUser(nickname);

		var message = new Message('HistoricChat', nickname + ' has left the room');

		self.chatProvider.addToArchive(message, function(error) {
			self.io.sockets.emit('userDisconnected', self.nicknames);
			self.io.sockets.emit('msg', message);
		});
		

		console.log('user disconnected', nickname, self.nicknames);
	})
};

exports.ChatBridge = ChatBridge;
