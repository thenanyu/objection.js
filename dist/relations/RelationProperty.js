'use strict';

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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

var _require = require('../utils/objectUtils'),
    asArray = _require.asArray,
    isObject = _require.isObject,
    uniqBy = _require.uniqBy,
    get = _require.get,
    set = _require.set;

var _require2 = require('../queryBuilder/ReferenceBuilder'),
    createRef = _require2.ref;

var _require3 = require('../queryBuilder/RawBuilder'),
    createRaw = _require3.raw;

var _require4 = require('../model/modelValues'),
    propToStr = _require4.propToStr,
    PROP_KEY_PREFIX = _require4.PROP_KEY_PREFIX;

var ModelNotFoundError =
/*#__PURE__*/
function (_Error) {
  _inherits(ModelNotFoundError, _Error);

  function ModelNotFoundError(tableName) {
    var _this;

    _classCallCheck(this, ModelNotFoundError);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ModelNotFoundError).call(this));
    _this.name = _this.constructor.name;
    _this.tableName = tableName;
    return _this;
  }

  return ModelNotFoundError;
}(_wrapNativeSuper(Error));

var InvalidReferenceError =
/*#__PURE__*/
function (_Error2) {
  _inherits(InvalidReferenceError, _Error2);

  function InvalidReferenceError() {
    var _this2;

    _classCallCheck(this, InvalidReferenceError);

    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(InvalidReferenceError).call(this));
    _this2.name = _this2.constructor.name;
    return _this2;
  }

  return InvalidReferenceError;
}(_wrapNativeSuper(Error)); // A pair of these define how two tables are related to each other.
// Both the owner and the related table have one of these.
//
// A relation property can be a single column, an array of columns
// (composite key) a json column reference, an array of json column
// references or any combination of the above.


