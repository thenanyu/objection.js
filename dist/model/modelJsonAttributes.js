'use strict';

var _require = require('../utils/objectUtils'),
    asArray = _require.asArray,
    isObject = _require.isObject,
    flatten = _require.flatten,
    isString = _require.isString;

function parseJsonAttributes(json, modelClass) {
  var jsonAttr = modelClass.getJsonAttributes();

  if (jsonAttr.length) {
    // JSON attributes may be returned as strings depending on the database and
    // the database client. Convert them to objects here.
    for (var i = 0, l = jsonAttr.length; i < l; ++i) {
      var attr = jsonAttr[i];
      var value = json[attr];

      if (isString(value)) {
        var parsed = tryParseJson(value); // tryParseJson returns undefined if parsing failed.

        if (parsed !== undefined) {
          json[attr] = parsed;
        }
      }
    }
  }

  return json;
}

function formatJsonAttributes(json, modelClass) {
  var jsonAttr = modelClass.getJsonAttributes();

  if (jsonAttr.length) {
    // All database clients want JSON columns as strings. Do the conversion here.
    for (var i = 0, l = jsonAttr.length; i < l; ++i) {
      var attr = jsonAttr[i];
      var value = json[attr];

      if (isObject(value)) {
        json[attr] = JSON.stringify(value);
      }
    }
  }

  return json;
}

function getJsonAttributes(modelClass) {
  var jsonAttributes = modelClass.jsonAttributes;

  if (Array.isArray(jsonAttributes)) {
    return jsonAttributes;
  }

  jsonAttributes = [];

  if (modelClass.getJsonSchema()) {
    var props = modelClass.getJsonSchema().properties || {};
    var propNames = Object.keys(props);

    for (var i = 0, l = propNames.length; i < l; ++i) {
      var propName = propNames[i];
      var prop = props[propName];
      var types = asArray(prop.type).filter(function (it) {
        return !!it;
      });

      if (types.length === 0 && Array.isArray(prop.anyOf)) {
        types = flatten(prop.anyOf.map(function (it) {
          return it.type;
        }));
      }

      if (types.length === 0 && Array.isArray(prop.oneOf)) {
        types = flatten(prop.oneOf.map(function (it) {
          return it.type;
        }));
      }

      if (types.indexOf('object') !== -1 || types.indexOf('array') !== -1) {
        jsonAttributes.push(propName);
      }
    }
  }

  return jsonAttributes;
}

function tryParseJson(maybeJsonStr) {
  try {
    return JSON.parse(maybeJsonStr);
  } catch (err) {
    return undefined;
  }
}

module.exports = {
  parseJsonAttributes: parseJsonAttributes,
  formatJsonAttributes: formatJsonAttributes,
  getJsonAttributes: getJsonAttributes
};