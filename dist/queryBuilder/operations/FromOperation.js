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

var ObjectionToKnexConvertingOperation = require('./ObjectionToKnexConvertingOperation');

var _require = require('../../utils/objectUtils'),
    isPlainObject = _require.isPlainObject,
    isString = _require.isString;

var ALIAS_REGEX = /\s+as\s+/i; // FromOperation corresponds to a `.from(args)` call. The call is delegated to
// knex, but we first try to parse the arguments so that we can determine which
// tables have been mentioned in a query's from clause. We only parse string
// references and not `raw` or `ref` etc. references at this point thouhg.

var FromOperation =
/*#__PURE__*/
function (_ObjectionToKnexConve) {
  _inherits(FromOperation, _ObjectionToKnexConve);

  function FromOperation(name, opt) {
    var _this;

    _classCallCheck(this, FromOperation);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(FromOperation).call(this, name, opt));
    _this.table = null;
    _this.alias = null;
    return _this;
  }

  _createClass(FromOperation, [{
    key: "onAdd",
    value: function onAdd(builder, args) {
      var ret = _get(_getPrototypeOf(FromOperation.prototype), "onAdd", this).call(this, builder, args);

      var parsed = parseTableAndAlias(this.args[0], builder);

      if (parsed.table) {
        builder.tableNameFor(builder.modelClass().getTableName(), parsed.table);
        this.table = parsed.table;
      }

      if (parsed.alias) {
        builder.aliasFor(builder.modelClass().getTableName(), parsed.alias);
        this.alias = parsed.alias;
      }

      return ret;
    }
  }, {
    key: "onBuildKnex",
    value: function onBuildKnex(knexBuilder, builder) {
      // Simply call knex's from method with the converted arguments.
      knexBuilder.from.apply(knexBuilder, this.args);
    }
  }]);

  return FromOperation;
}(ObjectionToKnexConvertingOperation);

function parseTableAndAlias(arg, builder) {
  if (isString(arg)) {
    return parseTableAndAliasFromString(arg);
  } else if (isPlainObject(arg)) {
    return parseTableAndAliasFromObject(arg, builder);
  } else {
    // Could not parse table and alias from the arguments.
    return {
      table: null,
      alias: null
    };
  }
}

function parseTableAndAliasFromString(arg) {
  if (ALIAS_REGEX.test(arg)) {
    var parts = arg.split(ALIAS_REGEX);
    return {
      table: parts[0].trim(),
      alias: parts[1].trim()
    };
  } else {
    return {
      table: arg.trim(),
      alias: null
    };
  }
}

function parseTableAndAliasFromObject(arg, builder) {
  var aliases = Object.keys(arg);

  for (var i = 0, l = aliases.length; i < l; ++i) {
    var alias = aliases[i].trim();
    var table = arg[alias].trim();

    if (table === builder.modelClass().getTableName()) {
      return {
        alias: alias,
        table: table
      };
    }
  }

  throw new Error("one of the tables in ".concat(JSON.stringify(arg), " must be the query's model class's table."));
}

module.exports = FromOperation;