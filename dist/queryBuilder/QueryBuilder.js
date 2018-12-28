'use strict';

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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

var Bluebird = require('bluebird');

var _require = require('./RawBuilder'),
    raw = _require.raw;

var _require2 = require('../utils/createModifier'),
    createModifier = _require2.createModifier;

var _require3 = require('../model/ValidationError'),
    ValidationErrorType = _require3.Type;

var _require4 = require('../utils/objectUtils'),
    isObject = _require4.isObject,
    isString = _require4.isString,
    isFunction = _require4.isFunction,
    last = _require4.last;

var _require5 = require('./RelationExpression'),
    RelationExpression = _require5.RelationExpression,
    DuplicateRelationError = _require5.DuplicateRelationError;

var _require6 = require('./operations/select/Selection'),
    Selection = _require6.Selection;

var QueryBuilderContext = require('./QueryBuilderContext');

var QueryBuilderBase = require('./QueryBuilderBase');

var FindOperation = require('./operations/FindOperation');

var DeleteOperation = require('./operations/DeleteOperation');

var UpdateOperation = require('./operations/UpdateOperation');

var InsertOperation = require('./operations/InsertOperation');

var RelateOperation = require('./operations/RelateOperation');

var UnrelateOperation = require('./operations/UnrelateOperation');

var InsertGraphAndFetchOperation = require('./operations/InsertGraphAndFetchOperation');

var UpsertGraphAndFetchOperation = require('./operations/UpsertGraphAndFetchOperation');

var InsertAndFetchOperation = require('./operations/InsertAndFetchOperation');

var UpdateAndFetchOperation = require('./operations/UpdateAndFetchOperation');

var JoinRelationOperation = require('./operations/JoinRelationOperation');

var OnBuildKnexOperation = require('./operations/OnBuildKnexOperation');

var InsertGraphOperation = require('./operations/InsertGraphOperation');

var UpsertGraphOperation = require('./operations/UpsertGraphOperation');

var DeleteByIdOperation = require('./operations/DeleteByIdOperation');

var RunBeforeOperation = require('./operations/RunBeforeOperation');

var RunAfterOperation = require('./operations/RunAfterOperation');

var FindByIdOperation = require('./operations/FindByIdOperation');

var FindByIdsOperation = require('./operations/FindByIdsOperation');

var OnBuildOperation = require('./operations/OnBuildOperation');

var OnErrorOperation = require('./operations/OnErrorOperation');

var SelectOperation = require('./operations/select/SelectOperation');

var EagerOperation = require('./operations/eager/EagerOperation');

var RangeOperation = require('./operations/RangeOperation');

var FirstOperation = require('./operations/FirstOperation');

var FromOperation = require('./operations/FromOperation');

var KnexOperation = require('./operations/KnexOperation');

