(function() {
	"use strict";

	var socket = io.connect(window.location);

	var Message = function(message) {
		this.nickname = message.nickname;
		this.text = message.text;
	};

	var ChatViewModel = function() {
		var self = this;

		self.nickname = ko.observable('Guest');
		self.joined = ko.observable(false);
		self.chatText = ko.observable('');
		self.error = ko.observable('');

		self.messages = ko.observableArray([]);
		self.nicknames = ko.observableArray([]);

		self.join = function(data, event) {
			if (self.nickname().length <= 0) {
				self.error('nickname cannot be empty');
				return;
			}
			socket.emit('join', this.nickname());
			self.joined(true);
		};

		self.message = function(data, event) {
			socket.emit('msg', new Message(
			{
				nickname: self.nickname(),
				text: self.chatText(),
			}));
			self.chatText('');
		};

		socket.on('newUserJoined', function(data) {
			self.nicknames(data.nicknames);
		});

		socket.on('msg', function(message) {
			self.messages.unshift(message);
		});

		socket.on('nicknames', function(nicknames) {
			self.nicknames(nicknames);
		});

		socket.on('userDisconnected', function(nicknames) {
			self.nicknames(nicknames);
		})

		socket.on('history', function(archive) {
			self.messages(archive);
		})

	};

	ko.applyBindings(new ChatViewModel());

})();