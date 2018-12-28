'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _require = require('../utils/objectUtils'),
    isPlainObject = _require.isPlainObject;

var _require2 = require('../utils/buildUtils'),
    buildArg = _require2.buildArg;

var RawBuilder =
/*#__PURE__*/
function () {
  function RawBuilder(sql, args) {
    _classCallCheck(this, RawBuilder);

    this._sql = "".concat(sql);
    this._args = args;
  }

  _createClass(RawBuilder, [{
    key: "toKnexRaw",
    value: function toKnexRaw(builder) {
      var args = null;

      if (this._args.length === 1 && isPlainObject(this._args[0])) {
        args = buildObject(this._args[0], builder);
      } else {
        args = buildArray(this._args, builder);
      }

      if (args) {
        return builder.knex().raw(this._sql, args);
      } else {
        return builder.knex().raw(this._sql);
      }
    }
  }]);

  return RawBuilder;
}();

function buildArray(arr, builder) {
  var args = new Array(arr.length);

  for (var i = 0, l = args.length; i < l; ++i) {
    args[i] = buildArg(arr[i], builder);
  }

  return args;
}

function buildObject(obj, builder) {
  var keys = Object.keys(obj);
  var args = {};

  for (var i = 0, l = keys.length; i < l; ++i) {
    var key = keys[i];
    args[key] = buildArg(obj[key], builder);
  }

  return args;
}

function raw() {
  var sql = arguments[0];
  var args = null;

  if (arguments.length === 2 && Array.isArray(arguments[1])) {
    args = new Array(arguments[1].length);

    for (var i = 0, l = args.length; i < l; ++i) {
      args[i] = arguments[1][i];
    }
  } else {
    args = new Array(arguments.length - 1);

    for (var _i = 1, _l = arguments.length; _i < _l; ++_i) {
      args[_i - 1] = arguments[_i];
    }
  }

  return new RawBuilder(sql, args);
}

module.exports = {
  RawBuilder: RawBuilder,
  raw: raw
};