var QueryBuilder =
/*#__PURE__*/
function (_QueryBuilderBase) {
  _inherits(QueryBuilder, _QueryBuilderBase);

  function QueryBuilder(modelClass) {
    var _this;

    _classCallCheck(this, QueryBuilder);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(QueryBuilder).call(this, modelClass.knex()));
    _this._modelClass = modelClass;
    _this._resultModelClass = null;
    _this._explicitRejectValue = null;
    _this._explicitResolveValue = null;
    _this._eagerExpression = null;
    _this._eagerModifiers = null;
    _this._eagerModifiersAtPath = [];
    _this._allowedEagerExpression = null;
    _this._allowedUpsertExpression = null;
    _this._findOperationOptions = modelClass.defaultFindOptions;
    _this._eagerOperationOptions = modelClass.defaultEagerOptions;
    _this._findOperationFactory = findOperationFactory;
    _this._insertOperationFactory = insertOperationFactory;
    _this._updateOperationFactory = updateOperationFactory;
    _this._patchOperationFactory = patchOperationFactory;
    _this._relateOperationFactory = relateOperationFactory;
    _this._unrelateOperationFactory = unrelateOperationFactory;
    _this._deleteOperationFactory = deleteOperationFactory;
    _this._eagerOperationFactory = modelClass.defaultEagerAlgorithm;
    return _this;
  }

  _createClass(QueryBuilder, [{
    key: "tableNameFor",
    value: function tableNameFor(modelClassOrTableName, newTableName) {
      return _get(_getPrototypeOf(QueryBuilder.prototype), "tableNameFor", this).call(this, getTableName(modelClassOrTableName), newTableName);
    }
  }, {
    key: "tableRef",
    value: function tableRef() {
      return this.tableRefFor(this.modelClass().getTableName());
    }
  }, {
    key: "aliasFor",
    value: function aliasFor(modelClassOrTableName, alias) {
      return _get(_getPrototypeOf(QueryBuilder.prototype), "aliasFor", this).call(this, getTableName(modelClassOrTableName), alias);
    }
  }, {
    key: "alias",
    value: function alias(_alias) {
      return this.aliasFor(this.modelClass().getTableName(), _alias);
    }
  }, {
    key: "fullIdColumnFor",
    value: function fullIdColumnFor(modelClass) {
      var tableName = this.tableRefFor(modelClass.getTableName());
      var idColumn = modelClass.getIdColumn();

      if (Array.isArray(idColumn)) {
        var id = new Array(idColumn.length);

        for (var i = 0, l = idColumn.length; i < l; ++i) {
          id[i] = "".concat(tableName, ".").concat(idColumn[i]);
        }

        return id;
      } else {
        return "".concat(tableName, ".").concat(idColumn);
      }
    }
  }, {
    key: "applyModifier",
    value: function applyModifier() {
      for (var i = 0, l = arguments.length; i < l; ++i) {
        var modifier = createModifier({
          modifier: arguments[i],
          modelClass: this.modelClass()
        });
        modifier(this);
      }

      return this;
    }
  }, {
    key: "applyFilter",
    value: function applyFilter() {
      return this.applyModifier.apply(this, arguments);
    }
  }, {
    key: "modify",
    value: function modify() {
      var arg = arguments[0];

      if (isFunction(arg)) {
        _get(_getPrototypeOf(QueryBuilder.prototype), "modify", this).apply(this, arguments);
      } else if (arg) {
        this.applyModifier.apply(this, arguments);
      }

      return this;
    }
  }, {
    key: "reject",
    value: function reject(error) {
      this._explicitRejectValue = error;
      return this;
    }
  }, {
    key: "resolve",
    value: function resolve(value) {
      this._explicitResolveValue = value;
      return this;
    }
  }, {
    key: "isExecutable",
    value: function isExecutable() {
      var hasExecutor = !!findQueryExecutorOperation(this);
      return !this._explicitRejectValue && !this._explicitResolveValue && !hasExecutor;
    }
  }, {
    key: "findOperationFactory",
    value: function findOperationFactory(factory) {
      this._findOperationFactory = factory;
      return this;
    }
  }, {
    key: "insertOperationFactory",
    value: function insertOperationFactory(factory) {
      this._insertOperationFactory = factory;
      return this;
    }
  }, {
    key: "updateOperationFactory",
    value: function updateOperationFactory(factory) {
      this._updateOperationFactory = factory;
      return this;
    }
  }, {
    key: "patchOperationFactory",
    value: function patchOperationFactory(factory) {
      this._patchOperationFactory = factory;
      return this;
    }
  }, {
    key: "deleteOperationFactory",
    value: function deleteOperationFactory(factory) {
      this._deleteOperationFactory = factory;
      return this;
    }
  }, {
    key: "relateOperationFactory",
    value: function relateOperationFactory(factory) {
      this._relateOperationFactory = factory;
      return this;
    }
  }, {
    key: "unrelateOperationFactory",
    value: function unrelateOperationFactory(factory) {
      this._unrelateOperationFactory = factory;
      return this;
    }
  }, {
    key: "eagerOperationFactory",
    value: function eagerOperationFactory(factory) {
      if (arguments.length) {
        this._eagerOperationFactory = factory;
        return this;
      } else {
        return this._eagerOperationFactory;
      }
    }
  }, {
    key: "eagerAlgorithm",
    value: function eagerAlgorithm(algorithm, eagerOptions) {
      this.eagerOperationFactory(algorithm);

      if (eagerOptions) {
        this.eagerOptions(eagerOptions);
      }

      return this;
    }
  }, {
    key: "eager",
    value: function eager(exp, modifiers) {
      this._eagerExpression = parseRelationExpression(this.modelClass(), exp);
      this._eagerModifiers = modifiers;
      checkEager(this);
      return this;
    }
  }, {
    key: "joinEager",
    value: function joinEager(exp, modifiers) {
      return this.eagerAlgorithm(this.modelClass().JoinEagerAlgorithm).eager(exp, modifiers);
    }
  }, {
    key: "naiveEager",
    value: function naiveEager(exp, modifiers) {
      return this.eagerAlgorithm(this.modelClass().NaiveEagerAlgorithm).eager(exp, modifiers);
    }
  }, {
    key: "mergeEager",
    value: function mergeEager(exp, modifiers) {
      if (!this._eagerExpression) {
        return this.eager(exp, modifiers);
      }

      this._eagerExpression = this._eagerExpression.merge(parseRelationExpression(this.modelClass(), exp));
      this._eagerModifiers = Object.assign({}, this._eagerModifiers, modifiers);
      checkEager(this);
      return this;
    }
  }, {
    key: "mergeJoinEager",
    value: function mergeJoinEager(exp, modifiers) {
      return this.eagerAlgorithm(this.modelClass().JoinEagerAlgorithm).mergeEager(exp, modifiers);
    }
  }, {
    key: "mergeNaiveEager",
    value: function mergeNaiveEager(exp, modifiers) {
      return this.eagerAlgorithm(this.modelClass().NaiveEagerAlgorithm).mergeEager(exp, modifiers);
    }
  }, {
    key: "allowEager",
    value: function allowEager(exp) {
      this._allowedEagerExpression = parseRelationExpression(this.modelClass(), exp);
      checkEager(this);
      return this;
    }
  }, {
    key: "eagerObject",
    value: function eagerObject() {
      if (this._eagerExpression) {
        return this._eagerExpression.toPojo();
      } else {
        return null;
      }
    }
  }, {
    key: "eagerModifiers",
    value: function eagerModifiers() {
      return Object.assign({}, this._eagerModifiers);
    }
  }, {
    key: "eagerModifiersAtPath",
    value: function eagerModifiersAtPath() {
      return this._eagerModifiersAtPath.map(function (it) {
        return Object.assign({}, it);
      });
    }
  }, {
    key: "allowedEagerExpression",
    value: function allowedEagerExpression() {
      return this._allowedEagerExpression;
    }
  }, {
    key: "mergeAllowEager",
    value: function mergeAllowEager(exp) {
      if (!this._allowedEagerExpression) {
        return this.allowEager(exp);
      }

      this._allowedEagerExpression = this._allowedEagerExpression.merge(parseRelationExpression(this.modelClass(), exp));
      checkEager(this);
      return this;
    }
  }, {
    key: "modifyEager",
    value: function modifyEager(path, modifier) {
      this._eagerModifiersAtPath.push({
        path: path,
        modifier: modifier
      });

      return this;
    }
  }, {
    key: "filterEager",
    value: function filterEager() {
      return this.modifyEager.apply(this, arguments);
    }
  }, {
    key: "allowUpsert",
    value: function allowUpsert(exp) {
      this._allowedUpsertExpression = exp || null;

      if (isString(this._allowedUpsertExpression)) {
        this._allowedUpsertExpression = parseRelationExpression(this.modelClass(), this._allowedUpsertExpression);
      }

      return this;
    }
  }, {
    key: "allowedUpsertExpression",
    value: function allowedUpsertExpression() {
      return this._allowedUpsertExpression;
    }
  }, {
    key: "allowInsert",
    value: function allowInsert(exp) {
      return this.allowUpsert(exp);
    }
  }, {
    key: "eagerOptions",
    value: function eagerOptions(opt) {
      if (arguments.length !== 0) {
        this._eagerOperationOptions = Object.assign({}, this._eagerOperationOptions, opt);
        return this;
      } else {
        return this._eagerOperationOptions;
      }
    }
  }, {
    key: "findOptions",
    value: function findOptions(opt) {
      if (arguments.length !== 0) {
        this._findOperationOptions = Object.assign({}, this._findOperationOptions, opt);
        return this;
      } else {
        return this._findOperationOptions;
      }
    }
  }, {
    key: "modelClass",
    value: function modelClass() {
      return this._modelClass;
    }
  }, {
    key: "resultModelClass",
    value: function resultModelClass() {
      return this._resultModelClass || this.modelClass();
    }
  }, {
    key: "isFind",
    value: function isFind() {
      return !(this.isInsert() || this.isUpdate() || this.isDelete() || this.isRelate() || this.isUnrelate());
    }
  }, {
    key: "isInsert",
    value: function isInsert() {
      return this.has(InsertOperation);
    }
  }, {
    key: "isUpdate",
    value: function isUpdate() {
      return this.has(UpdateOperation);
    }
  }, {
    key: "isDelete",
    value: function isDelete() {
      return this.has(DeleteOperation);
    }
  }, {
    key: "isRelate",
    value: function isRelate() {
      return this.has(RelateOperation);
    }
  }, {
    key: "isUnrelate",
    value: function isUnrelate() {
      return this.has(UnrelateOperation);
    }
  }, {
    key: "hasWheres",
    value: function hasWheres() {
      return this.has(QueryBuilderBase.WhereSelector);
    }
  }, {
    key: "hasSelects",
    value: function hasSelects() {
      return this.has(QueryBuilderBase.SelectSelector);
    }
  }, {
    key: "hasEager",
    value: function hasEager() {
      return !!this._eagerExpression;
    }
  }, {
    key: "isSelectAll",
    value: function isSelectAll() {
      if (this._operations.length === 0) {
        return true;
      }

      var tableRef = this.tableRef();
      var tableName = this.tableNameFor(this.modelClass().getTableName());
      return this._operations.every(function (op) {
        if (op.constructor === SelectOperation) {
          // SelectOperations with zero selections are the ones that only have
          // raw items or other non-trivial selections.
          return op.selections.length > 0 && op.selections.every(function (select) {
            return (!select.table || select.table === tableRef) && select.column === '*';
          });
        } else if (op.constructor === FromOperation) {
          return op.table === tableName;
        } else if (op.name === 'as') {
          return true;
        } else {
          return false;
        }
      });
    }
  }, {
    key: "isFindQuery",
    value: function isFindQuery() {
      console.warn("isFindQuery is deprecated. Use isFind instead. This method will be removed in version 2.0");
      return this.isFind();
    }
  }, {
    key: "isEagerQuery",
    value: function isEagerQuery() {
      console.warn("isEagerQuery is deprecated. Use hasEager instead. This method will be removed in version 2.0");
      return this.hasEager();
    }
  }, {
    key: "toString",
    value: function toString() {
      try {
        return this.build().toString();
      } catch (err) {
        return "This query cannot be built synchronously. Consider using debug() method instead.";
      }
    }
  }, {
    key: "toSql",
    value: function toSql() {
      return this.toString();
    }
  }, {
    key: "clone",
    value: function clone() {
      var builder = new this.constructor(this.modelClass()); // Call the super class's clone implementation.

      this.baseCloneInto(builder);
      builder._resultModelClass = this._resultModelClass;
      builder._explicitRejectValue = this._explicitRejectValue;
      builder._explicitResolveValue = this._explicitResolveValue;
      builder._eagerExpression = this._eagerExpression;
      builder._eagerModifiers = this._eagerModifiers;
      builder._eagerModifiersAtPath = this._eagerModifiersAtPath.slice();
      builder._allowedEagerExpression = this._allowedEagerExpression;
      builder._allowedUpsertExpression = this._allowedUpsertExpression;
      builder._findOperationOptions = this._findOperationOptions;
      builder._eagerOperationOptions = this._eagerOperationOptions;
      builder._findOperationFactory = this._findOperationFactory;
      builder._insertOperationFactory = this._insertOperationFactory;
      builder._updateOperationFactory = this._updateOperationFactory;
      builder._patchOperationFactory = this._patchOperationFactory;
      builder._relateOperationFactory = this._relateOperationFactory;
      builder._unrelateOperationFactory = this._unrelateOperationFactory;
      builder._deleteOperationFactory = this._deleteOperationFactory;
      builder._eagerOperationFactory = this._eagerOperationFactory;
      return builder;
    }
  }, {
    key: "clearEager",
    value: function clearEager() {
      this._eagerExpression = null;
      this._eagerModifiers = null;
      this._eagerModifiersAtPath = [];
      return this;
    }
  }, {
    key: "clearReject",
    value: function clearReject() {
      this._explicitRejectValue = null;
      return this;
    }
  }, {
    key: "clearResolve",
    value: function clearResolve() {
      this._explicitResolveValue = null;
      return this;
    }
  }, {
    key: "castTo",
    value: function castTo(modelClass) {
      this._resultModelClass = modelClass;
      return this;
    }
  }, {
    key: "then",
    value: function then(successHandler, errorHandler) {
      var promise = this.execute();
      return promise.then.apply(promise, arguments);
    }
  }, {
    key: "map",
    value: function map(mapper) {
      var promise = this.execute();
      return promise.map.apply(promise, arguments);
    }
  }, {
    key: "reduce",
    value: function reduce(reducer, initialValue) {
      var promise = this.execute();
      return promise.reduce.apply(promise, arguments);
    }
  }, {
    key: "catch",
    value: function _catch(errorHandler) {
      var promise = this.execute();
      return promise.catch.apply(promise, arguments);
    }
  }, {
    key: "return",
    value: function _return(returnValue) {
      var promise = this.execute();
      return promise.return.apply(promise, arguments);
    }
  }, {
    key: "reflect",
    value: function reflect() {
      var promise = this.execute();
      return promise.reflect();
    }
  }, {
    key: "bind",
    value: function bind(context) {
      var promise = this.execute();
      return promise.bind.apply(promise, arguments);
    }
  }, {
    key: "asCallback",
    value: function asCallback(callback) {
      var promise = this.execute();
      return promise.asCallback.apply(promise, arguments);
    }
  }, {
    key: "nodeify",
    value: function nodeify(callback) {
      var promise = this.execute();
      return promise.nodeify.apply(promise, arguments);
    }
  }, {
    key: "resultSize",
    value: function resultSize() {
      var knex = this.knex();
      var builder = this.clone().clear(/orderBy|offset|limit/);
      var countQuery = knex.count('* as count').from(function (knexBuilder) {
        builder.build(knexBuilder).as('temp');
      });

      if (this.internalOptions().debug) {
        countQuery.debug();
      }

      return countQuery.then(function (result) {
        return result[0] && result[0].count ? parseInt(result[0].count, 10) : 0;
      });
    }
  }, {
    key: "build",
    value: function build(knexBuilder) {
      // Take a clone so that we don't modify this instance during build.
      var builder = this.clone();

      if (builder.isFind()) {
        // If no write operations have been called at this point this query is a
        // find query and we need to call the custom find implementation.
        addFindOperation(builder);
      }

      if (builder.hasEager()) {
        // If the query is an eager query, add the eager operation only at
        // this point of the query execution.
        addEagerFetchOperation(builder);
      } // We need to build the builder even if a query executor operation
      // has been called so that the onBuild hooks get called.


      knexBuilder = buildInto(builder, knexBuilder || builder.knex().queryBuilder());
      var queryExecutorOperation = findQueryExecutorOperation(builder);

      if (queryExecutorOperation) {
        // If the query executor is set, we build the builder that it returns.
        return queryExecutorOperation.queryExecutor(builder).build();
      } else {
        return knexBuilder;
      }
    }
  }, {
    key: "execute",
    value: function execute() {
      // Take a clone so that we don't modify this instance during execution.
      var builder = this.clone();
      return Bluebird.try(function () {
        return beforeExecute(builder);
      }).then(function () {
        return doExecute(builder);
      }).then(function (result) {
        return afterExecute(builder, result);
      }).catch(function (error) {
        return handleExecuteError(builder, error);
      });
    }
  }, {
    key: "pluck",
    value: function pluck(propertyName) {
      return this.runAfter(function (result) {
        if (Array.isArray(result)) {
          return result.map(function (it) {
            return it && it[propertyName];
          });
        } else if (isObject(result)) {
          return result[propertyName];
        } else {
          return result;
        }
      });
    }
  }, {
    key: "throwIfNotFound",
    value: function throwIfNotFound() {
      var _this2 = this;

      return this.runAfter(function (result) {
        if (Array.isArray(result) && result.length === 0 || result === null || result === undefined || result === 0) {
          throw _this2.modelClass().createNotFoundError(_this2.context());
        } else {
          return result;
        }
      });
    }
  }, {
    key: "findSelection",
    value: function findSelection(selection) {
      var explicit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var noSelectStatements = true;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this._operations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var op = _step.value;

          if (op.constructor === SelectOperation) {
            var selectionInstance = op.findSelection(this, selection);
            noSelectStatements = false;

            if (selectionInstance) {
              return selectionInstance;
            }
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      if (noSelectStatements && !explicit) {
        var selectAll = new Selection(this.tableRef(), '*');

        if (Selection.doesSelect(this, selectAll, selection)) {
          return selectAll;
        } else {
          return null;
        }
      } else {
        return null;
      }
    }
  }, {
    key: "findAllSelections",
    value: function findAllSelections() {
      return this._operations.filter(function (op) {
        return op.is(SelectOperation);
      }).reduce(function (selects, op) {
        return selects.concat(op.selections);
      }, []);
    }
  }, {
    key: "hasSelection",
    value: function hasSelection(selection, explicit) {
      return this.findSelection(selection, explicit) !== null;
    }
  }, {
    key: "hasSelectionAs",
    value: function hasSelectionAs(selection, alias, explicit) {
      var select = this.findSelection(selection, explicit);
      return select !== null && (select.column === '*' || select.name === alias);
    }
  }, {
    key: "traverse",
    value: function traverse(modelClass, traverser) {
      var _this3 = this;

      if (typeof traverser === 'undefined') {
        traverser = modelClass;
        modelClass = null;
      }

      return this.runAfter(function (result) {
        _this3.resultModelClass().traverse(modelClass, result, traverser);

        return result;
      });
    }
  }, {
    key: "pick",
    value: function pick(modelClass, properties) {
      if (typeof properties === 'undefined') {
        properties = modelClass;
        modelClass = null;
      } // Turn the properties into a hash for performance.


      properties = properties.reduce(function (obj, prop) {
        obj[prop] = true;
        return obj;
      }, {});
      return this.traverse(modelClass, function (model) {
        model.$pick(properties);
      });
    }
  }, {
    key: "omit",
    value: function omit(modelClass, properties) {
      if (typeof properties === 'undefined') {
        properties = modelClass;
        modelClass = null;
      } // Turn the properties into a hash for performance.


      properties = properties.reduce(function (obj, prop) {
        obj[prop] = true;
        return obj;
      }, {});
      return this.traverse(modelClass, function (model) {
        model.$omit(properties);
      });
    }
  }, {
    key: "page",
    value: function page(_page, pageSize) {
      return this.range(+_page * +pageSize, (+_page + 1) * +pageSize - 1);
    }
  }, {
    key: "columnInfo",
    value: function columnInfo() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref$table = _ref.table,
          table = _ref$table === void 0 ? null : _ref$table;

      table = table || this.tableNameFor(this.modelClass().getTableName());
      var knex = this.knex();
      var tableParts = table.split('.');
      var columnInfoQuery = knex(last(tableParts)).columnInfo();

      if (tableParts.length > 1) {
        columnInfoQuery.withSchema(tableParts[0]);
      }

      if (this.internalOptions().debug) {
        columnInfoQuery.debug();
      }

      return columnInfoQuery;
    }
  }, {
    key: "withSchema",
    value: function withSchema(schema) {
      this.internalContext().onBuild.push(function (builder) {
        if (!builder.has(/withSchema/)) {
          // Need to push this operation to the front because knex doesn't use the
          // schema for operations called before `withSchema`.
          builder.addOperationToFront(new KnexOperation('withSchema'), [schema]);
        }
      });
      return this;
    }
  }, {
    key: "debug",
    value: function debug()
    /* istanbul ignore next */
    {
      this.internalOptions().debug = true;
      this.internalContext().onBuild.push(function (builder) {
        builder.addOperation(new KnexOperation('debug'), []);
      });
      return this;
    }
  }, {
    key: "insert",
    value: function insert(modelsOrObjects) {
      var _this4 = this;

      return writeOperation(this, function () {
        var insertOperation = _this4._insertOperationFactory(_this4);

        _this4.addOperation(insertOperation, [modelsOrObjects]);
      });
    }
  }, {
    key: "insertAndFetch",
    value: function insertAndFetch(modelsOrObjects) {
      var _this5 = this;

      return writeOperation(this, function () {
        var insertOperation = _this5._insertOperationFactory(_this5);

        var insertAndFetchOperation = new InsertAndFetchOperation('insertAndFetch', {
          delegate: insertOperation
        });

        _this5.addOperation(insertAndFetchOperation, [modelsOrObjects]);
      });
    }
  }, {
    key: "insertGraph",
    value: function insertGraph(modelsOrObjects, opt) {
      var _this6 = this;

      return writeOperation(this, function () {
        var insertOperation = _this6._insertOperationFactory(_this6);

        var insertGraphOperation = new InsertGraphOperation('insertGraph', {
          delegate: insertOperation,
          opt: opt
        });

        _this6.addOperation(insertGraphOperation, [modelsOrObjects]);
      });
    }
  }, {
    key: "insertWithRelated",
    value: function insertWithRelated() {
      return this.insertGraph.apply(this, arguments);
    }
  }, {
    key: "insertGraphAndFetch",
    value: function insertGraphAndFetch(modelsOrObjects, opt) {
      var _this7 = this;

      return writeOperation(this, function () {
        var insertOperation = _this7._insertOperationFactory(_this7);

        var insertGraphOperation = new InsertGraphOperation('insertGraph', {
          delegate: insertOperation,
          opt: opt
        });
        var insertGraphAndFetchOperation = new InsertGraphAndFetchOperation('insertGraphAndFetch', {
          delegate: insertGraphOperation
        });
        return _this7.addOperation(insertGraphAndFetchOperation, [modelsOrObjects]);
      });
    }
  }, {
    key: "insertWithRelatedAndFetch",
    value: function insertWithRelatedAndFetch() {
      return this.insertGraphAndFetch.apply(this, arguments);
    }
  }, {
    key: "update",
    value: function update(modelOrObject) {
      var _this8 = this;

      return writeOperation(this, function () {
        var updateOperation = _this8._updateOperationFactory(_this8);

        _this8.addOperation(updateOperation, [modelOrObject]);
      });
    }
  }, {
    key: "updateAndFetch",
    value: function updateAndFetch(modelOrObject) {
      var _this9 = this;

      return writeOperation(this, function () {
        var updateOperation = _this9._updateOperationFactory(_this9);

        if (!(updateOperation.instance instanceof _this9.modelClass())) {
          throw new Error('updateAndFetch can only be called for instance operations');
        }

        var updateAndFetch = new UpdateAndFetchOperation('updateAndFetch', {
          delegate: updateOperation
        }); // patchOperation is an instance update operation that already adds the
        // required "where id = $" clause.

        updateAndFetch.skipIdWhere = true;

        _this9.addOperation(updateAndFetch, [updateOperation.instance.$id(), modelOrObject]);
      });
    }
  }, {
    key: "updateAndFetchById",
    value: function updateAndFetchById(id, modelOrObject) {
      var _this10 = this;

      return writeOperation(this, function () {
        var updateOperation = _this10._updateOperationFactory(_this10);

        var updateAndFetch = new UpdateAndFetchOperation('updateAndFetch', {
          delegate: updateOperation
        });

        _this10.addOperation(updateAndFetch, [id, modelOrObject]);
      });
    }
  }, {
    key: "upsertGraph",
    value: function upsertGraph(modelsOrObjects, upsertOptions) {
      var _this11 = this;

      return writeOperation(this, function () {
        var upsertGraphOperation = new UpsertGraphOperation('upsertGraph', {
          upsertOptions: upsertOptions
        });

        _this11.addOperation(upsertGraphOperation, [modelsOrObjects]);
      });
    }
  }, {
    key: "upsertGraphAndFetch",
    value: function upsertGraphAndFetch(modelsOrObjects, upsertOptions) {
      var _this12 = this;

      return writeOperation(this, function () {
        var upsertGraphOperation = new UpsertGraphOperation('upsertGraph', {
          upsertOptions: upsertOptions
        });
        var upsertGraphAndFetchOperation = new UpsertGraphAndFetchOperation('upsertGraphAndFetch', {
          delegate: upsertGraphOperation
        });
        return _this12.addOperation(upsertGraphAndFetchOperation, [modelsOrObjects]);
      });
    }
  }, {
    key: "patch",
    value: function patch(modelOrObject) {
      var _this13 = this;

      return writeOperation(this, function () {
        var patchOperation = _this13._patchOperationFactory(_this13);

        _this13.addOperation(patchOperation, [modelOrObject]);
      });
    }
  }, {
    key: "patchAndFetch",
    value: function patchAndFetch(modelOrObject) {
      var _this14 = this;

      return writeOperation(this, function () {
        var patchOperation = _this14._patchOperationFactory(_this14);

        if (!(patchOperation.instance instanceof _this14.modelClass())) {
          throw new Error('patchAndFetch can only be called for instance operations');
        }

        var patchAndFetch = new UpdateAndFetchOperation('patchAndFetch', {
          delegate: patchOperation
        }); // patchOperation is an instance update operation that already adds the
        // required "where id = $" clause.

        patchAndFetch.skipIdWhere = true;

        _this14.addOperation(patchAndFetch, [patchOperation.instance.$id(), modelOrObject]);
      });
    }
  }, {
    key: "patchAndFetchById",
    value: function patchAndFetchById(id, modelOrObject) {
      var _this15 = this;

      return writeOperation(this, function () {
        var patchOperation = _this15._patchOperationFactory(_this15);

        var patchAndFetch = new UpdateAndFetchOperation('patchAndFetch', {
          delegate: patchOperation
        });

        _this15.addOperation(patchAndFetch, [id, modelOrObject]);
      });
    }
  }, {
    key: "delete",
    value: function _delete() {
      var _this16 = this,
          _arguments = arguments;

      return writeOperation(this, function () {
        if (_arguments.length) {
          throw new Error("Don't pass arguments to delete(). You should use it like this: delete().where('foo', 'bar').andWhere(...)");
        }

        var deleteOperation = _this16._deleteOperationFactory(_this16);

        _this16.addOperation(deleteOperation, _arguments);
      });
    }
  }, {
    key: "del",
    value: function del() {
      return this.delete.apply(this, arguments);
    }
  }, {
    key: "relate",
    value: function relate() {
      var _this17 = this,
          _arguments2 = arguments;

      return writeOperation(this, function () {
        var relateOperation = _this17._relateOperationFactory(_this17);

        _this17.addOperation(relateOperation, _arguments2);
      });
    }
  }, {
    key: "unrelate",
    value: function unrelate() {
      var _this18 = this,
          _arguments3 = arguments;

      return writeOperation(this, function () {
        if (_arguments3.length) {
          throw new Error("Don't pass arguments to unrelate(). You should use it like this: unrelate().where('foo', 'bar').andWhere(...)");
        }

        var unrelateOperation = _this18._unrelateOperationFactory(_this18);

        _this18.addOperation(unrelateOperation, _arguments3);
      });
    }
  }, {
    key: "increment",
    value: function increment(propertyName, howMuch) {
      var columnName = this.modelClass().propertyNameToColumnName(propertyName);
      return this.patch(_defineProperty({}, columnName, raw('?? + ?', [columnName, howMuch])));
    }
  }, {
    key: "decrement",
    value: function decrement(propertyName, howMuch) {
      var columnName = this.modelClass().propertyNameToColumnName(propertyName);
      return this.patch(_defineProperty({}, columnName, raw('?? - ?', [columnName, howMuch])));
    }
  }, {
    key: "findOne",
    value: function findOne() {
      return this.where.apply(this, arguments).first();
    }
  }, {
    key: "range",
    value: function range() {
      return this.addOperation(new RangeOperation('range'), arguments);
    }
  }, {
    key: "first",
    value: function first() {
      return this.addOperation(new FirstOperation('first'), arguments);
    }
  }, {
    key: "joinRelation",
    value: function joinRelation() {
      return this.addOperation(new JoinRelationOperation('joinRelation', {
        joinOperation: 'join'
      }), arguments);
    }
  }, {
    key: "innerJoinRelation",
    value: function innerJoinRelation() {
      return this.addOperation(new JoinRelationOperation('innerJoinRelation', {
        joinOperation: 'innerJoin'
      }), arguments);
    }
  }, {
    key: "outerJoinRelation",
    value: function outerJoinRelation() {
      return this.addOperation(new JoinRelationOperation('outerJoinRelation', {
        joinOperation: 'outerJoin'
      }), arguments);
    }
  }, {
    key: "leftJoinRelation",
    value: function leftJoinRelation() {
      return this.addOperation(new JoinRelationOperation('leftJoinRelation', {
        joinOperation: 'leftJoin'
      }), arguments);
    }
  }, {
    key: "leftOuterJoinRelation",
    value: function leftOuterJoinRelation() {
      return this.addOperation(new JoinRelationOperation('leftOuterJoinRelation', {
        joinOperation: 'leftOuterJoin'
      }), arguments);
    }
  }, {
    key: "rightJoinRelation",
    value: function rightJoinRelation() {
      return this.addOperation(new JoinRelationOperation('rightJoinRelation', {
        joinOperation: 'rightJoin'
      }), arguments);
    }
  }, {
    key: "rightOuterJoinRelation",
    value: function rightOuterJoinRelation() {
      return this.addOperation(new JoinRelationOperation('rightOuterJoinRelation', {
        joinOperation: 'rightOuterJoin'
      }), arguments);
    }
  }, {
    key: "fullOuterJoinRelation",
    value: function fullOuterJoinRelation() {
      return this.addOperation(new JoinRelationOperation('fullOuterJoinRelation', {
        joinOperation: 'fullOuterJoin'
      }), arguments);
    }
  }, {
    key: "deleteById",
    value: function deleteById() {
      return this.addOperation(new DeleteByIdOperation('deleteById'), arguments);
    }
  }, {
    key: "findById",
    value: function findById() {
      return this.addOperation(new FindByIdOperation('findById'), arguments);
    }
  }, {
    key: "findByIds",
    value: function findByIds() {
      return this.addOperation(new FindByIdsOperation('findByIds'), arguments);
    }
  }, {
    key: "runBefore",
    value: function runBefore() {
      return this.addOperation(new RunBeforeOperation('runBefore'), arguments);
    }
  }, {
    key: "onBuild",
    value: function onBuild() {
      return this.addOperation(new OnBuildOperation('onBuild'), arguments);
    }
  }, {
    key: "onBuildKnex",
    value: function onBuildKnex() {
      return this.addOperation(new OnBuildKnexOperation('onBuildKnex'), arguments);
    }
  }, {
    key: "runAfter",
    value: function runAfter() {
      return this.addOperation(new RunAfterOperation('runAfter'), arguments);
    }
  }, {
    key: "onError",
    value: function onError() {
      return this.addOperation(new OnErrorOperation('onError'), arguments);
    }
  }, {
    key: "from",
    value: function from() {
      return this.addOperation(new FromOperation('from'), arguments);
    }
  }, {
    key: "table",
    value: function table() {
      return this.addOperation(new FromOperation('table'), arguments);
    }
  }], [{
    key: "forClass",
    value: function forClass(modelClass) {
      return new this(modelClass);
    }
  }, {
    key: "QueryBuilderContext",
    get: function get() {
      return QueryBuilderContext;
    }
  }]);

  return QueryBuilder;
}(QueryBuilderBase);

