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

var promiseUtils = require('../../../utils/promiseUtils');

var EagerOperation = require('./EagerOperation');

var _require = require('../../../utils/knexUtils'),
    isMsSql = _require.isMsSql;

var _require2 = require('../../../utils/objectUtils'),
    asArray = _require2.asArray,
    flatten = _require2.flatten,
    chunk = _require2.chunk;

var _require3 = require('../../../model/ValidationError'),
    ValidationErrorType = _require3.Type;

var _require4 = require('../../../utils/createModifier'),
    createModifier = _require4.createModifier;

var RelationDoesNotExistError = require('../../../model/RelationDoesNotExistError');

var WhereInEagerOperation =
/*#__PURE__*/
function (_EagerOperation) {
  _inherits(WhereInEagerOperation, _EagerOperation);

  function WhereInEagerOperation(name, opt) {
    var _this;

    _classCallCheck(this, WhereInEagerOperation);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(WhereInEagerOperation).call(this, name, opt));
    _this.relationsToFetch = [];
    _this.omitProps = [];
    return _this;
  }

  _createClass(WhereInEagerOperation, [{
    key: "batchSize",
    value: function batchSize(knex) {
      if (isMsSql(knex)) {
        // On MSSQL the parameter limit is actually 2100, but since I couldn't figure out
        // if the limit is for all parameters in a query or for individual clauses, we set
        // the limit to 2000 to leave 100 parameters for where clauses etc.
        return 2000;
      } else {
        // I'm sure there is some kind of limit for other databases too, but let's lower
        // this if someone ever hits those limits.
        return 10000;
      }
    }
  }, {
    key: "onAdd",
    value: function onAdd(builder, args) {
      var _this2 = this;

      var ret = _get(_getPrototypeOf(WhereInEagerOperation.prototype), "onAdd", this).call(this, builder, args);

      var modelClass = builder.modelClass();
      var relations = modelClass.getRelations();

      try {
        this.expression.forEachChildExpression(relations, function (childExpression, relation) {
          _this2.relationsToFetch.push({
            childExpression: childExpression,
            relation: relation
          });
        });
      } catch (err) {
        if (err instanceof RelationDoesNotExistError) {
          throw modelClass.createValidationError({
            type: ValidationErrorType.RelationExpression,
            message: "unknown relation \"".concat(err.relationName, "\" in an eager expression")
          });
        }

        throw err;
      }

      return ret;
    }
  }, {
    key: "onBuild",
    value: function onBuild(builder) {
      var addedSelects = []; // Collect columns that need to be selected for the eager fetch
      // to work that are not currently selected.

      for (var i = 0, l = this.relationsToFetch.length; i < l; ++i) {
        var relation = this.relationsToFetch[i].relation;
        var ownerProp = relation.ownerProp;

        for (var c = 0, lc = ownerProp.size; c < lc; ++c) {
          var fullCol = ownerProp.fullCol(builder, c);
          var prop = ownerProp.props[c];
          var col = ownerProp.cols[c];

          if (!builder.hasSelectionAs(fullCol, col) && addedSelects.indexOf(fullCol) === -1) {
            this.omitProps.push(prop);
            addedSelects.push(fullCol);
          }
        }
      }

      if (addedSelects.length) {
        builder.select(addedSelects);
      }
    }
  }, {
    key: "onAfter2",
    value: function onAfter2(builder, result) {
      var _this3 = this;

      var modelClass = builder.resultModelClass();

      if (!result) {
        return result;
      }

      var models = asArray(result);

      if (!models.length || !(models[0] instanceof modelClass)) {
        return result;
      }

      var promise = promiseUtils.map(this.relationsToFetch, function (it) {
        return _this3.fetchRelation(builder, models, it.relation, it.childExpression);
      }, {
        concurrency: modelClass.getConcurrency(builder.unsafeKnex())
      });
      return promise.then(function () {
        var intOpt = builder.internalOptions();

        if (!_this3.omitProps.length || intOpt.keepImplicitJoinProps) {
          return result;
        } // Now that relations have been fetched for `models` we can omit the
        // columns that were implicitly selected by this class.


        for (var i = 0, l = result.length; i < l; ++i) {
          var model = result[i];

          for (var c = 0, lc = _this3.omitProps.length; c < lc; ++c) {
            modelClass.omitImpl(model, _this3.omitProps[c]);
          }
        }

        return result;
      });
    }
  }, {
    key: "fetchRelation",
    value: function fetchRelation(builder, models, relation, expr) {
      var _this4 = this;

      var modelClass = builder.resultModelClass();
      var batchSize = this.batchSize(builder.knex());
      var modelBatches = chunk(models, batchSize);
      return promiseUtils.map(modelBatches, function (batch) {
        return _this4.fetchRelationBatch(builder, batch, relation, expr);
      }, {
        concurrency: modelClass.getConcurrency(builder.unsafeKnex())
      }).then(flatten);
    }
  }, {
    key: "fetchRelationBatch",
    value: function fetchRelationBatch(builder, models, relation, expr) {
      var queryBuilder = this.createRelationQuery(builder, relation, expr);
      var findOperation = relation.find(queryBuilder, models);
      findOperation.alwaysReturnArray = true;
      findOperation.assignResultToOwner = true;
      findOperation.relationProperty = expr.$name;
      queryBuilder.addOperation(findOperation, []);

      for (var i = 0, l = expr.$modify.length; i < l; ++i) {
        var modifierName = expr.$modify[i];
        var modifier = createModifier({
          modifier: modifierName,
          modelClass: relation.relatedModelClass,
          modifiers: this.modifiers
        });

        try {
          modifier(queryBuilder);
        } catch (err) {
          var modelClass = builder.modelClass();

          if (err instanceof modelClass.ModifierNotFoundError) {
            throw modelClass.createValidationError({
              type: ValidationErrorType.RelationExpression,
              message: "could not find modifier \"".concat(modifierName, "\" for relation \"").concat(relation.name, "\"")
            });
          } else {
            throw err;
          }
        }
      }

      return queryBuilder;
    }
  }, {
    key: "createRelationQuery",
    value: function createRelationQuery(builder, relation, childExpression) {
      return relation.relatedModelClass.query().childQueryOf(builder).eagerOperationFactory(builder.eagerOperationFactory()).eagerOptions(builder.eagerOptions()).eager(childExpression, this.modifiers);
    }
  }]);

  return WhereInEagerOperation;
}(EagerOperation);

module.exports = WhereInEagerOperation;