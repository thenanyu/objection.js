'use strict';

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _require = require('./clone'),
    clone = _require.clone,
    cloneDeep = _require.cloneDeep;

function isEmpty(item) {
  if (Array.isArray(item)) {
    return item.length === 0;
  } else if (isObject(item)) {
    return Object.keys(item).length === 0;
  } else {
    return true;
  }
}

function isObject(value) {
  return value !== null && _typeof(value) === 'object';
} // Quick and dirty check if an object is a plain object and not
// for example an instance of some class.


function isPlainObject(value) {
  return isObject(value) && (!value.constructor || value.constructor === Object) && (!value.toString || value.toString === Object.prototype.toString);
}

function isFunction(value) {
  return typeof value === 'function';
}

function isRegExp(value) {
  return value instanceof RegExp;
}

function isString(value) {
  return typeof value === 'string';
}

function isNumber(value) {
  return typeof value === 'number';
}

function asArray(value) {
  return Array.isArray(value) ? value : [value];
}

function uniqBy(items) {
  var keyGetter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var map = new Map();

  for (var i = 0, l = items.length; i < l; ++i) {
    var item = items[i];
    var key = keyGetter !== null ? keyGetter(item) : item;
    map.set(key, item);
  }

  return Array.from(map.values());
}

function groupBy(items) {
  var keyGetter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var groups = new Map();
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var item = _step.value;
      var key = keyGetter !== null ? keyGetter(item) : item;
      var group = groups.get(key);

      if (!group) {
        group = [];
        groups.set(key, group);
      }

      group.push(item);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return groups;
}

function omit(obj, keysToOmit) {
  keysToOmit = asArray(keysToOmit);
  var keys = Object.keys(obj);
  var out = {};

  for (var i = 0, l = keys.length; i < l; ++i) {
    var key = keys[i];

    if (!keysToOmit.includes(key)) {
      out[key] = obj[key];
    }
  }

  return out;
}

function difference(arr1, arr2) {
  var arr2Set = new Set(arr2);
  var diff = [];

  for (var i = 0; i < arr1.length; ++i) {
    var value = arr1[i];

    if (!arr2Set.has(value)) {
      diff.push(value);
    }
  }

  return diff;
}

function union(arr1, arr2) {
  var all = new Set();

  for (var i = 0; i < arr1.length; ++i) {
    all.add(arr1[i]);
  }

  for (var _i = 0; _i < arr2.length; ++_i) {
    all.add(arr2[_i]);
  }

  return Array.from(all);
}

function last(arr) {
  return arr[arr.length - 1];
}

function upperFirst(str) {
  return str[0].toUpperCase() + str.substring(1);
}

function values(obj) {
  if (isObject(obj)) {
    var keys = Object.keys(obj);

    var _values = new Array(keys.length);

    for (var i = 0, l = keys.length; i < l; ++i) {
      _values[i] = obj[keys[i]];
    }

    return _values;
  } else {
    return [];
  }
}

function once(func) {
  var called = false;
  var value = undefined;
  return function () {
    if (called === false) {
      called = true;
      value = func.apply(this, arguments);
    }

    return value;
  };
}

function flatten(arrays) {
  var out = [];
  var outIdx = 0;

  for (var i = 0, l = arrays.length; i < l; ++i) {
    var value = arrays[i];

    if (Array.isArray(value)) {
      for (var j = 0; j < value.length; ++j) {
        out.push(value[j]);
      }
    } else {
      out.push(value);
    }
  }

  return out;
}

function get(obj, path) {
  for (var i = 0, l = path.length; i < l; ++i) {
    var key = path[i];

    if (!isObject(obj)) {
      return undefined;
    }

    obj = obj[key];
  }

  return obj;
}

function set(obj, path, value) {
  var inputObj = obj;

  for (var i = 0, l = path.length - 1; i < l; ++i) {
    var key = path[i];
    var child = obj[key];

    if (!isObject(child)) {
      var nextKey = path[i + 1];

      if (isNaN(nextKey)) {
        child = {};
      } else {
        child = [];
      }

      obj[key] = child;
    }

    obj = child;
  }

  if (path.length > 0 && isObject(obj)) {
    obj[path[path.length - 1]] = value;
  }

  return inputObj;
}

function zipObject(keys, values) {
  var out = {};

  for (var i = 0, l = keys.length; i < l; ++i) {
    out[keys[i]] = values[i];
  }

  return out;
}

function chunk(arr, chunkSize) {
  var out = [];

  for (var i = 0, l = arr.length; i < l; ++i) {
    var item = arr[i];

    if (out.length === 0 || out[out.length - 1].length === chunkSize) {
      out.push([]);
    }

    out[out.length - 1].push(item);
  }

  return out;
}

function mergeMaps(map1, map2) {
  var map = new Map();

  if (map1) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = map1.keys()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var key = _step2.value;
        map.set(key, map1.get(key));
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  }

  if (map2) {
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = map2.keys()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var _key = _step3.value;
        map.set(_key, map2.get(_key));
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }
  }

  return map;
}

module.exports = {
  isEmpty: isEmpty,
  isString: isString,
  isRegExp: isRegExp,
  isObject: isObject,
  isNumber: isNumber,
  isFunction: isFunction,
  isPlainObject: isPlainObject,
  difference: difference,
  upperFirst: upperFirst,
  zipObject: zipObject,
  mergeMaps: mergeMaps,
  cloneDeep: cloneDeep,
  asArray: asArray,
  flatten: flatten,
  groupBy: groupBy,
  uniqBy: uniqBy,
  values: values,
  union: union,
  chunk: chunk,
  clone: clone,
  omit: omit,
  once: once,
  last: last,
  get: get,
  set: set
};