Object.defineProperties(QueryBuilder.prototype, {
  isObjectionQueryBuilder: {
    enumerable: false,
    writable: false,
    value: true
  }
});

function getTableName(modelClassOrTableName) {
  if (isString(modelClassOrTableName)) {
    return modelClassOrTableName;
  } else {
    return modelClassOrTableName.getTableName();
  }
}

function parseRelationExpression(modelClass, exp) {
  try {
    return RelationExpression.create(exp);
  } catch (err) {
    if (err instanceof DuplicateRelationError) {
      throw modelClass.createValidationError({
        type: ValidationErrorType.RelationExpression,
        message: "Duplicate relation name \"".concat(err.relationName, "\" in relation expression \"").concat(exp, "\". Use \"a.[b, c]\" instead of \"[a.b, a.c]\".")
      });
    } else {
      throw modelClass.createValidationError({
        type: ValidationErrorType.RelationExpression,
        message: "Invalid relation expression \"".concat(exp, "\"")
      });
    }
  }
}

function checkEager(builder) {
  var expr = builder._eagerExpression;
  var allowedExpr = builder._allowedEagerExpression;

  if (expr && allowedExpr && !allowedExpr.isSubExpression(expr)) {
    var modelClass = builder.modelClass();
    builder.reject(modelClass.createValidationError({
      type: ValidationErrorType.UnallowedRelation,
      message: 'eager expression not allowed'
    }));
  }
}

