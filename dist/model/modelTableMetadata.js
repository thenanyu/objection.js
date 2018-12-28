'use strict';

var _require = require('./modelUtils'),
    defineNonEnumerableProperty = _require.defineNonEnumerableProperty;

var _require2 = require('../utils/promiseUtils'),
    isPromise = _require2.isPromise;

var TABLE_METADATA = '$$tableMetadata';

function fetchTableMetadata(modelClass) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$parentBuilder = _ref.parentBuilder,
      parentBuilder = _ref$parentBuilder === void 0 ? null : _ref$parentBuilder,
      _ref$knex = _ref.knex,
      knex = _ref$knex === void 0 ? null : _ref$knex,
      _ref$force = _ref.force,
      force = _ref$force === void 0 ? false : _ref$force,
      _ref$table = _ref.table,
      table = _ref$table === void 0 ? null : _ref$table;

  // The table isn't necessarily same as `modelClass.getTableName()` for example if
  // a view is queried instead.
  if (!table) {
    if (parentBuilder) {
      table = parentBuilder.tableNameFor(modelClass.getTableName());
    } else {
      table = modelClass.getTableName();
    }
  } // Call tableMetadata first instead of accessing the cache directly beause
  // tableMetadata may have been overriden.


  var metadata = modelClass.tableMetadata({
    table: table
  });

  if (!force && metadata) {
    return Promise.resolve(metadata);
  } // Memoize metadata but only for modelClass. The hasOwnProperty check
  // will fail for subclasses and the value gets recreated.


  if (!modelClass.hasOwnProperty(TABLE_METADATA)) {
    defineNonEnumerableProperty(modelClass, TABLE_METADATA, new Map());
  } // The cache needs to be checked in addition to calling tableMetadata
  // because the cache may contain a temporary promise in which case
  // tableMetadata returns null.


  metadata = modelClass[TABLE_METADATA].get(table);

  if (!force && metadata) {
    return Promise.resolve(metadata);
  } else {
    var promise = modelClass.query(knex).childQueryOf(parentBuilder).columnInfo({
      table: table
    }).then(function (columnInfo) {
      var metadata = {
        columns: Object.keys(columnInfo)
      };
      modelClass[TABLE_METADATA].set(table, metadata);
      return metadata;
    });
    modelClass[TABLE_METADATA].set(table, promise);
    return promise;
  }
}

function tableMetadata(modelClass) {
  var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      table = _ref2.table;

  if (modelClass.hasOwnProperty(TABLE_METADATA)) {
    var metadata = modelClass[TABLE_METADATA].get(table || modelClass.getTableName());

    if (isPromise(metadata)) {
      return null;
    } else {
      return metadata;
    }
  } else {
    return null;
  }
}

module.exports = {
  fetchTableMetadata: fetchTableMetadata,
  tableMetadata: tableMetadata
};