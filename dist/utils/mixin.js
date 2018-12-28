'use strict';

var _require = require('./objectUtils'),
    flatten = _require.flatten;

function mixin() {
  var args = flatten(arguments);
  var mixins = args.slice(1);
  return mixins.reduce(function (Class, mixinFunc) {
    return mixinFunc(Class);
  }, args[0]);
}

function compose() {
  var mixins = flatten(arguments);
  return function (Class) {
    return mixin(Class, mixins);
  };
}

module.exports = {
  compose: compose,
  mixin: mixin
};