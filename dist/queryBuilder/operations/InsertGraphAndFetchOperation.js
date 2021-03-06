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

var DelegateOperation = require('./DelegateOperation');

var InsertGraphOperation = require('./InsertGraphOperation');

var _require = require('../RelationExpression'),
    RelationExpression = _require.RelationExpression;

var InsertGraphAndFetchOperation =
/*#__PURE__*/
function (_DelegateOperation) {
  _inherits(InsertGraphAndFetchOperation, _DelegateOperation);

  function InsertGraphAndFetchOperation(name, opt) {
    var _this;

    _classCallCheck(this, InsertGraphAndFetchOperation);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(InsertGraphAndFetchOperation).call(this, name, opt));

    if (!_this.delegate.is(InsertGraphOperation)) {
      throw new Error('Invalid delegate');
    }

    return _this;
  }

  _createClass(InsertGraphAndFetchOperation, [{
    key: "onAfter2",
    value: function onAfter2(builder) {
      var _this2 = this;

      var eager = RelationExpression.fromModelGraph(this.models);
      var modelClass = this.models[0].constructor;
      var ids = new Array(this.models.length);

      for (var i = 0, l = this.models.length; i < l; ++i) {
        ids[i] = this.models[i].$id();
      }

      return modelClass.query().childQueryOf(builder).whereIn(builder.fullIdColumnFor(modelClass), ids).eager(eager).then(function (models) {
        return _this2.isArray ? models : models[0] || null;
      });
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

  return InsertGraphAndFetchOperation;
}(DelegateOperation);

module.exports = InsertGraphAndFetchOperation;