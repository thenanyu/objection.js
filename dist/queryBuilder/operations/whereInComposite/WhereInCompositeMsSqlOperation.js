'use strict';

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var ObjectionToKnexConvertingOperation = require('../ObjectionToKnexConvertingOperation');

var _require = require('../../../utils/objectUtils'),
    flatten = _require.flatten,
    zipObject = _require.zipObject,
    isString = _require.isString;

var _require2 = require('../../../utils/tmpColumnUtils'),
    getTempColumn = _require2.getTempColumn;

var WhereInCompositeMsSqlOperation =
/*#__PURE__*/
function (_ObjectionToKnexConve) {
  _inherits(WhereInCompositeMsSqlOperation, _ObjectionToKnexConve);

  function WhereInCompositeMsSqlOperation(name, opt) {
    var _this;

    _classCallCheck(this, WhereInCompositeMsSqlOperation);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(WhereInCompositeMsSqlOperation).call(this, name, opt));
    _this.prefix = _this.opt.prefix || null;
    return _this;
  }

  _createClass(WhereInCompositeMsSqlOperation, [{
    key: "onBuildKnex",
    value: function onBuildKnex(knexBuilder, builder) {
      this.build(builder.knex(), knexBuilder, this.args[0], this.args[1]);
    }
  }, {
    key: "build",
    value: function build(knex, knexBuilder, columns, values) {
      var isCompositeKey = Array.isArray(columns) && columns.length > 1;

      if (isCompositeKey) {
        this.buildComposite(knex, knexBuilder, columns, values);
      } else {
        this.buildNonComposite(knexBuilder, columns, values);
      }
    }
  }, {
    key: "buildComposite",
    value: function buildComposite(knex, knexBuilder, columns, values) {
      var helperColumns = columns.map(function (_, index) {
        return getTempColumn(index);
      });

      if (Array.isArray(values)) {
        this.buildCompositeValue(knex, knexBuilder, columns, helperColumns, values);
      } else {
        this.buildCompositeSubquery(knex, knexBuilder, columns, helperColumns, values.as(knex.raw("V(".concat(helperColumns.map(function (_) {
          return '??';
        }), ")"), helperColumns)));
      }
    }
  }, {
    key: "buildCompositeValue",
    value: function buildCompositeValue(knex, knexBuilder, columns, helperColumns, values) {
      return this.buildCompositeSubquery(knex, knexBuilder, columns, helperColumns, knex.raw("(VALUES ".concat(values.map(function (value) {
        return "(".concat(value.map(function (_) {
          return '?';
        }).join(','), ")");
      }).join(','), ") AS V(").concat(helperColumns.map(function (_) {
        return '??';
      }).join(','), ")"), flatten(values).concat(helperColumns)));
    }
  }, {
    key: "buildCompositeSubquery",
    value: function buildCompositeSubquery(knex, knexBuilder, columns, helperColumns, subQuery) {
      var wrapperQuery = knex.from(subQuery).where(zipObject(helperColumns, columns.map(function (column) {
        return knex.raw('??', column);
      })));

      if (this.prefix === 'not') {
        return knexBuilder.whereNotExists(wrapperQuery);
      } else {
        return knexBuilder.whereExists(wrapperQuery);
      }
    }
  }, {
    key: "buildNonComposite",
    value: function buildNonComposite(knexBuilder, columns, values) {
      var col = isString(columns) ? columns : columns[0];

      if (Array.isArray(values)) {
        values = pickNonNull(values, []);
      } else {
        values = [values];
      }

      this.whereIn(knexBuilder, col, values);
    }
  }, {
    key: "whereIn",
    value: function whereIn(knexBuilder, col, val) {
      if (this.prefix === 'not') {
        knexBuilder.whereNotIn(col, val);
      } else {
        knexBuilder.whereIn(col, val);
      }
    }
  }]);

  return WhereInCompositeMsSqlOperation;
}(ObjectionToKnexConvertingOperation);

function pickNonNull(values, output) {
  for (var i = 0, l = values.length; i < l; ++i) {
    var val = values[i];

    if (Array.isArray(val)) {
      pickNonNull(val, output);
    } else if (val !== null && val !== undefined) {
      output.push(val);
    }
  }

  return output;
}

module.exports = WhereInCompositeMsSqlOperation;