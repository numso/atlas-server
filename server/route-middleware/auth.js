/* jshint node:true */
'use strict';

var TOKEN_PATH = __dirname + '/../../data/tokens.json';

var fs = require('fs');
var  _ = require('underscore');

module.exports = function (app) {
  app.m.auth = auth;
};

function auth(req, res, next) {
  if (hasSession(req)) return next();
  hasToken(req, function (isValid) {
    if (isValid) return next();
    res.fail('Invalid Token or Session');
  });
}

function hasSession(req) {
  return req.session && req.session.loggedIn;
}

function hasToken(req, cb) {
  var token = req.body && req.body.token;
  if (!token) return cb();
  fs.readFile(TOKEN_PATH, 'utf8', function (err, tokens) {
    if (err) return cb();
    tokens = JSON.parse(tokens);
    var matching = _.findWhere(tokens, { token: token });
    if (!matching) return cb();
    console.log(matching);
    cb(matching.isValid && (!matching.expiry || matching.expiry > new Date()));
  });
}
