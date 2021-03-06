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

var UpdateOperation = require('./UpdateOperation');

var _require = require('../../utils/assert'),
    assertHasId = _require.assertHasId;

var _require2 = require('../../utils/objectUtils'),
    isObject = _require2.isObject;

var _require3 = require('../../utils/promiseUtils'),
    after = _require3.after;

var InstanceUpdateOperation =
/*#__PURE__*/
function (_UpdateOperation) {
  _inherits(InstanceUpdateOperation, _UpdateOperation);

  function InstanceUpdateOperation(name, opt) {
    var _this;

    _classCallCheck(this, InstanceUpdateOperation);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(InstanceUpdateOperation).call(this, name, opt));
    _this.instance = opt.instance;
    _this.modelOptions.old = opt.instance;
    return _this;
  }

  _createClass(InstanceUpdateOperation, [{
    key: "onAdd",
    value: function onAdd(builder, args) {
      var retVal = _get(_getPrototypeOf(InstanceUpdateOperation.prototype), "onAdd", this).call(this, builder, args);

      if (!this.model) {
        this.model = this.instance;
      }

      return retVal;
    }
  }, {
    key: "onBuild",
    value: function onBuild(builder) {
      _get(_getPrototypeOf(InstanceUpdateOperation.prototype), "onBuild", this).call(this, builder);

      assertHasId(this.instance);
      var idColumn = builder.fullIdColumnFor(builder.modelClass());
      var id = this.instance.$id();
      builder.whereComposite(idColumn, id);
    }
  }, {
    key: "onAfter2",
    value: function onAfter2(builder, result) {
      var _this2 = this;

      // The result may be an object if `returning` was used.
      if (Array.isArray(result)) {
        result = result[0];
      }

      var maybePromise = _get(_getPrototypeOf(InstanceUpdateOperation.prototype), "onAfter2", this).call(this, builder, result);

      return after(maybePromise, function (result) {
        _this2.instance.$set(_this2.model);

        if (isObject(result)) {
          _this2.instance.$set(result);
        }

        return result;
      });
    }
  }]);

  return InstanceUpdateOperation;
}(UpdateOperation);

module.exports = InstanceUpdateOperation;