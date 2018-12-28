'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var jsonFieldExpressionParser = require('./parsers/jsonFieldExpressionParser');

var _require = require('../utils/objectUtils'),
    isObject = _require.isObject;

var ReferenceBuilder =
/*#__PURE__*/
function () {
  function ReferenceBuilder(expr) {
    _classCallCheck(this, ReferenceBuilder);

    this._expr = expr;
    this._reference = null;
    this._column = null;
    this._table = null;
    this._cast = null;
    this._toJson = false;
    this._table = null;
    this._as = null;
    this._modelClass = null;

    if (expr !== null) {
      var reference = jsonFieldExpressionParser.parse(expr);
      var colParts = reference.columnName.split('.');
      this._reference = reference;
      this._column = colParts[colParts.length - 1];

      if (colParts.length >= 2) {
        this._table = colParts.slice(0, colParts.length - 1).join('.');
      }
    }
  }

  _createClass(ReferenceBuilder, [{
    key: "fullColumn",
    value: function fullColumn(builder) {
      var table = this.tableName ? this.tableName : this.modelClass ? builder.tableRefFor(this.modelClass.getTableName()) : null;

      if (table) {
        return "".concat(table, ".").concat(this.column);
      } else {
        return this.column;
      }
    }
  }, {
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
      this._toJson = true;
      return this;
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
    key: "from",
    value: function from(table) {
      this._table = table;
      return this;
    }
  }, {
    key: "table",
    value: function table(_table) {
      this._table = _table;
      return this;
    }
  }, {
    key: "model",
    value: function model(modelClass) {
      this._modelClass = modelClass;
      return this;
    }
  }, {
    key: "as",
    value: function as(_as) {
      this._as = _as;
      return this;
    }
  }, {
    key: "clone",
    value: function clone() {
      var clone = new this.constructor(null);
      clone._expr = this._expr;
      clone._reference = this._reference;
      clone._column = this._column;
      clone._table = this._table;
      clone._cast = this._cast;
      clone._toJson = this._toJson;
      clone._table = this._table;
      clone._as = this._as;
      clone._modelClass = this._modelClass;
      return clone;
    }
  }, {
    key: "toRawArgs",
    value: function toRawArgs(builder) {
      var referenceSql = "??";

      if (this._reference.access.length > 0) {
        var extractor = this._cast ? '#>>' : '#>';

        var jsonFieldRef = this._reference.access.map(function (field) {
          return field.ref;
        }).join(',');

        referenceSql = "??".concat(extractor, "'{").concat(jsonFieldRef, "}'");
      }

      var castedRefQuery = this._cast ? "CAST(".concat(referenceSql, " AS ").concat(this._cast, ")") : referenceSql;
      var toJsonQuery = this._toJson ? "to_jsonb(".concat(castedRefQuery, ")") : castedRefQuery;

      if (this._as) {
        return ["".concat(toJsonQuery, " as ??"), [this.fullColumn(builder), this._as]];
      } else {
        return [toJsonQuery, [this.fullColumn(builder)]];
      }
    }
  }, {
    key: "toKnexRaw",
    value: function toKnexRaw(builder) {
      if (this.isPlainColumnRef) {
        // Fast path for the most common case.
        return builder.knex().raw('??', this.fullColumn(builder));
      } else {
        return builder.knex().raw.apply(builder.knex(), this.toRawArgs(builder));
      }
    }
  }, {
    key: "reference",
    get: function get() {
      return this._reference;
    }
  }, {
    key: "column",
    get: function get() {
      return this._column;
    }
  }, {
    key: "alias",
    get: function get() {
      return this._as;
    }
  }, {
    key: "tableName",
    get: function get() {
      return this._table;
    }
  }, {
    key: "isPlainColumnRef",
    get: function get() {
      return this._reference.access.length === 0 && !this._cast && !this._toJson && !this._as;
    }
  }, {
    key: "expression",
    get: function get() {
      return this._expr;
    }
  }, {
    key: "cast",
    get: function get() {
      return this._cast;
    }
  }, {
    key: "modelClass",
    get: function get() {
      return this._modelClass;
    }
  }]);

  return ReferenceBuilder;
}();

Object.defineProperties(ReferenceBuilder.prototype, {
  isObjectionReferenceBuilder: {
    enumerable: false,
    writable: false,
    value: true
  }
});

var ref = function ref(reference) {
  if (isObject(reference) && reference.isObjectionReferenceBuilder) {
    return reference;
  } else {
    return new ReferenceBuilder(reference);
  }
};

module.exports = {
  ReferenceBuilder: ReferenceBuilder,
  ref: ref
};