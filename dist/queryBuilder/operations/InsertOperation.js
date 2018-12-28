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

var QueryBuilderOperation = require('./QueryBuilderOperation');

var _require = require('../../utils/promiseUtils'),
    mapAfterAllReturn = _require.mapAfterAllReturn;

var _require2 = require('../../utils/knexUtils'),
    isPostgres = _require2.isPostgres,
    isSqlite = _require2.isSqlite;

var _require3 = require('../../utils/objectUtils'),
    isObject = _require3.isObject; // Base class for all insert operations.


var InsertOperation =
/*#__PURE__*/
function (_QueryBuilderOperatio) {
  _inherits(InsertOperation, _QueryBuilderOperatio);

  function InsertOperation(name, opt) {
    var _this;

    _classCallCheck(this, InsertOperation);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(InsertOperation).call(this, name, opt));
    _this.models = null;
    _this.isArray = false;
    _this.modelOptions = Object.assign({}, _this.opt.modelOptions || {});
    return _this;
  }

  _createClass(InsertOperation, [{
    key: "onAdd",
    value: function onAdd(builder, args) {
      var json = args[0];
      var modelClass = builder.modelClass();
      this.isArray = Array.isArray(json);
      this.models = modelClass.ensureModelArray(json, this.modelOptions);
      return true;
    }
  }, {
    key: "onBefore2",
    value: function onBefore2(builder, result) {
      if (this.models.length > 1 && !isPostgres(builder.knex())) {
        throw new Error('batch insert only works with Postgresql');
      } else {
        return mapAfterAllReturn(this.models, function (model) {
          return model.$beforeInsert(builder.context());
        }, result);
      }
    }
  }, {
    key: "onBuildKnex",
    value: function onBuildKnex(knexBuilder, builder) {
      if (!isSqlite(builder.knex()) && !builder.has(/returning/)) {
        // If the user hasn't specified a `returning` clause, we make sure
        // that at least the identifier is returned.
        knexBuilder.returning(builder.modelClass().getIdColumn());
      }

      var json = new Array(this.models.length);

      for (var i = 0, l = this.models.length; i < l; ++i) {
        json[i] = this.models[i].$toDatabaseJson(builder);
      }

      knexBuilder.insert(json);
    }
  }, {
    key: "onAfter1",
    value: function onAfter1(builder, ret) {
      if (!Array.isArray(ret) || !ret.length || ret === this.models) {
        // Early exit if there is nothing to do.
        return this.models;
      }

      if (isObject(ret[0])) {
        // If the user specified a `returning` clause the result may be an array of objects.
        // Merge all values of the objects to our models.
        for (var i = 0, l = this.models.length; i < l; ++i) {
          this.models[i].$set(ret[i]);
        }
      } else {
        // If the return value is not an array of objects, we assume it is an array of identifiers.
        for (var _i = 0, _l = this.models.length; _i < _l; ++_i) {
          var model = this.models[_i]; // Don't set the id if the model already has one. MySQL and Sqlite don't return the correct
          // primary key value if the id is not generated in db, but given explicitly.

          if (!model.$id()) {
            model.$id(ret[_i]);
          }
        }
      }

      return this.models;
    }
  }, {
    key: "onAfter2",
    value: function onAfter2(builder, models) {
      var result = this.isArray ? models : models[0] || null;
      return mapAfterAllReturn(models, function (model) {
        return model.$afterInsert(builder.context());
      }, result);
    }
  }]);

  return InsertOperation;
}(QueryBuilderOperation);

module.exports = InsertOperation;