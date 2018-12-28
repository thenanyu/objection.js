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

var QueryBuilderOperationSupport = require('./QueryBuilderOperationSupport');

var KnexOperation = require('./operations/KnexOperation');

var JoinBuilder =
/*#__PURE__*/
function (_QueryBuilderOperatio) {
  _inherits(JoinBuilder, _QueryBuilderOperatio);

  function JoinBuilder() {
    _classCallCheck(this, JoinBuilder);

    return _possibleConstructorReturn(this, _getPrototypeOf(JoinBuilder).apply(this, arguments));
  }

  _createClass(JoinBuilder, [{
    key: "using",
    value: function using() {
      return this.addOperation(new KnexOperation('using'), arguments);
    }
  }, {
    key: "on",
    value: function on() {
      return this.addOperation(new KnexOperation('on'), arguments);
    }
  }, {
    key: "orOn",
    value: function orOn() {
      return this.addOperation(new KnexOperation('orOn'), arguments);
    }
  }, {
    key: "onBetween",
    value: function onBetween() {
      return this.addOperation(new KnexOperation('onBetween'), arguments);
    }
  }, {
    key: "onNotBetween",
    value: function onNotBetween() {
      return this.addOperation(new KnexOperation('onNotBetween'), arguments);
    }
  }, {
    key: "orOnBetween",
    value: function orOnBetween() {
      return this.addOperation(new KnexOperation('orOnBetween'), arguments);
    }
  }, {
    key: "orOnNotBetween",
    value: function orOnNotBetween() {
      return this.addOperation(new KnexOperation('orOnNotBetween'), arguments);
    }
  }, {
    key: "onIn",
    value: function onIn() {
      return this.addOperation(new KnexOperation('onIn'), arguments);
    }
  }, {
    key: "onNotIn",
    value: function onNotIn() {
      return this.addOperation(new KnexOperation('onNotIn'), arguments);
    }
  }, {
    key: "orOnIn",
    value: function orOnIn() {
      return this.addOperation(new KnexOperation('orOnIn'), arguments);
    }
  }, {
    key: "orOnNotIn",
    value: function orOnNotIn() {
      return this.addOperation(new KnexOperation('orOnNotIn'), arguments);
    }
  }, {
    key: "onNull",
    value: function onNull() {
      return this.addOperation(new KnexOperation('onNull'), arguments);
    }
  }, {
    key: "orOnNull",
    value: function orOnNull() {
      return this.addOperation(new KnexOperation('orOnNull'), arguments);
    }
  }, {
    key: "onNotNull",
    value: function onNotNull() {
      return this.addOperation(new KnexOperation('onNotNull'), arguments);
    }
  }, {
    key: "orOnNotNull",
    value: function orOnNotNull() {
      return this.addOperation(new KnexOperation('orOnNotNull'), arguments);
    }
  }, {
    key: "onExists",
    value: function onExists() {
      return this.addOperation(new KnexOperation('onExists'), arguments);
    }
  }, {
    key: "orOnExists",
    value: function orOnExists() {
      return this.addOperation(new KnexOperation('orOnExists'), arguments);
    }
  }, {
    key: "onNotExists",
    value: function onNotExists() {
      return this.addOperation(new KnexOperation('onNotExists'), arguments);
    }
  }, {
    key: "orOnNotExists",
    value: function orOnNotExists() {
      return this.addOperation(new KnexOperation('orOnNotExists'), arguments);
    }
  }, {
    key: "type",
    value: function type() {
      return this.addOperation(new KnexOperation('type'), arguments);
    }
  }, {
    key: "andOn",
    value: function andOn() {
      return this.addOperation(new KnexOperation('andOn'), arguments);
    }
  }, {
    key: "andOnIn",
    value: function andOnIn() {
      return this.addOperation(new KnexOperation('andOnIn'), arguments);
    }
  }, {
    key: "andOnNotIn",
    value: function andOnNotIn() {
      return this.addOperation(new KnexOperation('andOnNotIn'), arguments);
    }
  }, {
    key: "andOnNull",
    value: function andOnNull() {
      return this.addOperation(new KnexOperation('andOnNull'), arguments);
    }
  }, {
    key: "andOnNotNull",
    value: function andOnNotNull() {
      return this.addOperation(new KnexOperation('andOnNotNull'), arguments);
    }
  }, {
    key: "andOnExists",
    value: function andOnExists() {
      return this.addOperation(new KnexOperation('andOnExists'), arguments);
    }
  }, {
    key: "andOnNotExists",
    value: function andOnNotExists() {
      return this.addOperation(new KnexOperation('andOnNotExists'), arguments);
    }
  }, {
    key: "andOnBetween",
    value: function andOnBetween() {
      return this.addOperation(new KnexOperation('andOnBetween'), arguments);
    }
  }, {
    key: "andOnNotBetween",
    value: function andOnNotBetween() {
      return this.addOperation(new KnexOperation('andOnNotBetween'), arguments);
    }
  }]);

  return JoinBuilder;
}(QueryBuilderOperationSupport);

module.exports = JoinBuilder;