function findQueryExecutorOperation(builder) {
  for (var i = 0, l = builder._operations.length; i < l; ++i) {
    var op = builder._operations[i];

    if (op.hasQueryExecutor()) {
      return op;
    }
  }

  return null;
}

function beforeExecute(builder) {
  var promise = Promise.resolve();

  if (builder.isFind()) {
    // If no write operations have been called at this point this query is a
    // find query and we need to call the custom find implementation.
    addFindOperation(builder);
  }

  if (builder.hasEager()) {
    // If the query is an eager query, add the eager operation only at
    // this point of the query execution.
    addEagerFetchOperation(builder);
  } // Resolve all before hooks before building and executing the query
  // and the rest of the hooks.


  builder._operations.forEach(function (op) {
    if (op.hasOnBefore1()) {
      promise = promise.then(function (result) {
        return op.onBefore1(builder, result);
      });
    }
  });

  promise = chainHooks(promise, builder, builder.context().runBefore);
  promise = chainHooks(promise, builder, builder.internalContext().runBefore);

  builder._operations.forEach(function (op) {
    if (op.hasOnBefore2()) {
      promise = promise.then(function (result) {
        return op.onBefore2(builder, result);
      });
    }
  });

  builder._operations.forEach(function (op) {
    if (op.hasOnBefore3()) {
      promise = promise.then(function (result) {
        return op.onBefore3(builder, result);
      });
    }
  });

  return promise;
}

