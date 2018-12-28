'use strict';

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var path = require('path');

var _require = require('../utils/objectUtils'),
    once = _require.once,
    isString = _require.isString;

var _require2 = require('../utils/classUtils'),
    isSubclassOf = _require2.isSubclassOf;

var getModel = once(function () {
  return require('../model/Model');
});

var ResolveError =
/*#__PURE__*/
function (_Error) {
  _inherits(ResolveError, _Error);

  function ResolveError() {
    _classCallCheck(this, ResolveError);

    return _possibleConstructorReturn(this, _getPrototypeOf(ResolveError).apply(this, arguments));
  }

  return ResolveError;
}(_wrapNativeSuper(Error));

function resolveModel(modelRef, modelPaths, errorPrefix) {
  try {
    if (isString(modelRef)) {
      if (isAbsolutePath(modelRef)) {
        return requireModel(modelRef);
      } else if (modelPaths) {
        return requireUsingModelPaths(modelRef, modelPaths);
      }
    } else {
      if (!isSubclassOf(modelRef, getModel())) {
        throw new ResolveError("is not a subclass of Model or a file path to a module that exports one. You may be dealing with a require loop. See the documentation section about require loops.");
      }

      return modelRef;
    }
  } catch (err) {
    if (err instanceof ResolveError) {
      throw new Error("".concat(errorPrefix, ": ").concat(err.message));
    } else {
      throw err;
    }
  }
}

function requireUsingModelPaths(modelRef, modelPaths) {
  var firstError = null;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = modelPaths[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var modelPath = _step.value;

      try {
        return requireModel(path.join(modelPath, modelRef));
      } catch (err) {
        if (firstError === null) {
          firstError = err;
        }
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  if (firstError) {
    throw firstError;
  } else {
    throw new ResolveError("could not resolve ".concat(modelRef, " using modelPaths"));
  }
}

function requireModel(modelPath) {
  var Model = getModel();
  /**
   * Wrap path string in template literal to prevent
   * warnings about Objection.JS being an expression
   * in webpack builds.
   * @link https://github.com/webpack/webpack/issues/196
   */

  var mod = require("".concat(path.resolve(modelPath)));

  var modelClass = null;

  if (isSubclassOf(mod, Model)) {
    modelClass = mod;
  } else if (isSubclassOf(mod.default, Model)) {
    // Babel 6 style of exposing default export.
    modelClass = mod.default;
  } else {
    Object.keys(mod).forEach(function (exportName) {
      var exp = mod[exportName];

      if (isSubclassOf(exp, Model)) {
        if (modelClass !== null) {
          throw new ResolveError("path ".concat(modelPath, " exports multiple models. Don't know which one to choose."));
        }

        modelClass = exp;
      }
    });
  }

  if (!isSubclassOf(modelClass, Model)) {
    throw new ResolveError("".concat(modelPath, " is an invalid file path to a model class"));
  }

  return modelClass;
}

function isAbsolutePath(pth) {
  return path.normalize(pth + '/') === path.normalize(path.resolve(pth) + '/');
}

module.exports = {
  resolveModel: resolveModel
};