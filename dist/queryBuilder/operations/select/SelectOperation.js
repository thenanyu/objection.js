'use strict';

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var _require = require('../../../utils/objectUtils'),
    flatten = _require.flatten;

var _require2 = require('./Selection'),
    Selection = _require2.Selection;

var ObjectionToKnexConvertingOperation = require('../ObjectionToKnexConvertingOperation');

var COUNT_REGEX = /count/i;

var SelectOperation =
/*#__PURE__*/
function (_ObjectionToKnexConve) {
  _inherits(SelectOperation, _ObjectionToKnexConve);

  function SelectOperation(name, opt) {
    var _this;

    _classCallCheck(this, SelectOperation);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(SelectOperation).call(this, name, opt));
    _this.selections = [];
    return _this;
  }

  _createClass(SelectOperation, [{
    key: "onAdd",
    value: function onAdd(builder, args) {
      var selections = flatten(args); // Don't add an empty selection. Empty list is accepted for `count`, `countDistinct`
      // etc. because knex apparently supports it.

      if (selections.length === 0 && !COUNT_REGEX.test(this.name)) {
        return false;
      }

      var ret = _get(_getPrototypeOf(SelectOperation.prototype), "onAdd", this).call(this, builder, selections);

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = selections[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var selection = _step.value;
          var selectionInstance = Selection.create(selection);

          if (selectionInstance) {
            this.selections.push(selectionInstance);
          }
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

      return ret;
    }
  }, {
    key: "onBuildKnex",
    value: function onBuildKnex(knexBuilder) {
      knexBuilder[this.name].apply(knexBuilder, this.args);
    }
  }, {
    key: "findSelection",
    value: function findSelection(builder, selectionToFind) {
      var selectionInstanceToFind = Selection.create(selectionToFind);

      if (!selectionInstanceToFind) {
        return null;
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.selections[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var selection = _step2.value;

          if (Selection.doesSelect(builder, selection, selectionInstanceToFind)) {
            return selection;
          }
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

      return null;
    }
  }]);

  return SelectOperation;
}(ObjectionToKnexConvertingOperation);

module.exports = SelectOperation;