function doExecute(builder) {
  var promise = Promise.resolve();
  var knexBuilder = buildInto(builder, builder.knex().queryBuilder());
  var queryExecutorOperation = findQueryExecutorOperation(builder);
  var explicitRejectValue = builder._explicitRejectValue;
  var explicitResolveValue = builder._explicitResolveValue;

  if (explicitRejectValue !== null) {
    promise = Promise.reject(explicitRejectValue);
  } else if (explicitResolveValue !== null) {
    promise = Promise.resolve(explicitResolveValue);
  } else if (queryExecutorOperation !== null) {
    promise = Promise.resolve(queryExecutorOperation.queryExecutor(builder));
  } else {
    promise = Promise.resolve(knexBuilder);

    builder._operations.forEach(function (op) {
      if (op.hasOnRawResult()) {
        promise = promise.then(function (result) {
          return op.onRawResult(builder, result);
        });
      }
    });

    promise = promise.then(function (result) {
      return createModels(result, builder);
    });
  }

  return promise;
}

function afterExecute(builder, result) {
  var promise = Promise.resolve(result);

  builder._operations.forEach(function (op) {
    if (op.hasOnAfter1()) {
      promise = promise.then(function (result) {
        return op.onAfter1(builder, result);
      });
    }
  });

  builder._operations.forEach(function (op) {
    if (op.hasOnAfter2()) {
      promise = promise.then(function (result) {
        return op.onAfter2(builder, result);
      });
    }
  });

  promise = chainHooks(promise, builder, builder.context().runAfter);
  promise = chainHooks(promise, builder, builder.internalContext().runAfter);

  builder._operations.forEach(function (op) {
    if (op.hasOnAfter3()) {
      promise = promise.then(function (result) {
        return op.onAfter3(builder, result);
      });
    }
  });

  return promise;
}

