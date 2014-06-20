/* jshint node:true */
'use strict';

// --- Requires ----------------------------------------------------------------

var  express = require('express');
var   stylus = require('stylus');
var   config = require('config');
var     http = require('http');
var       fs = require('fs');
var        _ = require('underscore');

_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

// --- Start Express -----------------------------------------------------------

var app = express();
var server = http.createServer(app);

app.set('port', config.port);
app.sessionStore = new express.session.MemoryStore();

// --- Load Middlewares --------------------------------------------------------

var success = require('./middleware/success.js');
var    fail = require('./middleware/fail.js');

// --- Express Config ----------------------------------------------------------

app.use(express.favicon());
app.use(stylus.middleware({
  debug: true,
  src: 'client',
  dest: 'client'
}));
app.use(express.static('client'));
app.use(express.logger());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
  store: app.sessionStore,
  key: config.session.key,
  secret: config.session.secret
}));
app.use(success);
app.use(fail);
app.use(app.router);
app.use(express.errorHandler());

// --- Setup Middleware --------------------------------------------------------

app.m = {};

fs.readdirSync(__dirname + '/route-middleware').forEach(function(file) {
  require('./route-middleware/' + file)(app);
});

// --- Setup Routes ------------------------------------------------------------

fs.readdirSync(__dirname + '/routes').forEach(function(file) {
  require('./routes/' + file)(app);
});

// --- Start Server ------------------------------------------------------------

server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
