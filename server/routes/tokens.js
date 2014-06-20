/* jshint node:true */
'use strict';

var TOKEN_PATH = __dirname + '/../../data/tokens.json';

var fs = require('fs');
var  _ = require('underscore');

module.exports = function (app) {
  app.post('/generateToken', app.m.auth, generateToken);
  app.post('/invalidateToken', app.m.auth, invalidateToken);
  app.post('/deleteToken', app.m.auth, removeToken);
  app.get('/tokens', app.m.auth, getTokens);
};

function generateToken(req, res) {
  var obj = {
    token: _uuid(),
    isValid: true
  };
  if (req.body && req.body.date) obj.expiry = req.body.date;
  fs.readFile(TOKEN_PATH, 'utf8', function (err, tokens) {
    if (err) return res.fail('Could not open tokens file.');
    tokens = JSON.parse(tokens);
    tokens.push(obj);
    fs.writeFile(TOKEN_PATH, JSON.stringify(tokens), function (err) {
      if (err) return res.fail('Problem writing tokens file.');
      res.send({
        success: true,
        token: obj
      });
    });
  });
}

function invalidateToken(req, res) {
  var token = req.body && req.body.token;
  if (!token) {
    return res.fail('Must include which token to delete.');
  }
  fs.readFile(TOKEN_PATH, 'utf8', function (err, tokens) {
    if (err) return res.fail('Could not open tokens file.');
    tokens = JSON.parse(tokens);
    var toInvalidate = _.findWhere(tokens, { token: token });
    if (!toInvalidate) return res.fail('Token does not exist.');
    toInvalidate.isValid = false;
    fs.writeFile(TOKEN_PATH, JSON.stringify(tokens), function (err) {
      if (err) return res.fail('Problem writing tokens file.');
      res.success();
    });
  });
}

function removeToken(req, res) {
  var token = req.body && req.body.token;
  if (!token) {
    return res.fail('Must include which token to delete.');
  }
  fs.readFile(TOKEN_PATH, 'utf8', function (err, tokens) {
    if (err) return res.fail('Could not open tokens file.');
    tokens = JSON.parse(tokens);
    var toDelete = _.findWhere(tokens, { token: token });
    if (!toDelete) return res.fail('Token does not exist.');
    tokens = _.without(tokens, toDelete);
    fs.writeFile(TOKEN_PATH, JSON.stringify(tokens), function (err) {
      if (err) return res.fail('Problem writing tokens file.');
      res.success();
    });
  });
}

function getTokens(req, res) {
  fs.readFile(TOKEN_PATH, 'utf8', function (err, tokens) {
    if (err) return res.fail('Could not open tokens file.');
    res.send({
      success: true,
      tokens: JSON.parse(tokens)
    });
  });
}

// -- Private Functions --------------------------------------------------------

function _uuid() {
  return [
    _s4() + _s4(),
    _s4(),
    _s4(),
    _s4(),
    _s4() + _s4() + _s4()
  ].join('-');
}

function _s4() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}
