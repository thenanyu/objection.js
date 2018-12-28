'use strict';

var _require = require('../utils/objectUtils'),
    isObject = _require.isObject; // ids is of type RelationProperty.


module.exports = function (ids, prop, opt) {
  opt = opt || {};
  var isComposite = prop.size > 1;
  var ret;

  if (isComposite) {
    // For composite ids these are okay:
    //
    // 1. [1, 'foo', 4]
    // 2. {a: 1, b: 'foo', c: 4}
    // 3. [[1, 'foo', 4], [4, 'bar', 1]]
    // 4. [{a: 1, b: 'foo', c: 4}, {a: 4, b: 'bar', c: 1}]
    //
    if (Array.isArray(ids)) {
      if (Array.isArray(ids[0])) {
        ret = new Array(ids.length); // 3.

        for (var i = 0, l = ids.length; i < l; ++i) {
          ret[i] = convertIdArrayToObject(ids[i], prop);
        }
      } else if (isObject(ids[0])) {
        ret = new Array(ids.length); // 4.

        for (var _i = 0, _l = ids.length; _i < _l; ++_i) {
          ret[_i] = ensureObject(ids[_i], prop);
        }
      } else {
        // 1.
        ret = [convertIdArrayToObject(ids, prop)];
      }
    } else if (isObject(ids)) {
      // 2.
      ret = [ids];
    } else {
      throw new Error("invalid composite key ".concat(JSON.stringify(ids)));
    }
  } else {
    // For non-composite ids, these are okay:
    //
    // 1. 1
    // 2. {id: 1}
    // 3. [1, 'foo', 4]
    // 4. [{id: 1}, {id: 'foo'}, {id: 4}]
    //
    if (Array.isArray(ids)) {
      if (isObject(ids[0])) {
        ret = new Array(ids.length); // 4.

        for (var _i2 = 0, _l2 = ids.length; _i2 < _l2; ++_i2) {
          ret[_i2] = ensureObject(ids[_i2]);
        }
      } else {
        ret = new Array(ids.length); // 3.

        for (var _i3 = 0, _l3 = ids.length; _i3 < _l3; ++_i3) {
          ret[_i3] = {};
          prop.setProp(ret[_i3], 0, ids[_i3]);
        }
      }
    } else if (isObject(ids)) {
      // 2.
      ret = [ids];
    } else {
      // 1.
      var obj = {};
      prop.setProp(obj, 0, ids);
      ret = [obj];
    }
  }

  checkProperties(ret, prop);

  if (opt.arrayOutput) {
    return normalizedToArray(ret, prop);
  } else {
    return ret;
  }
};

function convertIdArrayToObject(ids, prop) {
  if (!Array.isArray(ids)) {
    throw new Error("invalid composite key ".concat(JSON.stringify(ids)));
  }

  if (ids.length != prop.size) {
    throw new Error("composite identifier ".concat(JSON.stringify(ids), " should have ").concat(prop.size, " values"));
  }

  var obj = {};

  for (var i = 0; i < ids.length; ++i) {
    prop.setProp(obj, i, ids[i]);
  }

  return obj;
}

function ensureObject(ids) {
  if (isObject(ids)) {
    return ids;
  } else {
    throw new Error("invalid composite key ".concat(JSON.stringify(ids)));
  }
}

function checkProperties(ret, prop) {
  for (var i = 0, l = ret.length; i < l; ++i) {
    var obj = ret[i];

    for (var j = 0, lp = prop.size; j < lp; ++j) {
      var val = prop.getProp(obj, j);

      if (typeof val === 'undefined') {
        throw new Error("expected id ".concat(JSON.stringify(obj), " to have property ").concat(prop.propDescription(j)));
      }
    }
  }
}

function normalizedToArray(ret, prop) {
  var arr = new Array(ret.length);

  for (var i = 0, l = ret.length; i < l; ++i) {
    arr[i] = prop.getProps(ret[i]);
  }

  return arr;
}