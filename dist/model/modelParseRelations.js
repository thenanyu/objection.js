'use strict';

var _require = require('../utils/objectUtils'),
    isObject = _require.isObject;

function parseRelationsIntoModelInstances(model, json) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var relations = model.constructor.getRelationArray();

  if (!options.cache) {
    options = Object.assign({}, options, {
      cache: new Map()
    });
  }

  options.cache.set(json, model);

  for (var i = 0, l = relations.length; i < l; ++i) {
    var relation = relations[i];
    var relationJson = json[relation.name];

    if (relationJson !== undefined) {
      var relationModel = parseRelation(relationJson, relation, options);

      if (relationModel !== relationJson) {
        model[relation.name] = relationModel;
      }
    }
  }

  return model;
}

function parseRelation(json, relation, options) {
  if (Array.isArray(json)) {
    return parseRelationArray(json, relation, options);
  } else if (json) {
    return parseRelationObject(json, relation, options);
  } else {
    return null;
  }
}

function parseRelationArray(json, relation, options) {
  var models = new Array(json.length);
  var didChange = false;

  for (var i = 0, l = json.length; i < l; ++i) {
    var model = parseRelationObject(json[i], relation, options);

    if (model !== json[i]) {
      didChange = true;
    }

    models[i] = model;
  }

  if (didChange) {
    return models;
  } else {
    return json;
  }
}

function parseRelationObject(json, relation, options) {
  if (isObject(json)) {
    var modelClass = relation.relatedModelClass;
    var model = options.cache.get(json);

    if (model === undefined) {
      if (json instanceof modelClass) {
        model = parseRelationsIntoModelInstances(json, json, options);
      } else {
        model = modelClass.fromJson(json, options);
      }
    }

    return model;
  } else {
    return json;
  }
}

module.exports = {
  parseRelationsIntoModelInstances: parseRelationsIntoModelInstances
};