var RelationProperty =
/*#__PURE__*/
function () {
  // references must be a reference string like `Table.column:maybe.some.json[1].path`.
  // or an array of such references (composite key).
  //
  // modelClassResolver must be a function that takes a table name
  // and returns a model class.
  function RelationProperty(references, modelClassResolver) {
    _classCallCheck(this, RelationProperty);

    var refs = createRefs(asArray(references));
    var paths = createPaths(refs, modelClassResolver);
    var modelClass = resolveModelClass(paths);
    this._refs = refs;
    this._modelClass = modelClass;
    this._props = paths.map(function (it) {
      return it.path[0];
    });
    this._cols = refs.map(function (it) {
      return it.column;
    });
    this._propGetters = paths.map(function (it) {
      return createGetter(it.path);
    });
    this._propSetters = paths.map(function (it) {
      return createSetter(it.path);
    });
  }

  _createClass(RelationProperty, [{
    key: "propKey",
    // Creates a concatenated string from the property values of the given object.
    value: function propKey(obj) {
      var size = this.size;
      var key = PROP_KEY_PREFIX;

      for (var i = 0; i < size; ++i) {
        key += propToStr(this.getProp(obj, i));

        if (i !== size - 1) {
          key += ',';
        }
      }

      return key;
    } // Returns the property values of the given object as an array.

  }, {
    key: "getProps",
    value: function getProps(obj) {
      var size = this.size;
      var props = new Array(size);

      for (var i = 0; i < size; ++i) {
        props[i] = this.getProp(obj, i);
      }

      return props;
    } // Returns true if the given object has a non-null value in all properties.

  }, {
    key: "hasProps",
    value: function hasProps(obj) {
      var size = this.size;

      for (var i = 0; i < size; ++i) {
        var prop = this.getProp(obj, i);

        if (prop === null || prop === undefined) {
          return false;
        }
      }

      return true;
    } // Returns the index:th property value of the given object.

  }, {
    key: "getProp",
    value: function getProp(obj, index) {
      return this._propGetters[index](obj);
    } // Sets the index:th property value of the given object.

  }, {
    key: "setProp",
    value: function setProp(obj, index, value) {
      return this._propSetters[index](obj, value);
    } // Returns the index:th column name with table reference. Something like
    // 'Table.someColumn'.

  }, {
    key: "fullCol",
    value: function fullCol(builder, index) {
      var table = builder.tableRefFor(this.modelClass.getTableName());
      return "".concat(table, ".").concat(this.cols[index]);
    } // Returns an instance of ReferenceBuilder that points to the index:th
    // value of a row.

  }, {
    key: "ref",
    value: function ref(builder, index) {
      var table = builder.tableRefFor(this.modelClass.getTableName());
      return this._refs[index].clone().table(table);
    } // Returns an array of reference builders. `ref(builder, i)` for each i.

  }, {
    key: "refs",
    value: function refs(builder) {
      var refs = new Array(this.size);

      for (var i = 0, l = refs.length; i < l; ++i) {
        refs[i] = this.ref(builder, i);
      }

      return refs;
    } // Appends an update operation for the index:th column into `patch` object.

  }, {
    key: "patch",
    value: function patch(_patch, index, value) {
      var ref = this._refs[index];

      if (ref.isPlainColumnRef) {
        _patch[this._cols[index]] = value;
      } else {
        // Objection `patch`, `update` etc. methods understand field expressions.
        _patch[ref.expression] = value;
      }
    } // String representation of this property's index:th column for logging.

  }, {
    key: "propDescription",
    value: function propDescription(index) {
      return this._refs[index].expression;
    }
  }, {
    key: "size",
    // The number of columns.
    get: function get() {
      return this._refs.length;
    } // The model class that owns the property.

  }, {
    key: "modelClass",
    get: function get() {
      return this._modelClass;
    } // An array of property names. Contains multiple values in case of composite key.
    // This may be different from `cols` if the model class has some kind of conversion
    // between database and "external" formats, for example a snake_case to camelCase
    // conversion.

  }, {
    key: "props",
    get: function get() {
      return this._props;
    } // An array of column names. Contains multiple values in case of composite key.
    // This may be different from `props` if the model class has some kind of conversion
    // between database and "external" formats, for example a snake_case to camelCase
    // conversion.

  }, {
    key: "cols",
    get: function get() {
      return this._cols;
    }
  }], [{
    key: "ModelNotFoundError",
    get: function get() {
      return ModelNotFoundError;
    }
  }, {
    key: "InvalidReferenceError",
    get: function get() {
      return InvalidReferenceError;
    }
  }]);

  return RelationProperty;
}();

function createRefs(refs) {
  try {
    return refs.map(function (it) {
      if (!isObject(it) || !it.isObjectionReferenceBuilder) {
        return createRef(it);
      } else {
        return it;
      }
    });
  } catch (err) {
    throw new InvalidReferenceError();
  }
}

function createPaths(refs, modelClassResolver) {
  return refs.map(function (ref) {
    if (!ref.tableName) {
      throw new InvalidReferenceError();
    }

    var modelClass = modelClassResolver(ref.tableName);

    if (!modelClass) {
      throw new ModelNotFoundError(ref.tableName);
    }

    var prop = modelClass.columnNameToPropertyName(ref.column);
    var jsonPath = ref.reference.access.map(function (it) {
      return it.ref;
    });
    return {
      path: [prop].concat(jsonPath),
      modelClass: modelClass
    };
  });
}

function resolveModelClass(paths) {
  var modelClasses = paths.map(function (it) {
    return it.modelClass;
  });
  var uniqueModelClasses = uniqBy(modelClasses);

  if (uniqueModelClasses.length !== 1) {
    throw new InvalidReferenceError();
  }

  return modelClasses[0];
}

function createGetter(path) {
  if (path.length === 1) {
    var prop = path[0];
    return function (obj) {
      return obj[prop];
    };
  } else {
    return function (obj) {
      return get(obj, path);
    };
  }
}

function createSetter(path) {
  if (path.length === 1) {
    var prop = path[0];
    return function (obj, value) {
      return obj[prop] = value;
    };
  } else {
    return function (obj, value) {
      return set(obj, path, value);
    };
  }
}

module.exports = RelationProperty;