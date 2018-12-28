'use strict';

var _require = require('./inheritModel'),
    inheritModel = _require.inheritModel;

var _require2 = require('./modelUtils'),
    staticHiddenProps = _require2.staticHiddenProps;

var _require3 = require('./modelUtils'),
    defineNonEnumerableProperty = _require3.defineNonEnumerableProperty;

function bindKnex(modelClass, knex) {
  var BoundModelClass = getBoundModelFromCache(modelClass, knex);

  if (BoundModelClass === null) {
    BoundModelClass = inheritModel(modelClass);
    BoundModelClass = copyHiddenProperties(modelClass, BoundModelClass);
    BoundModelClass.knex(knex);
    BoundModelClass = putBoundModelToCache(modelClass, BoundModelClass, knex);
    BoundModelClass = bindRelations(modelClass, BoundModelClass, knex);
  }

  return BoundModelClass;
}

function getBoundModelFromCache(modelClass, knex) {
  var cache = getCache(knex);
  var cacheKey = modelClass.uniqueTag();
  return cache.get(cacheKey) || null;
}

function getCache(knex) {
  if (!knex.$$objection) {
    createCache(knex);
  }

  return knex.$$objection.boundModels;
}

function createCache(knex) {
  defineNonEnumerableProperty(knex, '$$objection', {
    boundModels: new Map()
  });
}

function copyHiddenProperties(modelClass, BoundModelClass) {
  for (var i = 0, l = staticHiddenProps.length; i < l; ++i) {
    var prop = staticHiddenProps[i]; // $$relations and $$relationArray are handled in separately.

    if (modelClass.hasOwnProperty(prop) && prop !== '$$relations' && prop !== '$$relationArray') {
      defineNonEnumerableProperty(BoundModelClass, prop, modelClass[prop]);
    }
  }

  return BoundModelClass;
}

function putBoundModelToCache(modelClass, BoundModelClass, knex) {
  var cache = getCache(knex);
  var cacheKey = modelClass.uniqueTag();
  cache.set(cacheKey, BoundModelClass);
  return BoundModelClass;
}

function bindRelations(modelClass, BoundModelClass, knex) {
  var relations = modelClass.getRelationArray();
  var boundRelations = Object.create(null);
  var boundRelationArray = [];

  for (var i = 0, l = relations.length; i < l; ++i) {
    var relation = relations[i];
    var boundRelation = relation.bindKnex(knex);
    boundRelations[relation.name] = boundRelation;
    boundRelationArray.push(boundRelation);
  }

  defineNonEnumerableProperty(BoundModelClass, '$$relations', boundRelations);
  defineNonEnumerableProperty(BoundModelClass, '$$relationArray', boundRelationArray);
  return BoundModelClass;
}

module.exports = {
  bindKnex: bindKnex
};