'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Validator = require('./Validator');

var _require = require('../model/ValidationError'),
    ValidationErrorType = _require.Type;

var _require2 = require('../utils/objectUtils'),
    isObject = _require2.isObject,
    once = _require2.once,
    lodashCloneDeep = _require2.cloneDeep,
    omit = _require2.omit;

var getAjv = once(function () {
  try {
    return require('ajv');
  } catch (err) {
    throw new Error('Optional ajv dependency not installed. Please run `npm install ajv --save`');
  }
});

var AjvValidator =
/*#__PURE__*/
function (_Validator) {
  _inherits(AjvValidator, _Validator);

  function AjvValidator(conf) {
    var _this;

    _classCallCheck(this, AjvValidator);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(AjvValidator).call(this));
    _this.ajvOptions = Object.assign({
      errorDataPath: 'property'
    }, conf.options, {
      allErrors: true
    }); // Create a normal Ajv instance.

    _this.ajv = new getAjv()(Object.assign({
      useDefaults: true
    }, _this.ajvOptions)); // Create an instance that doesn't set default values. We need this one
    // to validate `patch` objects (objects that have a subset of properties).

    _this.ajvNoDefaults = new getAjv()(Object.assign({}, _this.ajvOptions, {
      useDefaults: false
    })); // A cache for the compiled validator functions.

    _this.cache = new Map();
    conf.onCreateAjv(_this.ajv);
    conf.onCreateAjv(_this.ajvNoDefaults);
    return _this;
  }

  _createClass(AjvValidator, [{
    key: "beforeValidate",
    value: function beforeValidate(_ref) {
      var json = _ref.json,
          model = _ref.model,
          options = _ref.options,
          ctx = _ref.ctx;
      ctx.jsonSchema = model.constructor.getJsonSchema(); // Objection model's have a `$beforeValidate` hook that is allowed to modify the schema.
      // We need to clone the schema in case the function modifies it. We only do this in the
      // rare case that the given model has implemented the hook.

      if (model.$beforeValidate !== model.$objectionModelClass.prototype.$beforeValidate) {
        ctx.jsonSchema = cloneDeep(ctx.jsonSchema);
        var ret = model.$beforeValidate(ctx.jsonSchema, json, options);

        if (ret !== undefined) {
          ctx.jsonSchema = ret;
        }
      }
    }
  }, {
    key: "validate",
    value: function validate(_ref2) {
      var json = _ref2.json,
          model = _ref2.model,
          options = _ref2.options,
          ctx = _ref2.ctx;

      if (!ctx.jsonSchema) {
        return json;
      }

      var modelClass = model.constructor;
      var validator = this.getValidator(modelClass, ctx.jsonSchema, !!options.patch); // We need to clone the input json if we are about to set default values.

      if (!options.mutable && !options.patch && setsDefaultValues(ctx.jsonSchema)) {
        json = cloneDeep(json);
      }

      validator.call(model, json);
      var error = parseValidationError(validator.errors, modelClass, options);

      if (error) {
        throw error;
      }

      return json;
    }
  }, {
    key: "getValidator",
    value: function getValidator(modelClass, jsonSchema, isPatchObject) {
      // Use the AJV custom serializer if provided.
      var createCacheKey = this.ajvOptions.serialize || JSON.stringify; // Optimization for the common case where jsonSchema is never modified.
      // In that case we don't need to call the costly createCacheKey function.

      var cacheKey = jsonSchema === modelClass.getJsonSchema() ? modelClass.uniqueTag() : createCacheKey(jsonSchema);
      var validators = this.cache.get(cacheKey);
      var validator = null;

      if (!validators) {
        validators = {
          // Validator created for the schema object without `required` properties
          // using the AJV instance that doesn't set default values.
          patchValidator: null,
          // Validator created for the unmodified schema.
          normalValidator: null
        };
        this.cache.set(cacheKey, validators);
      }

      if (isPatchObject) {
        validator = validators.patchValidator;

        if (!validator) {
          validator = this.compilePatchValidator(jsonSchema);
          validators.patchValidator = validator;
        }
      } else {
        validator = validators.normalValidator;

        if (!validator) {
          validator = this.compileNormalValidator(jsonSchema);
          validators.normalValidator = validator;
        }
      }

      return validator;
    }
  }, {
    key: "compilePatchValidator",
    value: function compilePatchValidator(jsonSchema) {
      jsonSchema = jsonSchemaWithoutRequired(jsonSchema); // We need to use the ajv instance that doesn't set the default values.

      return this.ajvNoDefaults.compile(jsonSchema);
    }
  }, {
    key: "compileNormalValidator",
    value: function compileNormalValidator(jsonSchema) {
      return this.ajv.compile(jsonSchema);
    }
  }]);

  return AjvValidator;
}(Validator);

