/* jshint node:true */
'use strict';

var user = require('config').user;

module.exports = function (app) {
  app.post('/login', login);
  app.post('/logout', logout);
  app.get('/loggedIn', loggedIn);
  app.post('/verify', app.m.auth, verify);
};

function login(req, res) {
  if (!req.body || !req.body.name || !req.body.pass) {
    return res.fail('Must include Username and Password.');
  }
  if (req.body.name !== user.name || req.body.pass !== user.pass) {
    return res.fail('Incorrect Username or Password.');
  }
  req.session.loggedIn = true;
  res.success();
}

function logout(req, res) {
  req.session.destroy(function () {
    res.success();
  });
}

function loggedIn(req, res) {
  res.send({
    success: true,
    loggedIn: req.session.loggedIn
  });
}

function verify(req, res) {
  res.success();
}
