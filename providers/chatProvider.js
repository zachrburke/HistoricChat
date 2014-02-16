"use strict";

var ChatProvider = function(db) {
	this.db = db;
}

ChatProvider.prototype.getCollection = function(callback) {
	this.db.collection('archive', function(error, collection) {
		if (error) callback(error);
		else callback(null, collection)
	});
};

ChatProvider.prototype.addToArchive = function(message, callback) {
	this.getCollection(function(error, collection) {
		if (error) {
			callback(error);
			return;
		}

		collection.insert(message, function() {
			callback(null);
		})
	})
};

ChatProvider.prototype.getChatHistory = function(limit, nickname, callback) {
	this.getCollection(function(error, collection) {
		if (error) {
			callback(error);
			return;
		}

		var query = nickname ? { nickname: nickname } : {}

		collection.find(query, { sort: [['created_at', 'desc']], limit: limit }).toArray(function(error, results) {
			if (error) {
				callback(error);
				return;
			}

			callback(null, results);
		});
	})
};

exports.ChatProvider = ChatProvider;