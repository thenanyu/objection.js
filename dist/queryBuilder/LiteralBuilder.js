'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _require = require('../utils/objectUtils'),
    asArray = _require.asArray,
    isObject = _require.isObject;

var _require2 = require('../utils/buildUtils'),
    buildArg = _require2.buildArg;

var LiteralBuilder =
/*#__PURE__*/
function () {
  function LiteralBuilder(value) {
    _classCallCheck(this, LiteralBuilder);

    this._value = value;
    this._cast = null; // Cast objects and arrays to json by default.

    this._toJson = isObject(value);
    this._toArray = false;
  }

  _createClass(LiteralBuilder, [{
    key: "castText",
    value: function castText() {
      return this.castTo('text');
    }
  }, {
    key: "castInt",
    value: function castInt() {
      return this.castTo('integer');
    }
  }, {
    key: "castBigInt",
    value: function castBigInt() {
      return this.castTo('bigint');
    }
  }, {
    key: "castFloat",
    value: function castFloat() {
      return this.castTo('float');
    }
  }, {
    key: "castDecimal",
    value: function castDecimal() {
      return this.castTo('decimal');
    }
  }, {
    key: "castReal",
    value: function castReal() {
      return this.castTo('real');
    }
  }, {
    key: "castBool",
    value: function castBool() {
      return this.castTo('boolean');
    }
  }, {
    key: "castJson",
    value: function castJson() {
      this._toArray = false;
      this._toJson = true;
      this._cast = 'jsonb';
      return this;
    }
  }, {
    key: "castArray",
    value: function castArray() {
      console.log('castArray() is deprecated. Use asArray() instead. castArray() will be removed in 2.0');
      return this.asArray();
    }
  }, {
    key: "castType",
    value: function castType(sqlType) {
      console.log('castType(type) is deprecated. Use castTo(type) instead. castType(type) will be removed in 2.0');
      return this.castTo(sqlType);
    }
  }, {
    key: "castTo",
    value: function castTo(sqlType) {
      this._cast = sqlType;
      return this;
    }
  }, {
    key: "asArray",
    value: function asArray() {
      this._toJson = false;
      this._toArray = true;
      return this;
    }
  }, {
    key: "toKnexRaw",
    value: function toKnexRaw(builder) {
      var sql = null;
      var bindings = null;

      if (this._toJson) {
        bindings = JSON.stringify(this._value);
        sql = '?';
      } else if (this._toArray) {
        bindings = asArray(this._value).map(function (it) {
          return buildArg(it, builder);
        });
        sql = "ARRAY[".concat(bindings.map(function () {
          return '?';
        }).join(', '), "]");
      } else {
        bindings = this._value;
        sql = '?';
      }

      if (this._cast) {
        sql = "CAST(".concat(sql, " AS ").concat(this._cast, ")");
      }

      return builder.knex().raw(sql, bindings);
    }
  }, {
    key: "cast",
    get: function get() {
      return this._cast;
    }
  }]);

  return LiteralBuilder;
}();

function lit(val) {
  return new LiteralBuilder(val);
}

module.exports = {
  LiteralBuilder: LiteralBuilder,
  lit: lit
};