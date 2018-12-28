'use strict';

var _require = require('../objectUtils'),
    isObject = _require.isObject,
    isFunction = _require.isFunction;

function isPromise(obj) {
  return isObject(obj) && isFunction(obj.then);
}

module.exports = isPromise;