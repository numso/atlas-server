/* jshint node:true */
'use strict';

var  spawn = require('child_process').spawn;
var     fs = require('fs');
var      Q = require('q');
var      _ = require('underscore');
var config = require('config');
var  rmdir = require('rimraf');

var servers = require('./servers.js');

var NGINX_TEMPLATE = fs.readFileSync(__dirname + '/nginx-template', 'utf8');

module.exports = {
  saveNewInfo: saveNewInfo,
  removeInfo: removeInfo,

  gitClone: gitClone,
  npmInstall: npmInstall,
  removeProject: removeProject,

  foreverStart: foreverStart,
  foreverStop: foreverStop,

  createNginxEntry: createNginxEntry,
  removeNginxEntry: removeNginxEntry,
  reloadNginx: reloadNginx

  // setup git hooks
};

function saveNewInfo(json) {
  var deferred = Q.defer();

  servers.list().then(function (data) {
    if (_.findWhere(data, { url: json.url })) {
      return deferred.reject('That subdomain is already in use!');
    }
    if (data.length === 0) {
      json.port = config.startingPort;
    } else {
      json.port = _.reduce(data, function (memo, obj) {
        return Math.max(memo, obj.port);
      }, config.startingPort) + 1;
    }
    while (_.contains(config.excludedPorts, json.port)) {
      json.port++;
    }
    data.push(json);
    return servers.save(data);
  }).then(function () {
    deferred.resolve();
  }).fail(function (err) {
    deferred.reject(err);
  });

  return deferred.promise;
}

function removeInfo(url) {
  var deferred = Q.defer();
  servers.list().then(function (_servers) {
    var server = _.findWhere(_servers, { url: url });
    _servers = _.without(_servers, server);
    return servers.save(_servers);
  }).then(function () {
    deferred.resolve();
  });
  return deferred.promise;
}

function gitClone(gitUrl, url) {
  var path = config.project_dir;
  return _runCmd('git', ['clone', gitUrl, url, '--progress'], { cwd: path }, 'git clone');
}

function npmInstall(url) {
  var path = config.project_dir + url;
  return _runCmd('npm', ['install'], { cwd: path }, 'npm install');
}

function removeProject(url) {
  var deferred = Q.defer();
  var path = config.project_dir + url;
  rmdir(path, function (err) {
    if (err) return deferred.reject(err);
    deferred.resolve();
  });
  return deferred.promise;
}

function createNginxEntry(url, port) {
  var deferred = Q.defer();
  var _path = config.nginx_dir + url + '.conf';
  var data = _.template(NGINX_TEMPLATE, { PORT: port, SERVER: url });
  fs.writeFile(_path, data, function (err) {
    if (err) return deferred.reject(err);
    deferred.resolve();
  });
  return deferred.promise;
}

function removeNginxEntry(url) {
  var deferred = Q.defer();
  var _path = config.nginx_dir + url + '.conf';
  fs.unlink(_path, function (err) {
    if (err) return deferred.reject(err);
    deferred.resolve();
  });
  return deferred.promise;
}

function foreverStart(url, port) {
  var path = config.project_dir + url;
  process.env.PORT = port;
  return _runCmd(config.forever_bin, ['start', '-a', '--uid', url, '-c', 'npm start', './'], { cwd: path, env: process.env }, 'forever start');
}

function foreverStop(url) {
  var path = config.project_dir + url;
  return _runCmd(config.forever_bin, ['stop', url], { cwd: path }, 'forever stop');
}

function reloadNginx() {
  return _runCmd(config.nginx_bin, ['-s', 'reload'], {}, 'nginx reload');
}

// --- Private Functions -------------------------------------------------------

function _runCmd(cmd, args, opts, id) {
  var deferred = Q.defer();
  var proc = spawn(cmd, args, opts);

  proc.stdout.on('data', output);
  proc.stderr.on('data', output);
  proc.on('error', output);

  proc.on('close', function (code) {
    console.log(id + ' closing');
    console.log(arguments);
    if (code === 0 || code === null) deferred.resolve();
    else deferred.reject(id + ' exited with code ' + code);
  });

  return deferred.promise;
}

function output(text) {
  console.log('' + text);
}
