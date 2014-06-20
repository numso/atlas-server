/* jshint node:true */
'use strict';

module.exports = function (req, res, next) {
  res.fail = function (err) {
    res.send({ success: false, err: err });
  };
  next();
};
