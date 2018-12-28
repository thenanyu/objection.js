'use strict';

var _require = require('../utils/objectUtils'),
    isObject = _require.isObject,
    cloneDeep = _require.cloneDeep;

var _require2 = require('./modelUtils'),
    hiddenProps = _require2.hiddenProps;

var _require3 = require('./modelUtils'),
    defineNonEnumerableProperty = _require3.defineNonEnumerableProperty;

function clone(model, shallow, stripInternal) {
  var clone = null;
  var omitFromJson = model.$omitFromJson();
  var omitFromDatabaseJson = model.$omitFromDatabaseJson();

  if (!shallow && !stripInternal) {
    clone = cloneSimple(model);
  } else {
    clone = cloneWithOpt(model, shallow, stripInternal);
  }

  if (omitFromJson) {
    clone.$omitFromJson(omitFromJson);
  }

  if (omitFromDatabaseJson) {
    clone.$omitFromDatabaseJson(omitFromDatabaseJson);
  }

  clone = copyHiddenProps(model, clone);
  return clone;
}

function cloneSimple(model) {
  var clone = new model.constructor();
  var keys = Object.keys(model);

  for (var i = 0, l = keys.length; i < l; ++i) {
    var key = keys[i];
    var value = model[key];

    if (isObject(value)) {
      clone[key] = cloneObject(value);
    } else {
      clone[key] = value;
    }
  }

  return clone;
}

function cloneWithOpt(model, shallow, stripInternal) {
  var clone = new model.constructor();
  var keys = Object.keys(model);
  var relations = model.constructor.getRelations();

  for (var i = 0, l = keys.length; i < l; ++i) {
    var key = keys[i];
    var value = model[key];

    if (shallow && key in relations || stripInternal && key[0] === '$') {
      continue;
    }

    if (isObject(value)) {
      clone[key] = cloneObject(value);
    } else {
      clone[key] = value;
    }
  }

  return clone;
}

function cloneObject(value) {
  if (Array.isArray(value)) {
    return cloneArray(value);
  } else if (value.$isObjectionModel) {
    return clone(value, false, false);
  } else if (Buffer.isBuffer(value)) {
    return new Buffer(value);
  } else {
    return cloneDeep(value);
  }
}

function cloneArray(value) {
  var ret = new Array(value.length);

  for (var i = 0, l = ret.length; i < l; ++i) {
    var item = value[i];

    if (isObject(item)) {
      ret[i] = cloneObject(item);
    } else {
      ret[i] = item;
    }
  }

  return ret;
}

function copyHiddenProps(model, clone) {
  for (var i = 0, l = hiddenProps.length; i < l; ++i) {
    var prop = hiddenProps[i];

    if (model.hasOwnProperty(prop)) {
      defineNonEnumerableProperty(clone, prop, model[prop]);
    }
  }

  return clone;
}

module.exports = {
  clone: clone
};