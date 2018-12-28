'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _require = require('../utils/objectUtils'),
    isString = _require.isString,
    isFunction = _require.isFunction,
    isRegExp = _require.isRegExp,
    mergeMaps = _require.mergeMaps;

var _require2 = require('../utils/classUtils'),
    isSubclassOf = _require2.isSubclassOf;

var QueryBuilderOperation = require('./operations/QueryBuilderOperation');

var QueryBuilderContextBase = require('./QueryBuilderContextBase');

var QueryBuilderUserContext = require('./QueryBuilderUserContext');

var SelectSelector = /^(select|columns|column|distinct|count|countDistinct|min|max|sum|sumDistinct|avg|avgDistinct)$/;
var WhereSelector = /^(where|orWhere|andWhere)/;
var OnSelector = /^(on|orOn|andOn)/;
var OrderBySelector = /orderBy/;
var JoinSelector = /(join|joinRaw)$/i;
var FromSelector = /^(from|into|table)$/;

var QueryBuilderOperationSupport =
/*#__PURE__*/
function () {
  function QueryBuilderOperationSupport(knex) {
    _classCallCheck(this, QueryBuilderOperationSupport);

    this._knex = knex;
    this._operations = [];
    this._context = new this.constructor.QueryBuilderContext(this);
    this._parentQuery = null;
    this._isPartialQuery = false;
  }

  _createClass(QueryBuilderOperationSupport, [{
    key: "clearSelect",
    value: function clearSelect() {
      return this.clear(SelectSelector);
    }
  }, {
    key: "clearWhere",
    value: function clearWhere() {
      return this.clear(WhereSelector);
    }
  }, {
    key: "clearOrder",
    value: function clearOrder() {
      return this.clear(OrderBySelector);
    }
  }, {
    key: "context",
    value: function context(obj) {
      var ctx = this._context;

      if (arguments.length === 0) {
        return ctx.userContext;
      } else {
        ctx.userContext = ctx.userContext.newFromObject(this, obj);
        return this;
      }
    }
  }, {
    key: "mergeContext",
    value: function mergeContext(obj) {
      var ctx = this._context;
      ctx.userContext = ctx.userContext.newMerge(this, obj);
      return this;
    }
  }, {
    key: "internalContext",
    value: function internalContext(ctx) {
      if (arguments.length === 0) {
        return this._context;
      } else {
        this._context = ctx;
        return this;
      }
    }
  }, {
    key: "internalOptions",
    value: function internalOptions(opt) {
      if (arguments.length === 0) {
        return this._context.options;
      } else {
        var oldOpt = this._context.options;
        this._context.options = Object.assign(oldOpt, opt);
        return this;
      }
    }
  }, {
    key: "isPartialQuery",
    value: function isPartialQuery(_isPartialQuery) {
      if (arguments.length === 0) {
        return this._isPartialQuery;
      } else {
        this._isPartialQuery = _isPartialQuery;
        return this;
      }
    }
  }, {
    key: "isInternal",
    value: function isInternal() {
      return this.internalOptions().isInternalQuery;
    }
  }, {
    key: "tableNameFor",
    value: function tableNameFor(tableName, newTableName) {
      var ctx = this.internalContext();
      var tableMap = ctx.tableMap;

      if (isString(newTableName)) {
        ctx.tableMap = tableMap || new Map();
        ctx.tableMap.set(tableName, newTableName);
        return this;
      } else {
        return tableMap && tableMap.get(tableName) || tableName;
      }
    }
  }, {
    key: "aliasFor",
    value: function aliasFor(tableName, alias) {
      var ctx = this.internalContext();
      var aliasMap = ctx.aliasMap;

      if (isString(alias)) {
        ctx.aliasMap = aliasMap || new Map();
        ctx.aliasMap.set(tableName, alias);
        return this;
      } else {
        return aliasMap && aliasMap.get(tableName) || null;
      }
    }
  }, {
    key: "tableRefFor",
    value: function tableRefFor(tableName) {
      return this.aliasFor(tableName) || this.tableNameFor(tableName);
    }
  }, {
    key: "childQueryOf",
    value: function childQueryOf(query) {
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          fork = _ref.fork,
          isInternalQuery = _ref.isInternalQuery;

      if (query) {
        var ctx = query.internalContext();

        if (fork) {
          ctx = ctx.clone();
        }

        if (isInternalQuery) {
          ctx.options.isInternalQuery = true;
        }

        this._parentQuery = query;
        this.internalContext(ctx); // Use the parent's knex if there was no knex in `ctx`.

        if (this.unsafeKnex() === null) {
          this.knex(query.unsafeKnex());
        }
      }

      return this;
    }
  }, {
    key: "subqueryOf",
    value: function subqueryOf(query) {
      if (query) {
        var ctx = this.internalContext(); // Merge alias and table name maps for subqueries.

        ctx.aliasMap = mergeMaps(query.internalContext().aliasMap, ctx.aliasMap);
        ctx.tableMap = mergeMaps(query.internalContext().tableMap, ctx.tableMap);
        this._parentQuery = query;

        if (this.unsafeKnex() === null) {
          this.knex(query.unsafeKnex());
        }
      }

      return this;
    }
  }, {
    key: "parentQuery",
    value: function parentQuery() {
      return this._parentQuery;
    }
  }, {
    key: "knex",
    value: function knex() {
      if (arguments.length === 0) {
        var knex = this.unsafeKnex();

        if (!knex) {
          throw new Error("no database connection available for a query. You need to bind the model class or the query to a knex instance.");
        }

        return knex;
      } else {
        this._knex = arguments[0];
        return this;
      }
    }
  }, {
    key: "unsafeKnex",
    value: function unsafeKnex() {
      return this._context.knex || this._knex || null;
    }
  }, {
    key: "clear",
    value: function clear(operationSelector) {
      var operations = [];
      this.forEachOperation(operationSelector, function (op) {
        operations.push(op);
      }, false);
      this._operations = operations;
      return this;
    }
  }, {
    key: "copyFrom",
    value: function copyFrom(queryBuilder, operationSelector) {
      var operations = this._operations;
      queryBuilder.forEachOperation(operationSelector, function (op) {
        operations.push(op);
      });
      return this;
    }
  }, {
    key: "has",
    value: function has(operationSelector) {
      return this.indexOfOperation(operationSelector) !== -1;
    }
  }, {
    key: "indexOfOperation",
    value: function indexOfOperation(operationSelector) {
      var idx = -1;
      this.forEachOperation(operationSelector, function (op, i) {
        idx = i;
        return false;
      });
      return idx;
    }
  }, {
    key: "indexOfLastOperation",
    value: function indexOfLastOperation(operationSelector) {
      var idx = -1;
      this.forEachOperation(operationSelector, function (op, i) {
        idx = i;
      });
      return idx;
    }
  }, {
    key: "findLastOperation",
    value: function findLastOperation(operationSelector) {
      var idx = this.indexOfLastOperation(operationSelector);

      if (idx !== -1) {
        return this._operations[idx];
      } else {
        return null;
      }
    }
  }, {
    key: "forEachOperation",
    value: function forEachOperation(operationSelector, callback, match) {
      match = match == null ? true : match;
      var check;

      if (isRegExp(operationSelector)) {
        check = function check(op) {
          return operationSelector.test(op.name);
        };
      } else if (isString(operationSelector)) {
        check = function check(op) {
          return op.name === operationSelector;
        };
      } else if (isSubclassOf(operationSelector, QueryBuilderOperation)) {
        check = function check(op) {
          return op.is(operationSelector);
        };
      } else if (isFunction(operationSelector)) {
        check = operationSelector;
      }

      for (var i = 0, l = this._operations.length; i < l; ++i) {
        var op = this._operations[i];

        if (check(op) === match) {
          if (callback(op, i) === false) {
            break;
          }
        }
      }

      return this;
    }
  }, {
    key: "addOperation",
    value: function addOperation(operation, args) {
      var shouldAdd = operation.onAdd(this, args);

      if (shouldAdd) {
        this._operations.push(operation);
      }

      return this;
    }
  }, {
    key: "addOperationToFront",
    value: function addOperationToFront(operation, args) {
      var shouldAdd = operation.onAdd(this, args);

      if (shouldAdd) {
        this._operations.unshift(operation);
      }

      return this;
    }
  }, {
    key: "clone",
    value: function clone() {
      return this.baseCloneInto(new this.constructor(this.unsafeKnex()));
    }
  }, {
    key: "baseCloneInto",
    value: function baseCloneInto(builder) {
      builder._knex = this._knex;
      builder._operations = this._operations.slice();
      builder._context = this._context.clone();
      builder._parentQuery = this._parentQuery;
      builder._isPartialQuery = this._isPartialQuery;
      return builder;
    }
  }, {
    key: "build",
    value: function build() {
      return this.buildInto(this.knex().queryBuilder());
    }
  }, {
    key: "buildInto",
    value: function buildInto(knexBuilder) {
      this.executeOnBuild(); // onBuildKnex operations should never add new operations. They should only call
      // methods on the knex query builder.

      for (var i = 0, l = this._operations.length; i < l; ++i) {
        this._operations[i].onBuildKnex(knexBuilder, this);

        if (this._operations.length !== l) {
          throw new Error('onBuildKnex should only call query building methods on the knex builder');
        }
      }

      return knexBuilder;
    }
  }, {
    key: "executeOnBuild",
    value: function executeOnBuild() {
      var operationSet = new Set();

      for (var _i = 0; _i < this._operations.length; ++_i) {
        operationSet.add(this._operations[_i]);
      }

      var i = 0;

      while (i < this._operations.length) {
        var iOp = this._operations[i];
        var newOps = [];
        iOp.onBuild(this);

        for (var j = 0; j < this._operations.length; ++j) {
          var jOp = this._operations[j]; // onBuild may have removed operations before `op`.
          // We need to update the index.

          if (iOp === jOp) {
            i = j;
          }

          if (!operationSet.has(jOp)) {
            // New operation was added.
            newOps.push(jOp);
            operationSet.add(jOp);
          }
        }

        if (newOps.length !== 0) {
          // Make room for the new operations after the current operation.
          for (var _j = this._operations.length - 1; _j > i + newOps.length; --_j) {
            this._operations[_j] = this._operations[_j - newOps.length];
          } // Move the new operations after the current operation.


          for (var _j2 = 0; _j2 < newOps.length; ++_j2) {
            this._operations[i + _j2 + 1] = newOps[_j2];
          }
        }

        ++i;
      }
    }
  }, {
    key: "toString",
    value: function toString() {
      return this.build().toString();
    }
  }, {
    key: "toSql",
    value: function toSql() {
      return this.toString();
    }
  }, {
    key: "skipUndefined",
    value: function skipUndefined() {
      this._context.options.skipUndefined = true;
      return this;
    }
  }], [{
    key: "QueryBuilderContext",
    get: function get() {
      return QueryBuilderContextBase;
    }
  }, {
    key: "QueryBuilderUserContext",
    get: function get() {
      return QueryBuilderUserContext;
    }
  }, {
    key: "SelectSelector",
    get: function get() {
      return SelectSelector;
    }
  }, {
    key: "WhereSelector",
    get: function get() {
      return WhereSelector;
    }
  }, {
    key: "OnSelector",
    get: function get() {
      return OnSelector;
    }
  }, {
    key: "JoinSelector",
    get: function get() {
      return JoinSelector;
    }
  }, {
    key: "FromSelector",
    get: function get() {
      return FromSelector;
    }
  }, {
    key: "OrderBySelector",
    get: function get() {
      return OrderBySelector;
    }
  }]);

  return QueryBuilderOperationSupport;
}();

module.exports = QueryBuilderOperationSupport;