/* jshint node:true */
'use strict';

var _ = require('underscore');

var cli = require('../utils/command-line.js');
var servers = require('../utils/servers.js');

module.exports = function () {
  startServers();
};

function startServers() {
  servers.list().then(function (_servers) {
    _.each(_servers, function (server) {
      start(server.url);
    });
  });
}

function start(url) {
  servers.get(url).then(function (server) {
    if (!server) return console.error('no server with domain ' + server.url);
    cli.foreverStart(url, server.port).then(function () {
      console.log('successfully started ' + server.url);
    }, function (err) {
      console.error('did not start ' + server.url);
      console.error(err);
    });
  });
}
