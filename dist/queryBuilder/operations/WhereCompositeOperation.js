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

var ObjectionToKnexConvertingOperation = require('./ObjectionToKnexConvertingOperation');

var WhereCompositeOperation =
/*#__PURE__*/
function (_ObjectionToKnexConve) {
  _inherits(WhereCompositeOperation, _ObjectionToKnexConve);

  function WhereCompositeOperation() {
    _classCallCheck(this, WhereCompositeOperation);

    return _possibleConstructorReturn(this, _getPrototypeOf(WhereCompositeOperation).apply(this, arguments));
  }

  _createClass(WhereCompositeOperation, [{
    key: "onBuildKnex",
    value: function onBuildKnex(knexBuilder) {
      if (this.args.length === 2) {
        this.build(knexBuilder, this.args[0], '=', this.args[1]);
      } else if (this.args.length === 3) {
        this.build(knexBuilder, this.args[0], this.args[1], this.args[2]);
      } else {
        throw new Error("invalid number of arguments ".concat(this.args.length));
      }
    }
  }, {
    key: "build",
    value: function build(knexBuilder, cols, op, values) {
      var colsIsArray = Array.isArray(cols);
      var valuesIsArray = Array.isArray(values);

      if (!colsIsArray && !valuesIsArray) {
        knexBuilder.where(cols, op, values);
      } else if (colsIsArray && cols.length === 1 && !valuesIsArray) {
        knexBuilder.where(cols[0], op, values);
      } else if (colsIsArray && valuesIsArray && cols.length === values.length) {
        for (var i = 0, l = cols.length; i < l; ++i) {
          knexBuilder.where(cols[i], op, values[i]);
        }
      } else {
        throw new Error("both cols and values must have same dimensions");
      }
    }
  }]);

  return WhereCompositeOperation;
}(ObjectionToKnexConvertingOperation);

module.exports = WhereCompositeOperation;