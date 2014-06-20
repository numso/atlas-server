/* jshint node:true */
'use strict';

var fs = require('fs');
var  Q = require('q');
var  _ = require('underscore');

var SERVER_PATH = __dirname + '/../../data/servers.json';

module.exports = {
  list: list,
  save: save,
  get: get,
  setState: setState
};

function list() {
  var deferred = Q.defer();
  fs.readFile(SERVER_PATH, 'utf8', function (err, servers) {
    if (err) return deferred.reject(err);
    deferred.resolve(JSON.parse(servers));
  });
  return deferred.promise;
}

function save(servers) {
  var deferred = Q.defer();
  fs.writeFile(SERVER_PATH, JSON.stringify(servers), function (err) {
    if (err) return deferred.reject(err);
    deferred.resolve();
  });
  return deferred.promise;
}

function get(url) {
  var deferred = Q.defer();
  list().then(function (servers) {
    var server = _.findWhere(servers, { url: url });
    deferred.resolve(server);
  });
  return deferred.promise;
}

function setState(url, state) {
  var deferred = Q.defer();
  list().then(function (servers) {
    var server = _.findWhere(servers, { url: url });
    server.state = state;
    return save(servers);
  }).then(function () {
    deferred.resolve();
  });
  return deferred.promise;
}
