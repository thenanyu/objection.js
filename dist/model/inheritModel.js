"use strict";

var cache = new Map();

function inheritModel(modelClass) {
  var inherit = cache.get(modelClass.name);

  if (!inherit) {
    inherit = createClassInheritor(modelClass.name);
    cache.set(modelClass.name, inherit);
  }

  return inherit(modelClass);
}

function createClassInheritor(className) {
  return new Function('BaseClass', "\n    'use strict';\n    return class ".concat(className, " extends BaseClass {}\n  "));
}

module.exports = {
  inheritModel: inheritModel
};