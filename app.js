"use strict";

var express = require('express');
var routes = require('./routes');
var api = require('./routes/api');
var http = require('http');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var ChatBridge = require('./bridges/chatBridge').ChatBridge;
var config = require('./config');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

MongoClient.connect(config.connectionString, function(err, db) {

	if (err) {
		console.log(err);
	}

	app.set('port', process.env.PORT || 3000);
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));

	io.set('log level', 1);

	if ('development' == app.get('env')) {
	  app.use(express.errorHandler());
	}

	app.get('/', function(req, res) {
		routes.index(req, res, db);
	});

	app.post('/api/send', function(req, res) {
		api.send(req, res, db, io);
	});

	app.get('/api/history/:limit', function(req, res) {
		api.history(req, res, db);
	})

	server.listen(app.get('port'), function(){
	  console.log('Express server listening on port ' + app.get('port'));
	});

	var chatBridge = new ChatBridge(db);
	chatBridge.initSocket(io);



});


