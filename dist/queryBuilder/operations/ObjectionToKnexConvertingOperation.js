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

var once = require('../../utils/objectUtils').once;

var QueryBuilderOperation = require('./QueryBuilderOperation');

var _require = require('../../utils/objectUtils'),
    isPlainObject = _require.isPlainObject,
    isObject = _require.isObject,
    isFunction = _require.isFunction;

var _require2 = require('../../utils/knexUtils'),
    isKnexQueryBuilder = _require2.isKnexQueryBuilder,
    isKnexJoinBuilder = _require2.isKnexJoinBuilder;

var getJoinBuilder = once(function () {
  return require('../JoinBuilder');
}); // An abstract operation base class that converts all arguments from objection types
// to knex types. For example objection query builders are converted into knex query
// builders and objection RawBuilder instances are converted into knex Raw instances.

var ObjectionToKnexConvertingOperation =
/*#__PURE__*/
function (_QueryBuilderOperatio) {
  _inherits(ObjectionToKnexConvertingOperation, _QueryBuilderOperatio);

  function ObjectionToKnexConvertingOperation(name, opt) {
    var _this;

    _classCallCheck(this, ObjectionToKnexConvertingOperation);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ObjectionToKnexConvertingOperation).call(this, name, opt));
    _this.rawArgs = null;
    _this.args = null;
    return _this;
  }

  _createClass(ObjectionToKnexConvertingOperation, [{
    key: "onAdd",
    value: function onAdd(builder, args) {
      this.rawArgs = args;
      this.args = args;
      return shouldBeAdded(this.name, builder, args);
    }
  }, {
    key: "onBuild",
    value: function onBuild(builder) {
      this.args = convertArgs(this.name, builder, this.rawArgs);
    }
  }]);

  return ObjectionToKnexConvertingOperation;
}(QueryBuilderOperation);

function shouldBeAdded(opName, builder, args) {
  var skipUndefined = builder.internalOptions().skipUndefined;

  for (var i = 0, l = args.length; i < l; ++i) {
    var arg = args[i];

    if (isUndefined(arg)) {
      if (skipUndefined) {
        return false;
      } else {
        throw new Error("undefined passed as argument #".concat(i, " for '").concat(opName, "' operation. Call skipUndefined() method to ignore the undefined values."));
      }
    }
  }

  return true;
}

function convertArgs(opName, builder, args) {
  var skipUndefined = builder.internalOptions().skipUndefined;
  var out = new Array(args.length);

  for (var i = 0, l = args.length; i < l; ++i) {
    var arg = args[i];

    if (hasToKnexRawMethod(arg)) {
      out[i] = convertToKnexRaw(arg, builder);
    } else if (isObjectionQueryBuilderBase(arg)) {
      out[i] = convertQueryBuilderBase(arg, builder);
    } else if (isArray(arg)) {
      out[i] = convertArray(arg, builder, i, opName, skipUndefined);
    } else if (isFunction(arg)) {
      out[i] = convertFunction(arg, builder);
    } else if (isModel(arg)) {
      out[i] = convertModel(arg);
    } else if (isPlainObject(arg)) {
      out[i] = convertPlainObject(arg, builder, i, opName, skipUndefined);
    } else {
      out[i] = arg;
    }
  }

  return out;
}

function isUndefined(item) {
  return item === undefined;
}

function hasToKnexRawMethod(item) {
  return isObject(item) && isFunction(item.toKnexRaw);
}

function convertToKnexRaw(item, builder) {
  return item.toKnexRaw(builder);
}

function isObjectionQueryBuilderBase(item) {
  return isObject(item) && item.isObjectionQueryBuilderBase === true;
}

function convertQueryBuilderBase(item, builder) {
  return item.subqueryOf(builder).build();
}

function isArray(item) {
  return Array.isArray(item);
}

function convertArray(arr, builder, i, opName, skipUndefined) {
  var out = [];

  for (var j = 0, l = arr.length; j < l; ++j) {
    var item = arr[j];

    if (item === undefined) {
      if (!skipUndefined) {
        throw new Error("undefined passed as an item in argument #".concat(i, " for '").concat(opName, "' operation. Call skipUndefined() method to ignore the undefined values."));
      }
    } else if (hasToKnexRawMethod(item)) {
      out.push(convertToKnexRaw(item, builder));
    } else if (isObjectionQueryBuilderBase(item)) {
      out.push(convertQueryBuilderBase(item));
    } else {
      out.push(item);
    }
  }

  return out;
}

function convertFunction(func, builder) {
  return function convertedKnexArgumentFunction() {
    if (isKnexQueryBuilder(this)) {
      convertQueryBuilderFunction(this, func, builder);
    } else if (isKnexJoinBuilder(this)) {
      convertJoinBuilderFunction(this, func, builder);
    } else {
      return func.apply(this, arguments);
    }
  };
}

function convertQueryBuilderFunction(knexQueryBuilder, func, builder) {
  var convertedQueryBuilder = builder.constructor.forClass(builder.modelClass());
  convertedQueryBuilder.subqueryOf(builder).isPartialQuery(true);
  func.call(convertedQueryBuilder, convertedQueryBuilder);
  convertedQueryBuilder.build(knexQueryBuilder);
}

function convertJoinBuilderFunction(knexJoinBuilder, func, builder) {
  var JoinBuilder = getJoinBuilder();
  var joinClauseBuilder = new JoinBuilder(builder.knex());
  joinClauseBuilder.subqueryOf(builder).isPartialQuery(true);
  func.call(joinClauseBuilder, joinClauseBuilder);
  joinClauseBuilder.buildInto(knexJoinBuilder);
}

function isModel(item) {
  return isObject(item) && item.$isObjectionModel;
}

function convertModel(model) {
  return model.$toDatabaseJson();
}

function convertPlainObject(obj, builder, i, opName, skipUndefined) {
  var out = {};
  var keys = Object.keys(obj);

  for (var j = 0, l = keys.length; j < l; ++j) {
    var key = keys[j];
    var item = obj[key];

    if (item === undefined) {
      if (!skipUndefined) {
        throw new Error("undefined passed as a property in argument #".concat(i, " for '").concat(opName, "' operation. Call skipUndefined() method to ignore the undefined values."));
      }
    } else if (hasToKnexRawMethod(item)) {
      out[key] = convertToKnexRaw(item, builder);
    } else if (isObjectionQueryBuilderBase(item)) {
      out[key] = convertQueryBuilderBase(item, builder);
    } else {
      out[key] = item;
    }
  }

  return out;
}

module.exports = ObjectionToKnexConvertingOperation;