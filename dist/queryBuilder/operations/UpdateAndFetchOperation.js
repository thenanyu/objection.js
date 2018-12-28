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

var DelegateOperation = require('./DelegateOperation');

var UpdateOperation = require('./UpdateOperation');

var _require = require('../../utils/promiseUtils'),
    afterReturn = _require.afterReturn;

var UpdateAndFetchOperation =
/*#__PURE__*/
function (_DelegateOperation) {
  _inherits(UpdateAndFetchOperation, _DelegateOperation);

  function UpdateAndFetchOperation(name, opt) {
    var _this;

    _classCallCheck(this, UpdateAndFetchOperation);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(UpdateAndFetchOperation).call(this, name, opt));

    if (!_this.delegate.is(UpdateOperation)) {
      throw new Error('Invalid delegate');
    }

    _this.id = null;
    _this.skipIdWhere = false;
    return _this;
  }

  _createClass(UpdateAndFetchOperation, [{
    key: "onAdd",
    value: function onAdd(builder, args) {
      this.id = args[0];
      return this.delegate.onAdd(builder, args.slice(1));
    }
  }, {
    key: "onBuild",
    value: function onBuild(builder) {
      _get(_getPrototypeOf(UpdateAndFetchOperation.prototype), "onBuild", this).call(this, builder);

      if (!this.skipIdWhere) {
        var idColumn = builder.fullIdColumnFor(builder.modelClass());
        var id = this.id;
        builder.whereComposite(idColumn, id);
      }
    }
  }, {
    key: "onAfter2",
    value: function onAfter2(builder, numUpdated) {
      var _this2 = this;

      if (numUpdated == 0) {
        // If nothing was updated, we should fetch nothing.
        return afterReturn(_get(_getPrototypeOf(UpdateAndFetchOperation.prototype), "onAfter2", this).call(this, builder, numUpdated), undefined);
      }

      return builder.modelClass().query().childQueryOf(builder).whereComposite(builder.fullIdColumnFor(builder.modelClass()), this.id).castTo(builder.resultModelClass()).first().then(function (fetched) {
        var retVal = undefined;

        if (fetched) {
          _this2.model.$set(fetched);

          retVal = _this2.model;
        }

        return afterReturn(_get(_getPrototypeOf(UpdateAndFetchOperation.prototype), "onAfter2", _this2).call(_this2, builder, numUpdated), retVal);
      });
    }
  }, {
    key: "model",
    get: function get() {
      return this.delegate.model;
    }
  }]);

  return UpdateAndFetchOperation;
}(DelegateOperation);

module.exports = UpdateAndFetchOperation;