function handleExecuteError(builder, err) {
  var promise = Promise.reject(err);

  builder._operations.forEach(function (op) {
    if (op.hasOnError()) {
      promise = promise.catch(function (err) {
        return op.onError(builder, err);
      });
    }
  });

  return promise;
}

function addFindOperation(builder) {
  if (!builder.has(FindOperation)) {
    var operation = builder._findOperationFactory(builder);

    builder.addOperationToFront(operation, []);
  }
}

function addEagerFetchOperation(builder) {
  if (!builder.has(EagerOperation) && builder._eagerExpression) {
    var operation = builder._eagerOperationFactory(builder);

    var expression = builder._eagerExpression.clone();

    var modifiers = Object.assign({}, builder._eagerModifiers);

    builder._eagerModifiersAtPath.forEach(function (modifier, i) {
      var modifierName = "_f".concat(i, "_");
      expression.expressionsAtPath(modifier.path).forEach(function (expr) {
        expr.rawNode.$modify.push(modifierName);
      });
      modifiers[modifierName] = modifier.modifier;
    });

    builder.addOperation(operation, [expression, modifiers]);
  }
}

function buildInto(builder, knexBuilder) {
  callOnBuildHooks(builder, builder.context().onBuild);
  callOnBuildHooks(builder, builder.internalContext().onBuild); // Call super class build.

  knexBuilder = builder.buildInto(knexBuilder);
  var fromOperation = builder.findLastOperation(QueryBuilderBase.FromSelector);
  var hasSelects = builder.has(QueryBuilderBase.SelectSelector); // Set the table only if it hasn't been explicitly set yet.

  if (!builder.isPartialQuery() && !fromOperation) {
    setDefaultTable(builder, knexBuilder);
  } // Only add `table.*` select if there are no explicit selects
  // and `from` is a table name and not a subquery.


  if (!builder.isPartialQuery() && !hasSelects && (!fromOperation || fromOperation.table)) {
    setDefaultSelect(builder, knexBuilder);
  }

  return knexBuilder;
}

