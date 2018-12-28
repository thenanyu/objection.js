'use strict';

var Model = require('./model/Model');

var QueryBuilder = require('./queryBuilder/QueryBuilder');

var QueryBuilderBase = require('./queryBuilder/QueryBuilderBase');

var QueryBuilderOperation = require('./queryBuilder/operations/QueryBuilderOperation');

var RelationExpression = require('./queryBuilder/RelationExpression').RelationExpression;

var ValidationError = require('./model/ValidationError');

var NotFoundError = require('./model/NotFoundError');

var AjvValidator = require('./model/AjvValidator');

var Validator = require('./model/Validator');

var Relation = require('./relations/Relation');

var HasOneRelation = require('./relations/hasOne/HasOneRelation');

var HasManyRelation = require('./relations/hasMany/HasManyRelation');

var BelongsToOneRelation = require('./relations/belongsToOne/BelongsToOneRelation');

var HasOneThroughRelation = require('./relations/hasOneThrough/HasOneThroughRelation');

var ManyToManyRelation = require('./relations/manyToMany/ManyToManyRelation');

var transaction = require('./transaction');

var _require = require('./utils/identifierMapping'),
    snakeCaseMappers = _require.snakeCaseMappers,
    knexSnakeCaseMappers = _require.knexSnakeCaseMappers,
    knexIdentifierMapping = _require.knexIdentifierMapping;

var _require2 = require('./utils/mixin'),
    compose = _require2.compose,
    mixin = _require2.mixin;

var _require3 = require('./queryBuilder/ReferenceBuilder'),
    ref = _require3.ref;

var _require4 = require('./queryBuilder/LiteralBuilder'),
    lit = _require4.lit;

var _require5 = require('./queryBuilder/RawBuilder'),
    raw = _require5.raw;

module.exports = {
  Model: Model,
  QueryBuilder: QueryBuilder,
  QueryBuilderBase: QueryBuilderBase,
  QueryBuilderOperation: QueryBuilderOperation,
  RelationExpression: RelationExpression,
  ValidationError: ValidationError,
  NotFoundError: NotFoundError,
  AjvValidator: AjvValidator,
  Validator: Validator,
  Relation: Relation,
  HasOneRelation: HasOneRelation,
  HasManyRelation: HasManyRelation,
  BelongsToOneRelation: BelongsToOneRelation,
  HasOneThroughRelation: HasOneThroughRelation,
  ManyToManyRelation: ManyToManyRelation,
  transaction: transaction,
  compose: compose,
  mixin: mixin,
  ref: ref,
  lit: lit,
  raw: raw,
  snakeCaseMappers: snakeCaseMappers,
  knexSnakeCaseMappers: knexSnakeCaseMappers,
  knexIdentifierMapping: knexIdentifierMapping
};
Object.defineProperties(module.exports, {
  Promise: {
    enumerable: true,
    get: function get() {
      console.log('objection.Promise is deprecated and will be removed in 2.0.0. Bluebird dependency will be removed in 2.0.0.');
      return require('bluebird');
    }
  },
  lodash: {
    enumerable: true,
    get: function get() {
      console.log('objection.lodash is deprecated and will be removed in 2.0.0. lodash dependency will be removed in 2.0.0.');
      return require('lodash');
    }
  }
});