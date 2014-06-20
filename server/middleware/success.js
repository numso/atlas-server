/* jshint node:true */
'use strict';

module.exports = function (req, res, next) {
  res.success = function () {
    res.send({ success: true });
  };
  next();
};
