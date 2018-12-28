'use strict'; // An abstract base class for all query builder operations. QueryBuilderOperations almost always
// correspond to a single query builder method call. For example SelectOperation could be added when
// a `select` method is called.
//
// QueryBuilderOperation is just a bunch of query execution lifecycle hooks that subclasses
// can (but don't have to) implement.
//
// Basically a query builder is nothing but an array of QueryBuilderOperations. When the query is
// executed the hooks are called in the order explained below. The hooks are called so that a
// certain hook is called for _all_ operations before the next hook is called. For example if
// a builder has 5 operations, onBefore1 hook is called for each of them (and their results are awaited)
// before onBefore2 hook is called for any of the operations.

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var QueryBuilderOperation =
/*#__PURE__*/
function () {
  function QueryBuilderOperation(name, opt) {
    _classCallCheck(this, QueryBuilderOperation);

    this.name = name;
    this.opt = opt || {};
  }

  _createClass(QueryBuilderOperation, [{
    key: "is",
    value: function is(OperationClass) {
      return this instanceof OperationClass;
    } // This is called immediately when a query builder method is called.
    //
    // This method must be synchronous.
    // This method should never call any methods that add operations to the builder.

  }, {
    key: "onAdd",
    value: function onAdd(builder, args) {
      return true;
    } // This is called as the first thing when the query is executed but before
    // the actual database operation (knex query) is executed.
    //
    // This method can be asynchronous.
    // You may call methods that add operations to to the builder.

  }, {
    key: "onBefore1",
    value: function onBefore1(builder, result) {}
  }, {
    key: "hasOnBefore1",
    value: function hasOnBefore1() {
      return this.onBefore1 !== QueryBuilderOperation.prototype.onBefore1;
    } // This is called as the second thing when the query is executed but before
    // the actual database operation (knex query) is executed.
    //
    // This method can be asynchronous.
    // You may call methods that add operations to to the builder.

  }, {
    key: "onBefore2",
    value: function onBefore2(builder, result) {}
  }, {
    key: "hasOnBefore2",
    value: function hasOnBefore2() {
      return this.onBefore2 !== QueryBuilderOperation.prototype.onBefore2;
    } // This is called as the third thing when the query is executed but before
    // the actual database operation (knex query) is executed.
    //
    // This method can be asynchronous.
    // You may call methods that add operations to to the builder.

  }, {
    key: "onBefore3",
    value: function onBefore3(builder, result) {}
  }, {
    key: "hasOnBefore3",
    value: function hasOnBefore3() {
      return this.onBefore3 !== QueryBuilderOperation.prototype.onBefore3;
    } // This is called as the last thing when the query is executed but before
    // the actual database operation (knex query) is executed. If your operation
    // needs to call other query building operations (methods that add QueryBuilderOperations)
    // this is the best and last place to do it.
    //
    // This method must be synchronous.
    // You may call methods that add operations to to the builder.

  }, {
    key: "onBuild",
    value: function onBuild(builder) {}
  }, {
    key: "hasOnBuild",
    value: function hasOnBuild() {
      return this.onBuild !== QueryBuilderOperation.prototype.onBuild;
    } // This is called when the knex query is built. Here you should only call knex
    // methods. You may call getters and other immutable methods of the `builder`
    // but you should never call methods that add QueryBuilderOperations.
    //
    // This method must be synchronous.
    // This method should never call any methods that add operations to the builder.

  }, {
    key: "onBuildKnex",
    value: function onBuildKnex(knexBuilder, builder) {}
  }, {
    key: "hasOnBuildKnex",
    value: function hasOnBuildKnex() {
      return this.onBuildKnex !== QueryBuilderOperation.prototype.onBuildKnex;
    } // The raw knex result is passed to this method right after the database query
    // has finished. This method may modify it and return the modified rows. The
    // rows are automatically converted to models (if possible) after this hook
    // is called.
    //
    // This method can be asynchronous.

  }, {
    key: "onRawResult",
    value: function onRawResult(builder, rows) {
      return rows;
    }
  }, {
    key: "hasOnRawResult",
    value: function hasOnRawResult() {
      return this.onRawResult !== QueryBuilderOperation.prototype.onRawResult;
    } // This is called as the first thing after the query has been executed and
    // rows have been converted to model instances.
    //
    // This method can be asynchronous.

  }, {
    key: "onAfter1",
    value: function onAfter1(builder, result) {
      return result;
    }
  }, {
    key: "hasOnAfter1",
    value: function hasOnAfter1() {
      return this.onAfter1 !== QueryBuilderOperation.prototype.onAfter1;
    } // This is called as the second thing after the query has been executed and
    // rows have been converted to model instances.
    //
    // This method can be asynchronous.

  }, {
    key: "onAfter2",
    value: function onAfter2(builder, result) {
      return result;
    }
  }, {
    key: "hasOnAfter2",
    value: function hasOnAfter2() {
      return this.onAfter2 !== QueryBuilderOperation.prototype.onAfter2;
    } // This is called as the third thing after the query has been executed and
    // rows have been converted to model instances.
    //
    // This method can be asynchronous.

  }, {
    key: "onAfter3",
    value: function onAfter3(builder, result) {
      return result;
    }
  }, {
    key: "hasOnAfter3",
    value: function hasOnAfter3() {
      return this.onAfter3 !== QueryBuilderOperation.prototype.onAfter3;
    } // This method can be implemented to return another operation that will replace
    // this one. This method is called after all `onBeforeX` and `onBuildX` hooks
    // but before the database query is executed.
    //
    // This method must return a QueryBuilder instance.

  }, {
    key: "queryExecutor",
    value: function queryExecutor(builder) {}
  }, {
    key: "hasQueryExecutor",
    value: function hasQueryExecutor() {
      return this.queryExecutor !== QueryBuilderOperation.prototype.queryExecutor;
    } // This is called if an error occurs in the query execution.
    //
    // This method must return a QueryBuilder instance.

  }, {
    key: "onError",
    value: function onError(builder, error) {}
  }, {
    key: "hasOnError",
    value: function hasOnError() {
      return this.onError !== QueryBuilderOperation.prototype.onError;
    }
  }]);

  return QueryBuilderOperation;
}();

module.exports = QueryBuilderOperation;