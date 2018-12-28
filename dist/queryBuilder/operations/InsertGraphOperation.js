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

var InsertOperation = require('./InsertOperation');

var _require = require('../graph/GraphUpsert'),
    GraphUpsert = _require.GraphUpsert;

var InsertGraphOperation =
/*#__PURE__*/
function (_DelegateOperation) {
  _inherits(InsertGraphOperation, _DelegateOperation);

  function InsertGraphOperation(name, opt) {
    var _this;

    _classCallCheck(this, InsertGraphOperation);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(InsertGraphOperation).call(this, name, opt));

    if (!_this.delegate.is(InsertOperation)) {
      throw new Error('Invalid delegate');
    }

    Object.assign(_this.delegate.modelOptions, GraphUpsert.modelOptions);
    _this.upsertOptions = opt.opt || {};
    return _this;
  }

  _createClass(InsertGraphOperation, [{
    key: "onAdd",
    value: function onAdd(builder, args) {
      var retVal = _get(_getPrototypeOf(InsertGraphOperation.prototype), "onAdd", this).call(this, builder, args);

      this.upsert = new GraphUpsert({
        objects: this.models,
        rootModelClass: builder.modelClass(),
        upsertOptions: Object.assign({}, this.upsertOptions, {
          noUpdate: true,
          noDelete: true,
          noUnrelate: true,
          insertMissing: true
        })
      }); // We resolve this query here and will not execute it. This is because the root
      // value may depend on other models in the graph and cannot be inserted first.

      builder.resolve([]);
      return retVal;
    }
  }, {
    key: "onBefore1",
    value: function onBefore1() {// Do nothing.
    }
  }, {
    key: "onBefore2",
    value: function onBefore2() {// Do nothing. We override this with empty implementation so that
      // the $beforeInsert() hooks are not called twice for the root models.
    }
  }, {
    key: "onBefore3",
    value: function onBefore3() {// Do nothing.
    }
  }, {
    key: "onBuild",
    value: function onBuild() {// Do nothing.
    }
  }, {
    key: "onBuildKnex",
    value: function onBuildKnex() {} // Do nothing.
    // We overrode all other hooks but this one and do all the work in here.
    // This is a bit hacky.

  }, {
    key: "onAfter1",
    value: function onAfter1(builder) {
      var _this2 = this;

      for (var _len = arguments.length, restArgs = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        restArgs[_key - 1] = arguments[_key];
      }

      return this.upsert.run(builder).then(function () {
        var _get2;

        return (_get2 = _get(_getPrototypeOf(InsertGraphOperation.prototype), "onAfter1", _this2)).call.apply(_get2, [_this2, builder].concat(restArgs));
      });
    }
  }, {
    key: "onAfter2",
    value: function onAfter2() {
      // We override this with empty implementation so that the $afterInsert() hooks
      // are not called twice for the root models.
      return this.isArray ? this.models : this.models[0] || null;
    }
  }, {
    key: "models",
    get: function get() {
      return this.delegate.models;
    }
  }, {
    key: "isArray",
    get: function get() {
      return this.delegate.isArray;
    }
  }]);

  return InsertGraphOperation;
}(DelegateOperation);

module.exports = InsertGraphOperation;