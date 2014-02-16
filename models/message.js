var dateformat = require('dateformat');

exports.Message = function(nickname, text) {
	this.nickname = nickname;
	this.text = text;
	this.created_at = new Date();
	this.timestamp = dateformat(this.created_at, '(HH:MM:ss)');
}