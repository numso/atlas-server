/* jshint node:true */
'use strict';

var cli = require('../utils/command-line.js');
var servers = require('../utils/servers.js');

module.exports = function (app) {
  app.post('/addServer', app.m.auth, add);
  app.post('/removeServer', app.m.auth, remove);
  app.post('/listServers', app.m.auth, list);
  app.post('/startServer', app.m.auth, start);
  app.post('/stopServer', app.m.auth, stop);
};

function remove(req, res) {
  if (!req.body || !req.body.url) {
    return res.fail('Must include url.');
  }

  var url = req.body.url;
  servers.setState(url, 'Destroying');

  cli.removeProject(url).then(function () {
    return cli.removeNginxEntry(url);
  }).then(function () {
    return cli.reloadNginx();
  }).then(function () {
    return cli.foreverStop(url);
  }).then(function () {
    return cli.removeInfo(url);
  }).then(function () {
    res.send({
      success: true,
      msg: 'Server ' + url + ' has been successfully removed.'
    });
  }).fail(function (err) {
    res.fail(err);
  });
}

function start(req, res) {
  if (!req.body || !req.body.url) {
    return res.fail('Must include url.');
  }
  var url = req.body.url;
  servers.get(url).then(function (server) {
    if (!server) return res.fail('no server with that domain');
    if (server.state === 'Running') return res.fail('server already running');
    cli.foreverStart(url, server.port);
    servers.setState(url, 'Running');
    res.success();
  });
}

function stop(req, res) {
  if (!req.body || !req.body.url) {
    return res.fail('Must include url.');
  }
  var url = req.body.url;
  servers.get(url).then(function (server) {
    if (!server) return res.fail('no server with that domain');
    if (server.state === 'Stopped') return res.fail('server already stopped');
    cli.foreverStop(url);
    servers.setState(url, 'Stopped');
    res.success();
  });
}

function list(req, res) {
  servers.list().then(function (_servers) {
    res.send({
      success: true,
      servers: _servers
    });
  });
}

function add(req, res) {
  if (!req.body || !req.body.git || !req.body.subdomain || !req.body.domain) {
    return res.fail('Must include git, subdomain, and domain.');
  }

  var json = {
    git: req.body.git,
    domain: req.body.domain,
    subdomain: req.body.subdomain,
    url: req.body.subdomain + '.' + req.body.domain,
    state: 'Installing'
  };

  cli.saveNewInfo(json).then(function () {
    return cli.gitClone(json.git, json.url);
  }).then(function () {
    return cli.npmInstall(json.url);
  }).then(function () {
    return cli.createNginxEntry(json.url, json.port);
  }).then(function () {
    return cli.reloadNginx();
  }).then(function () {
    return cli.foreverStart(json.url, json.port);
  }).then(function () {
    servers.setState(json.url, 'Running');
    res.send({
      success: true,
      msg: 'Server started on port ' + json.port + ' at url ' + json.url,
      url: json.url
    });
  }).fail(function (err) {
    res.fail(err);
  });
}