function callOnBuildHooks(builder, func) {
  if (isFunction(func)) {
    func.call(builder, builder);
  } else if (Array.isArray(func)) {
    func.forEach(function (func) {
      return callOnBuildHooks(builder, func);
    });
  }
}

function setDefaultTable(builder, knexBuilder) {
  var table = builder.tableNameFor(builder.modelClass().getTableName());
  var tableRef = builder.tableRef();

  if (table === tableRef) {
    knexBuilder.table(table);
  } else {
    knexBuilder.table("".concat(table, " as ").concat(tableRef));
  }
}

function setDefaultSelect(builder, knexBuilder) {
  var tableRef = builder.tableRef();
  knexBuilder.select("".concat(tableRef, ".*"));
}

function chainHooks(promise, builder, func) {
  if (isFunction(func)) {
    promise = promise.then(function (result) {
      return func.call(builder, result, builder);
    });
  } else if (Array.isArray(func)) {
    func.forEach(function (func) {
      promise = chainHooks(promise, builder, func);
    });
  }

  return promise;
}

function createModels(result, builder) {
  var modelClass = builder.resultModelClass();

  if (result === null || result === undefined) {
    return null;
  }

  if (Array.isArray(result)) {
    if (result.length && shouldBeConvertedToModel(result[0], modelClass)) {
      for (var i = 0, l = result.length; i < l; ++i) {
        result[i] = modelClass.fromDatabaseJson(result[i]);
      }
    }
  } else if (shouldBeConvertedToModel(result, modelClass)) {
    result = modelClass.fromDatabaseJson(result);
  }

  return result;
}

function shouldBeConvertedToModel(obj, modelClass) {
  return isObject(obj) && !(obj instanceof modelClass);
}

function writeOperation(builder, cb) {
  if (!builder.isFind()) {
    return builder.reject(new Error('Double call to a write method. ' + 'You can only call one of the write methods ' + '(insert, update, patch, delete, relate, unrelate, increment, decrement) ' + 'and only once per query builder.'));
  }

  try {
    cb();
    return builder;
  } catch (err) {
    return builder.reject(err);
  }
}

function findOperationFactory() {
  return new FindOperation('find');
}

function insertOperationFactory() {
  return new InsertOperation('insert');
}

function updateOperationFactory() {
  return new UpdateOperation('update');
}

function patchOperationFactory() {
  return new UpdateOperation('patch', {
    modelOptions: {
      patch: true
    }
  });
}

function relateOperationFactory() {
  return new RelateOperation('relate', {});
}

function unrelateOperationFactory() {
  return new UnrelateOperation('unrelate', {});
}

function deleteOperationFactory() {
  return new DeleteOperation('delete');
}

module.exports = QueryBuilder;