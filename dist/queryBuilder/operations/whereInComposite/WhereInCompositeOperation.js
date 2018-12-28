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
    isObject = _require.isObject,
    isString = _require.isString;

var _require2 = require('../../../utils/knexUtils'),
    isKnexQueryBuilder = _require2.isKnexQueryBuilder;

var WhereInCompositeOperation =
/*#__PURE__*/
function (_ObjectionToKnexConve) {
  _inherits(WhereInCompositeOperation, _ObjectionToKnexConve);

  function WhereInCompositeOperation(name, opt) {
    var _this;

    _classCallCheck(this, WhereInCompositeOperation);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(WhereInCompositeOperation).call(this, name, opt));
    _this.prefix = _this.opt.prefix || null;
    return _this;
  }

  _createClass(WhereInCompositeOperation, [{
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
      if (Array.isArray(values)) {
        this.buildCompositeValue(knexBuilder, columns, values);
      } else {
        this.buildCompositeSubquery(knex, knexBuilder, columns, values);
      }
    }
  }, {
    key: "buildCompositeValue",
    value: function buildCompositeValue(knexBuilder, columns, values) {
      this.whereIn(knexBuilder, columns, values);
    }
  }, {
    key: "buildCompositeSubquery",
    value: function buildCompositeSubquery(knex, knexBuilder, columns, subquery) {
      var sql = "(".concat(columns.map(function (col) {
        // On older versions of knex, raw doesn't work
        // with `??`. We use `?` for those.
        if (isObject(col)) {
          return '?';
        } else {
          return '??';
        }
      }).join(','), ")");
      this.whereIn(knexBuilder, knex.raw(sql, columns), subquery);
    }
  }, {
    key: "buildNonComposite",
    value: function buildNonComposite(knexBuilder, columns, values) {
      var col = isString(columns) ? columns : columns[0];

      if (Array.isArray(values)) {
        values = pickNonNull(values, []);
      } else if (!isKnexQueryBuilder(values)) {
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

  return WhereInCompositeOperation;
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

module.exports = WhereInCompositeOperation;