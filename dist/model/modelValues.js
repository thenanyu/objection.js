'use strict';

var _require = require('../utils/objectUtils'),
    isObject = _require.isObject; // Property keys needs to be prefixed with a non-numeric character so that
// they are not considered indexes when used as object keys.


var PROP_KEY_PREFIX = 'k_';

function values(model, args) {
  switch (args.length) {
    case 1:
      return values1(model, args);

    case 2:
      return values2(model, args);

    case 3:
      return values3(model, args);

    default:
      return valuesN(model, args);
  }
}

function propKey(model, props) {
  switch (props.length) {
    case 1:
      return propKey1(model, props);

    case 2:
      return propKey2(model, props);

    case 3:
      return propKey3(model, props);

    default:
      return propKeyN(model, props);
  }
}

function hasProps(model, props) {
  for (var i = 0; i < props.length; ++i) {
    var value = model[props[i]];

    if (isNullOrUndefined(value)) {
      return false;
    }
  }

  return true;
}

function values1(model, args) {
  return [model[args[0]]];
}

function values2(model, args) {
  return [model[args[0]], model[args[1]]];
}

function values3(model, args) {
  return [model[args[0]], model[args[1]], model[args[2]]];
}

function valuesN(model, args) {
  var ret = new Array(args.length);

  for (var i = 0, l = args.length; i < l; ++i) {
    ret[i] = model[args[i]];
  }

  return ret;
}

function propKey1(model, props) {
  return PROP_KEY_PREFIX + propToStr(model[props[0]]);
}

function propKey2(model, props) {
  return PROP_KEY_PREFIX + propToStr(model[props[0]]) + ',' + propToStr(model[props[1]]);
}

function propKey3(model, props) {
  return PROP_KEY_PREFIX + propToStr(model[props[0]]) + ',' + propToStr(model[props[1]]) + ',' + propToStr(model[props[2]]);
}

function propKeyN(model, props) {
  // Needs to be `var` instead of `let` to prevent a weird optimization bailout.
  var key = PROP_KEY_PREFIX;

  for (var i = 0, l = props.length; i < l; ++i) {
    key += propToStr(model[props[i]]);

    if (i < l - 1) {
      key += ',';
    }
  }

  return key;
}

function propToStr(value) {
  if (value === null) {
    return 'null';
  } else if (value === undefined) {
    return 'undefined';
  } else if (isObject(value)) {
    return JSON.stringify(value);
  } else {
    return "".concat(value);
  }
}

function isNullOrUndefined(val) {
  return val === null || val === undefined;
}

module.exports = {
  PROP_KEY_PREFIX: PROP_KEY_PREFIX,
  propToStr: propToStr,
  values: values,
  hasProps: hasProps,
  propKey: propKey
};