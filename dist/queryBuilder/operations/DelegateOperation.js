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

var QueryBuilderOperation = require('./QueryBuilderOperation'); // Operation that simply delegates all calls to the operation passed
// to to the constructor in `opt.delegate`.


var DelegateOperation =
/*#__PURE__*/
function (_QueryBuilderOperatio) {
  _inherits(DelegateOperation, _QueryBuilderOperatio);

  function DelegateOperation(name, opt) {
    var _this;

    _classCallCheck(this, DelegateOperation);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(DelegateOperation).call(this, name, opt));
    _this.delegate = opt.delegate;
    return _this;
  }

  _createClass(DelegateOperation, [{
    key: "is",
    value: function is(OperationClass) {
      return _get(_getPrototypeOf(DelegateOperation.prototype), "is", this).call(this, OperationClass) || this.delegate.is(OperationClass);
    }
  }, {
    key: "onAdd",
    value: function onAdd(builder, args) {
      return this.delegate.onAdd(builder, args);
    }
  }, {
    key: "onBefore1",
    value: function onBefore1(builder, result) {
      return this.delegate.onBefore1(builder, result);
    }
  }, {
    key: "hasOnBefore1",
    value: function hasOnBefore1() {
      return this.onBefore1 !== DelegateOperation.prototype.onBefore1 || this.delegate.hasOnBefore1();
    }
  }, {
    key: "onBefore2",
    value: function onBefore2(builder, result) {
      return this.delegate.onBefore2(builder, result);
    }
  }, {
    key: "hasOnBefore2",
    value: function hasOnBefore2() {
      return this.onBefore2 !== DelegateOperation.prototype.onBefore2 || this.delegate.hasOnBefore2();
    }
  }, {
    key: "onBefore3",
    value: function onBefore3(builder, result) {
      return this.delegate.onBefore3(builder, result);
    }
  }, {
    key: "hasOnBefore3",
    value: function hasOnBefore3() {
      return this.onBefore3 !== DelegateOperation.prototype.onBefore3 || this.delegate.hasOnBefore3();
    }
  }, {
    key: "onBuild",
    value: function onBuild(builder) {
      return this.delegate.onBuild(builder);
    }
  }, {
    key: "hasOnBuild",
    value: function hasOnBuild() {
      return this.onBuild !== DelegateOperation.prototype.onBuild || this.delegate.hasOnBuild();
    }
  }, {
    key: "onBuildKnex",
    value: function onBuildKnex(knexBuilder, builder) {
      return this.delegate.onBuildKnex(knexBuilder, builder);
    }
  }, {
    key: "hasOnBuildKnex",
    value: function hasOnBuildKnex() {
      return this.onBuildKnex !== DelegateOperation.prototype.onBuildKnex || this.delegate.hasOnBuildKnex();
    }
  }, {
    key: "onRawResult",
    value: function onRawResult(builder, result) {
      return this.delegate.onRawResult(builder, result);
    }
  }, {
    key: "hasOnRawResult",
    value: function hasOnRawResult() {
      return this.onRawResult !== DelegateOperation.prototype.onRawResult || this.delegate.hasOnRawResult();
    }
  }, {
    key: "onAfter1",
    value: function onAfter1(builder, result) {
      return this.delegate.onAfter1(builder, result);
    }
  }, {
    key: "hasOnAfter1",
    value: function hasOnAfter1() {
      return this.onAfter1 !== DelegateOperation.prototype.onAfter1 || this.delegate.hasOnAfter1();
    }
  }, {
    key: "onAfter2",
    value: function onAfter2(builder, result) {
      return this.delegate.onAfter2(builder, result);
    }
  }, {
    key: "hasOnAfter2",
    value: function hasOnAfter2() {
      return this.onAfter2 !== DelegateOperation.prototype.onAfter2 || this.delegate.hasOnAfter2();
    }
  }, {
    key: "onAfter3",
    value: function onAfter3(builder, result) {
      return this.delegate.onAfter3(builder, result);
    }
  }, {
    key: "hasOnAfter3",
    value: function hasOnAfter3() {
      return this.onAfter3 !== DelegateOperation.prototype.onAfter3 || this.delegate.hasOnAfter3();
    }
  }, {
    key: "queryExecutor",
    value: function queryExecutor(builder) {
      return this.delegate.queryExecutor(builder);
    }
  }, {
    key: "hasQueryExecutor",
    value: function hasQueryExecutor() {
      return this.queryExecutor !== DelegateOperation.prototype.queryExecutor || this.delegate.hasQueryExecutor();
    }
  }, {
    key: "onError",
    value: function onError(builder, error) {
      return this.delegate.onError(builder, error);
    }
  }, {
    key: "hasOnError",
    value: function hasOnError() {
      return this.onError !== DelegateOperation.prototype.onError || this.delegate.hasOnError();
    }
  }]);

  return DelegateOperation;
}(QueryBuilderOperation);

module.exports = DelegateOperation;