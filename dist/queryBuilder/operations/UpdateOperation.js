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

var _require = require('../../queryBuilder/ReferenceBuilder'),
    ref = _require.ref;

var _require2 = require('../../utils/objectUtils'),
    isEmpty = _require2.isEmpty;

var _require3 = require('../../utils/promiseUtils'),
    afterReturn = _require3.afterReturn;

var _require4 = require('../../utils/knexUtils'),
    isKnexRaw = _require4.isKnexRaw,
    isKnexQueryBuilder = _require4.isKnexQueryBuilder;

var QueryBuilderOperation = require('./QueryBuilderOperation');

var UpdateOperation =
/*#__PURE__*/
function (_QueryBuilderOperatio) {
  _inherits(UpdateOperation, _QueryBuilderOperatio);

  function UpdateOperation(name, opt) {
    var _this;

    _classCallCheck(this, UpdateOperation);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(UpdateOperation).call(this, name, opt));
    _this.model = null;
    _this.modelOptions = Object.assign({}, _this.opt.modelOptions || {});
    return _this;
  }

  _createClass(UpdateOperation, [{
    key: "onAdd",
    value: function onAdd(builder, args) {
      var json = args[0];
      var modelClass = builder.modelClass();
      this.model = modelClass.ensureModel(json, this.modelOptions);
      return true;
    }
  }, {
    key: "onBefore2",
    value: function onBefore2(builder, result) {
      var maybePromise = this.model.$beforeUpdate(this.modelOptions, builder.context());
      return afterReturn(maybePromise, result);
    }
  }, {
    key: "onBefore3",
    value: function onBefore3(builder) {
      var row = this.model.$toDatabaseJson(builder);

      if (isEmpty(row)) {
        // Resolve the query if there is nothing to update.
        builder.resolve([0]);
      }
    }
  }, {
    key: "onBuildKnex",
    value: function onBuildKnex(knexBuilder, builder) {
      var json = this.model.$toDatabaseJson(builder);
      var convertedJson = this.convertFieldExpressionsToRaw(builder, json);
      knexBuilder.update(convertedJson);
    }
  }, {
    key: "onAfter2",
    value: function onAfter2(builder, numUpdated) {
      var maybePromise = this.model.$afterUpdate(this.modelOptions, builder.context());
      return afterReturn(maybePromise, numUpdated);
    }
  }, {
    key: "convertFieldExpressionsToRaw",
    value: function convertFieldExpressionsToRaw(builder, json) {
      var knex = builder.knex();
      var convertedJson = {};
      var keys = Object.keys(json);

      for (var i = 0, l = keys.length; i < l; ++i) {
        var key = keys[i];
        var val = json[key];

        if (key.indexOf(':') > -1) {
          // 'col:attr' : ref('other:lol') is transformed to
          // "col" : raw(`jsonb_set("col", '{attr}', to_jsonb("other"#>'{lol}'), true)`)
          var parsed = ref(key);
          var jsonRefs = '{' + parsed.reference.access.map(function (it) {
            return it.ref;
          }).join(',') + '}';
          var valuePlaceholder = '?';

          if (isKnexQueryBuilder(val) || isKnexRaw(val)) {
            valuePlaceholder = 'to_jsonb(?)';
          } else {
            val = JSON.stringify(val);
          }

          convertedJson[parsed.column] = knex.raw("jsonb_set(??, '".concat(jsonRefs, "', ").concat(valuePlaceholder, ", true)"), [convertedJson[parsed.column] || parsed.column, val]);
        } else {
          convertedJson[key] = val;
        }
      }

      return convertedJson;
    }
  }]);

  return UpdateOperation;
}(QueryBuilderOperation);

module.exports = UpdateOperation;