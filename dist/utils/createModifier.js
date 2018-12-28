'use strict';

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var _require = require('./objectUtils'),
    asArray = _require.asArray,
    isString = _require.isString,
    isFunction = _require.isFunction,
    isPlainObject = _require.isPlainObject;

function createModifier(_ref) {
  var modelClass = _ref.modelClass,
      modifier = _ref.modifier,
      modifiers = _ref.modifiers,
      args = _ref.args;
  modifiers = modifiers || {};
  args = args || [];
  var modelModifiers = modelClass ? modelClass.getModifiers() : {};
  var modifierFunctions = asArray(modifier).map(function (modifier) {
    var modify = null;

    if (isString(modifier)) {
      modify = modifiers[modifier] || modelModifiers[modifier]; // Modifiers can be pointers to other modifiers. Call this function recursively.

      if (modify) {
        return createModifier({
          modelClass: modelClass,
          modifier: modify,
          modifiers: modifiers
        });
      }
    } else if (isFunction(modifier)) {
      modify = modifier;
    } else if (isPlainObject(modifier)) {
      modify = function modify(builder) {
        return builder.where(modifier);
      };
    } else if (Array.isArray(modifier)) {
      return createModifier({
        modelClass: modelClass,
        modifier: modifier,
        modifiers: modifiers
      });
    }

    if (!modify) {
      modify = function modify(builder) {
        return modelClass.modifierNotFound(builder, modifier);
      };
    }

    return modify;
  });
  return function (builder) {
    return modifierFunctions.forEach(function (modifier) {
      return modifier.apply(void 0, [builder].concat(_toConsumableArray(args)));
    });
  };
}

module.exports = {
  createModifier: createModifier
};