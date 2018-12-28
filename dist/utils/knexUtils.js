'use strict';

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _require = require('../utils/objectUtils'),
    isObject = _require.isObject,
    isFunction = _require.isFunction;

function getDialect(knex) {
  var type = _typeof(knex);

  return knex !== null && (type === 'object' || type === 'function') && knex.client && knex.client.dialect || null;
}

function isPostgres(knex) {
  return getDialect(knex) === 'postgresql';
}

function isMySql(knex) {
  return getDialect(knex) === 'mysql';
}

function isSqlite(knex) {
  return getDialect(knex) === 'sqlite3';
}

function isMsSql(knex) {
  return getDialect(knex) === 'mssql';
}

function isKnexQueryBuilder(value) {
  return hasConstructor(value, 'Builder') && 'client' in value;
}

function isKnexJoinBuilder(value) {
  return hasConstructor(value, 'JoinClause') && 'joinType' in value;
}

function isKnexRaw(value) {
  return hasConstructor(value, 'Raw') && 'client' in value;
}

function isKnexTransaction(knex) {
  return !!getDialect(knex) && isFunction(knex.commit) && isFunction(knex.rollback);
}

function hasConstructor(value, constructorName) {
  return isObject(value) && isFunction(value.constructor) && value.constructor.name === constructorName;
}

module.exports = {
  getDialect: getDialect,
  isPostgres: isPostgres,
  isMySql: isMySql,
  isSqlite: isSqlite,
  isMsSql: isMsSql,
  isKnexQueryBuilder: isKnexQueryBuilder,
  isKnexJoinBuilder: isKnexJoinBuilder,
  isKnexRaw: isKnexRaw,
  isKnexTransaction: isKnexTransaction
};