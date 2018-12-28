'use strict';

var _require = require('../utils/objectUtils'),
    isObject = _require.isObject;

function omit(model, args) {
  if (args.length === 1 && isObject(args[0])) {
    var keys = args[0];

    if (Array.isArray(keys)) {
      omitArray(model, keys);
    } else {
      omitObject(model, keys);
    }
  } else {
    var _keys = new Array(args.length);

    for (var i = 0, l = _keys.length; i < l; ++i) {
      _keys[i] = args[i];
    }

    omitArray(model, _keys);
  }

  return model;
}

function pick(model, args) {
  if (args.length === 1 && isObject(args[0])) {
    var keys = args[0];

    if (Array.isArray(keys)) {
      pickArray(model, keys);
    } else {
      pickObject(model, keys);
    }
  } else {
    var _keys2 = new Array(args.length);

    for (var i = 0, l = _keys2.length; i < l; ++i) {
      _keys2[i] = args[i];
    }

    pickArray(model, _keys2);
  }

  return model;
}

function omitObject(model, keyObj) {
  var modelClass = model.constructor;
  var keys = Object.keys(keyObj);

  for (var i = 0, l = keys.length; i < l; ++i) {
    var key = keys[i];
    var value = keyObj[key];

    if (value && key.charAt(0) !== '$' && model.hasOwnProperty(key)) {
      modelClass.omitImpl(model, key);
    }
  }
}

function omitArray(model, keys) {
  var modelClass = model.constructor;

  for (var i = 0, l = keys.length; i < l; ++i) {
    var key = keys[i];

    if (key.charAt(0) !== '$' && model.hasOwnProperty(key)) {
      modelClass.omitImpl(model, key);
    }
  }
}

function pickObject(model, keyObj) {
  var modelClass = model.constructor;
  var keys = Object.keys(model);

  for (var i = 0, l = keys.length; i < l; ++i) {
    var key = keys[i];

    if (key.charAt(0) !== '$' && !keyObj[key]) {
      modelClass.omitImpl(model, key);
    }
  }
}

function pickArray(model, pick) {
  var modelClass = model.constructor;
  var keys = Object.keys(model);

  for (var i = 0, l = keys.length; i < l; ++i) {
    var key = keys[i];

    if (key.charAt(0) !== '$' && !contains(pick, key)) {
      modelClass.omitImpl(model, key);
    }
  }
}

function contains(arr, value) {
  for (var i = 0, l = arr.length; i < l; ++i) {
    if (arr[i] === value) {
      return true;
    }
  }

  return false;
}

module.exports = {
  omit: omit,
  pick: pick
};