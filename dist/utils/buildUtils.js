'use strict';

var _require = require('./objectUtils'),
    isObject = _require.isObject,
    isFunction = _require.isFunction;

function buildArg(arg, builder) {
  if (!isObject(arg)) {
    return arg;
  }

  if (isFunction(arg.toKnexRaw)) {
    return arg.toKnexRaw(builder);
  } else if (arg.isObjectionQueryBuilderBase === true) {
    return arg.subqueryOf(builder).build();
  } else {
    return arg;
  }
}

module.exports = {
  buildArg: buildArg
};