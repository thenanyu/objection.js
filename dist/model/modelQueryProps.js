'use strict';

var _require = require('../utils/objectUtils'),
    isObject = _require.isObject,
    isFunction = _require.isFunction;

var _require2 = require('./modelUtils'),
    defineNonEnumerableProperty = _require2.defineNonEnumerableProperty;

var _require3 = require('../utils/knexUtils'),
    isKnexRaw = _require3.isKnexRaw,
    isKnexQueryBuilder = _require3.isKnexQueryBuilder;

var QUERY_PROPS_PROPERTY = '$$queryProps'; // Removes query properties from `json` and stores them into a hidden property
// inside `model` so that they can be later merged back to `json`.

function splitQueryProps(model, json) {
  var keys = Object.keys(json);

  if (hasQueryProps(json, keys)) {
    var queryProps = {};
    var modelProps = {};

    for (var i = 0, l = keys.length; i < l; ++i) {
      var key = keys[i];
      var value = json[key];

      if (isQueryProp(value)) {
        queryProps[key] = value;
      } else {
        modelProps[key] = value;
      }
    }

    defineNonEnumerableProperty(model, QUERY_PROPS_PROPERTY, queryProps);
    return modelProps;
  } else {
    return json;
  }
}

function hasQueryProps(json, keys) {
  for (var i = 0, l = keys.length; i < l; ++i) {
    if (isQueryProp(json[keys[i]])) {
      return true;
    }
  }

  return false;
}

function isQueryProp(value) {
  if (!isObject(value)) {
    return false;
  }

  return isKnexQueryBuilder(value) || isKnexRaw(value) || isKnexRawConvertable(value) || value.isObjectionQueryBuilderBase;
} // Merges and converts `model`'s query properties into `json`.


function mergeQueryProps(model, json, omitProps, builder) {
  json = convertExistingQueryProps(json, builder);
  json = convertAndMergeHiddenQueryProps(model, json, omitProps, builder);
  return json;
} // Converts the query properties in `json` to knex raw instances.
// `json` may have query properties even though we removed them.
// For example they may have been added in lifecycle hooks.


function convertExistingQueryProps(json, builder) {
  var keys = Object.keys(json);

  for (var i = 0, l = keys.length; i < l; ++i) {
    var key = keys[i];
    var value = json[key];

    if (isQueryProp(value)) {
      json[key] = queryPropToKnexRaw(value, builder);
    }
  }

  return json;
} // Converts and merges the query props that were split from the model
// and stored into QUERY_PROPS_PROPERTY.


function convertAndMergeHiddenQueryProps(model, json, omitProps, builder) {
  var queryProps = model[QUERY_PROPS_PROPERTY];

  if (!queryProps) {
    // The model has no query properties.
    return json;
  }

  var modelClass = model.constructor;
  var keys = Object.keys(queryProps);

  for (var i = 0, l = keys.length; i < l; ++i) {
    var key = keys[i];

    if (!omitProps || !omitProps.includes(key)) {
      var queryProp = queryPropToKnexRaw(queryProps[key], builder);
      json[modelClass.propertyNameToColumnName(key)] = queryProp;
    }
  }

  return json;
} // Converts a query property into a knex `raw` instance.


function queryPropToKnexRaw(queryProp, builder) {
  if (!queryProp) {
    return queryProp;
  }

  if (queryProp.isObjectionQueryBuilderBase) {
    return buildObjectionQueryBuilder(queryProp, builder);
  } else if (isKnexRawConvertable(queryProp)) {
    return buildKnexRawConvertable(queryProp, builder);
  } else {
    return queryProp;
  }
}

function buildObjectionQueryBuilder(builder, parentBuilder) {
  return builder.subqueryOf(parentBuilder).build();
}

function buildKnexRawConvertable(converable, builder) {
  if (!builder) {
    throw new Error('toDatabaseJson called without a query builder instance for a model with query properties');
  }

  return converable.toKnexRaw(builder);
}

function isKnexRawConvertable(queryProp) {
  return isFunction(queryProp.toKnexRaw);
}

module.exports = {
  splitQueryProps: splitQueryProps,
  mergeQueryProps: mergeQueryProps
};