'use strict';

var _require = require('./modelQueryProps'),
    splitQueryProps = _require.splitQueryProps;

var _require2 = require('../utils/objectUtils'),
    isFunction = _require2.isFunction,
    isString = _require2.isString;

var _require3 = require('./modelParseRelations'),
    parseRelationsIntoModelInstances = _require3.parseRelationsIntoModelInstances;

function setJson(model, json, options) {
  json = json || {};
  options = options || {};

  if (Object.prototype.toString.call(json) !== '[object Object]') {
    throw new Error('You should only pass objects to $setJson method. ' + '$setJson method was given an invalid value ' + json);
  }

  if (!json.$isObjectionModel) {
    // json can contain "query properties" like `raw` instances, query builders etc.
    // We take them out of `json` and store them to a hidden property $$queryProps
    // in the model instance for later use.
    json = splitQueryProps(model, json);
  }

  json = model.$parseJson(json, options);
  json = model.$validate(json, options);
  model.$set(json);

  if (!options.skipParseRelations) {
    parseRelationsIntoModelInstances(model, json, options);
  }

  return model;
}

function setDatabaseJson(model, json) {
  json = model.$parseDatabaseJson(json);

  if (json) {
    var keys = Object.keys(json);

    for (var i = 0, l = keys.length; i < l; ++i) {
      var key = keys[i];
      model[key] = json[key];
    }
  }

  return model;
}

function setFast(model, obj) {
  if (obj) {
    // Don't try to set read-only virtual properties. They can easily get here
    // through `fromJson` when parsing an object that was previously serialized
    // from a model instance.
    var readOnlyVirtuals = model.constructor.getReadOnlyVirtualAttributes();
    var keys = Object.keys(obj);

    for (var i = 0, l = keys.length; i < l; ++i) {
      var key = keys[i];
      var value = obj[key];

      if (key.charAt(0) !== '$' && !isFunction(value) && (readOnlyVirtuals === null || readOnlyVirtuals.indexOf(key) === -1)) {
        model[key] = value;
      }
    }
  }

  return model;
}

function setRelated(model, relation, models) {
  relation = ensureRelation(model, relation);

  if (relation.isOneToOne()) {
    if (Array.isArray(models)) {
      if (models.length === 0) {
        model[relation.name] = null;
      } else {
        model[relation.name] = models[0] || null;
      }
    } else {
      model[relation.name] = models || null;
    }
  } else {
    if (!models) {
      model[relation.name] = [];
    } else if (Array.isArray(models)) {
      model[relation.name] = models;
    } else {
      model[relation.name] = [models];
    }
  }

  return this;
}

function appendRelated(model, relation, models) {
  relation = ensureRelation(model, relation);

  if (!model[relation.name] || relation.isOneToOne()) {
    return model.$setRelated(relation, models);
  } else {
    if (Array.isArray(models)) {
      models.forEach(function (it) {
        return model[relation.name].push(it);
      });
    } else if (models) {
      model[relation.name].push(models);
    }
  }

  return this;
}

function ensureRelation(model, relation) {
  if (isString(relation)) {
    return model.constructor.getRelation(relation);
  } else {
    return relation;
  }
}

module.exports = {
  setFast: setFast,
  setJson: setJson,
  setDatabaseJson: setDatabaseJson,
  setRelated: setRelated,
  appendRelated: appendRelated
};