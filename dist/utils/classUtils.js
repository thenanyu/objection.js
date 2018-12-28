'use strict';

var _require = require('./objectUtils'),
    isFunction = _require.isFunction;

function isSubclassOf(Constructor, SuperConstructor) {
  if (!isFunction(SuperConstructor)) {
    return false;
  }

  while (isFunction(Constructor)) {
    if (Constructor === SuperConstructor) {
      return true;
    }

    var proto = Constructor.prototype && Object.getPrototypeOf(Constructor.prototype);
    Constructor = proto && proto.constructor;
  }

  return false;
}

module.exports = {
  isSubclassOf: isSubclassOf
};