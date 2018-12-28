'use strict';

var hiddenProps = ['$$queryProps'];
var staticHiddenProps = ['$$knex', '$$validator', '$$jsonSchema', '$$colToProp', '$$propToCol', '$$idColumnArray', '$$idPropertyArray', '$$idProperty', '$$relations', '$$relationArray', '$$jsonAttributes', '$$columnNameMappers', '$$tableMetadata'];

function defineNonEnumerableProperty(obj, prop, value) {
  Object.defineProperty(obj, prop, {
    enumerable: false,
    writable: true,
    configurable: true,
    value: value
  });
}

function keyByProps(models, props) {
  var map = new Map();

  for (var i = 0, l = models.length; i < l; ++i) {
    var model = models[i];
    map.set(model.$propKey(props), model);
  }

  return map;
}

module.exports = {
  hiddenProps: hiddenProps,
  staticHiddenProps: staticHiddenProps,
  defineNonEnumerableProperty: defineNonEnumerableProperty,
  keyByProps: keyByProps
};