function parseValidationError(errors, modelClass, options) {
  if (!errors) {
    return null;
  }

  var relations = modelClass.getRelations();
  var errorHash = {};
  var numErrors = 0;

  for (var i = 0; i < errors.length; ++i) {
    var error = errors[i];
    var dataPath = "".concat(options.dataPath || '').concat(error.dataPath); // If additionalProperties = false, relations can pop up as additionalProperty
    // errors. Skip those.

    if (error.params && error.params.additionalProperty && relations[error.params.additionalProperty]) {
      continue;
    } // Unknown properties are reported in `['propertyName']` notation,
    // so replace those with dot-notation, see:
    // https://github.com/epoberezkin/ajv/issues/671


    var key = dataPath.replace(/\['([^' ]*)'\]/g, '.$1').substring(1); // More than one error can occur for the same key in Ajv, merge them in the array:

    var array = errorHash[key] || (errorHash[key] = []); // Use unshift instead of push so that the last error ends up at [0],
    // preserving previous behavior where only the last error was stored.

    array.unshift({
      message: error.message,
      keyword: error.keyword,
      params: error.params
    });
    ++numErrors;
  }

  if (numErrors === 0) {
    return null;
  }

  return modelClass.createValidationError({
    type: ValidationErrorType.ModelValidation,
    data: errorHash
  });
}

function cloneDeep(obj) {
  if (isObject(obj) && obj.$isObjectionModel) {
    return obj.$clone();
  } else {
    return lodashCloneDeep(obj);
  }
}

function setsDefaultValues(jsonSchema) {
  return jsonSchema && jsonSchema.properties && hasDefaults(jsonSchema.properties);
}

function hasDefaults(obj) {
  if (Array.isArray(obj)) {
    return arrayHasDefaults(obj);
  } else {
    return objectHasDefaults(obj);
  }
}

function arrayHasDefaults(arr) {
  for (var i = 0, l = arr.length; i < l; ++i) {
    var val = arr[i];

    if (isObject(val) && hasDefaults(val)) {
      return true;
    }
  }

  return false;
}

function objectHasDefaults(obj) {
  var keys = Object.keys(obj);

  for (var i = 0, l = keys.length; i < l; ++i) {
    var key = keys[i];

    if (key === 'default') {
      return true;
    } else {
      var val = obj[key];

      if (isObject(val) && hasDefaults(val)) {
        return true;
      }
    }
  }

  return false;
}

function jsonSchemaWithoutRequired(jsonSchema) {
  var subSchemaProps = ['anyOf', 'oneOf', 'allOf', 'not', 'then', 'else'];
  return Object.assign.apply(Object, [omit(jsonSchema, ['required'].concat(subSchemaProps))].concat(_toConsumableArray(subSchemaProps.map(function (prop) {
    return subSchemaWithoutRequired(jsonSchema, prop);
  }))));
}

function subSchemaWithoutRequired(jsonSchema, prop) {
  if (jsonSchema[prop]) {
    if (Array.isArray(jsonSchema[prop])) {
      var schemaArray = jsonSchemaArrayWithoutRequired(jsonSchema[prop]);

      if (schemaArray.length !== 0) {
        return _defineProperty({}, prop, schemaArray);
      } else {
        return {};
      }
    } else {
      return _defineProperty({}, prop, jsonSchemaWithoutRequired(jsonSchema[prop]));
    }
  } else {
    return {};
  }
}

function jsonSchemaArrayWithoutRequired(jsonSchemaArray) {
  return jsonSchemaArray.map(jsonSchemaWithoutRequired).filter(isNotEmptyObject);
}

function isNotEmptyObject(obj) {
  return Object.keys(obj).length !== 0;
}

module.exports = AjvValidator;