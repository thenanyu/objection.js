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

var parser = require('./parsers/relationExpressionParser');

var _require = require('../utils/objectUtils'),
    isObject = _require.isObject,
    cloneDeep = _require.cloneDeep,
    isNumber = _require.isNumber,
    isString = _require.isString,
    union = _require.union;

var RelationDoesNotExistError = require('../model/RelationDoesNotExistError');

var RelationExpressionParseError =
/*#__PURE__*/
function (_Error) {
  _inherits(RelationExpressionParseError, _Error);

  function RelationExpressionParseError() {
    _classCallCheck(this, RelationExpressionParseError);

    return _possibleConstructorReturn(this, _getPrototypeOf(RelationExpressionParseError).apply(this, arguments));
  }

  return RelationExpressionParseError;
}(_wrapNativeSuper(Error));

var DuplicateRelationError =
/*#__PURE__*/
function (_RelationExpressionPa) {
  _inherits(DuplicateRelationError, _RelationExpressionPa);

  function DuplicateRelationError(relationName) {
    var _this;

    _classCallCheck(this, DuplicateRelationError);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(DuplicateRelationError).call(this));
    _this.relationName = relationName;
    return _this;
  }

  return DuplicateRelationError;
}(RelationExpressionParseError);

var RelationExpression =
/*#__PURE__*/
function () {
  function RelationExpression() {
    var node = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var recursionDepth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    _classCallCheck(this, RelationExpression);

    this.$name = node.$name || null;
    this.$relation = node.$relation || null;
    this.$modify = node.$modify || [];
    this.$recursive = node.$recursive || false;
    this.$allRecursive = node.$allRecursive || false;
    var childNames = getChildNames(node);

    for (var i = 0, l = childNames.length; i < l; ++i) {
      var childName = childNames[i];
      this[childName] = node[childName];
    } // These are non-enumerable so that the enumerable interface of this
    // class instance is the same as the result from relationExpressionParser.


    Object.defineProperties(this, {
      recursionDepth: {
        enumerable: false,
        value: recursionDepth
      },
      childNames: {
        enumerable: false,
        value: childNames
      },
      rawNode: {
        enumerable: false,
        value: node
      }
    });
  } // Create a relation expression from a string, a pojo or another
  // RelationExpression instance.


  _createClass(RelationExpression, [{
    key: "merge",
    // Merges this relation expression with another. `expr` can be a string,
    // a pojo, or a RelationExpression instance.
    value: function merge(expr) {
      return new RelationExpression(mergeNodes(this, RelationExpression.create(expr)));
    } // Returns true if `expr` is contained by this expression. For example
    // `a.b` is contained by `a.[b, c]`.

  }, {
    key: "isSubExpression",
    value: function isSubExpression(expr) {
      expr = RelationExpression.create(expr);

      if (this.isAllRecursive) {
        return true;
      }

      if (expr.isAllRecursive) {
        return this.isAllRecursive;
      }

      if (this.$relation !== expr.$relation) {
        return false;
      }

      var maxRecursionDepth = expr.maxRecursionDepth;

      if (maxRecursionDepth > 0) {
        return this.isAllRecursive || this.maxRecursionDepth >= maxRecursionDepth;
      }

      for (var i = 0, l = expr.childNames.length; i < l; ++i) {
        var childName = expr.childNames[i];
        var ownSubExpression = this.childExpression(childName);
        var subExpression = expr.childExpression(childName);

        if (!ownSubExpression || !ownSubExpression.isSubExpression(subExpression)) {
          return false;
        }
      }

      return true;
    } // Returns a RelationExpression for a child node or null if there
    // is no child with the given name `childName`.

  }, {
    key: "childExpression",
    value: function childExpression(childName) {
      if (this.isAllRecursive || childName === this.$name && this.recursionDepth < this.maxRecursionDepth - 1) {
        return new RelationExpression(this, this.recursionDepth + 1);
      }

      var child = this[childName];

      if (child) {
        return new RelationExpression(child, 0);
      } else {
        return null;
      }
    } // Loops throught all first level children. `allRelations` must be
    // the return value of `Model.getRelations()` where `Model` is the
    // root model of the expression.

  }, {
    key: "forEachChildExpression",
    value: function forEachChildExpression(allRelations, cb) {
      var maxRecursionDepth = this.maxRecursionDepth;

      if (this.isAllRecursive) {
        var relationNames = Object.keys(allRelations);

        for (var i = 0, l = relationNames.length; i < l; ++i) {
          var relationName = relationNames[i];
          var node = newNode(relationName, true);
          var relation = allRelations[relationName];
          var childExpr = new RelationExpression(node, 0);
          cb(childExpr, relation);
        }
      } else if (this.recursionDepth < maxRecursionDepth - 1) {
        var _relation = allRelations[this.$name] || null;

        var _childExpr = new RelationExpression(this, this.recursionDepth + 1);

        cb(_childExpr, _relation);
      } else if (maxRecursionDepth === 0) {
        var _childNames = this.childNames;

        for (var _i = 0, _l = _childNames.length; _i < _l; ++_i) {
          var childName = _childNames[_i];
          var _node = this[childName];
          var _relation2 = allRelations[_node.$relation];

          if (!_relation2) {
            throw new RelationDoesNotExistError(_node.$relation);
          }

          var _childExpr2 = new RelationExpression(_node, 0);

          cb(_childExpr2, _relation2);
        }
      }
    }
  }, {
    key: "expressionsAtPath",
    value: function expressionsAtPath(path) {
      return findExpressionsAtPath(this, RelationExpression.create(path), []);
    }
  }, {
    key: "clone",
    value: function clone() {
      return new RelationExpression(toNode(this), this.recursionDepth);
    }
  }, {
    key: "toString",
    value: function toString() {
      return _toString(this);
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return _toJSON(this);
    }
  }, {
    key: "toPojo",
    value: function toPojo() {
      return toNode(this);
    }
  }, {
    key: "numChildren",
    get: function get() {
      return this.childNames.length;
    }
  }, {
    key: "maxRecursionDepth",
    get: function get() {
      if (isNumber(this.$recursive)) {
        return this.$recursive;
      } else {
        return this.$recursive ? Number.MAX_SAFE_INTEGER : 0;
      }
    }
  }, {
    key: "isAllRecursive",
    get: function get() {
      return this.$allRecursive;
    }
  }], [{
    key: "create",
    value: function create(expr) {
      if (isObject(expr)) {
        if (expr.isObjectionRelationExpression) {
          return expr;
        } else {
          return new RelationExpression(normalizeNode(expr));
        }
      } else if (isString(expr)) {
        if (expr.trim().length === 0) {
          return new RelationExpression();
        } else {
          try {
            return new RelationExpression(parser.parse(expr));
          } catch (err) {
            if (err.duplicateRelationName) {
              throw new DuplicateRelationError(err.duplicateRelationName);
            } else {
              throw new RelationExpressionParseError(err.message);
            }
          }
        }
      } else {
        return new RelationExpression();
      }
    } // Create a relation expression from a model graph.

  }, {
    key: "fromModelGraph",
    value: function fromModelGraph(graph) {
      if (!graph) {
        return new RelationExpression();
      } else {
        return new RelationExpression(modelGraphToNode(graph, newNode()));
      }
    }
  }]);

  return RelationExpression;
}(); // All enumerable properties of a node that don't start with `$`
// are child nodes.


function getChildNames(node) {
  var allKeys = Object.keys(node);
  var childNames = [];

  for (var i = 0, l = allKeys.length; i < l; ++i) {
    var key = allKeys[i];

    if (key[0] !== '$') {
      childNames.push(key);
    }
  }

  return childNames;
}

function _toString(node) {
  var childNames = getChildNames(node);
  var childExpr = childNames.map(function (childName) {
    return node[childName];
  }).map(_toString);
  var str = node.$relation;

  if (node.$recursive) {
    if (isNumber(node.$recursive)) {
      str += '.^' + node.$recursive;
    } else {
      str += '.^';
    }
  } else if (node.$allRecursive) {
    str += '.*';
  }

  if (childExpr.length > 1) {
    childExpr = "[".concat(childExpr.join(', '), "]");
  } else {
    childExpr = childExpr[0];
  }

  if (node.$modify.length) {
    str += "(".concat(node.$modify.join(', '), ")");
  }

  if (node.$name !== node.$relation) {
    str += " as ".concat(node.$name);
  }

  if (childExpr) {
    if (str) {
      return "".concat(str, ".").concat(childExpr);
    } else {
      return childExpr;
    }
  } else {
    return str;
  }
}

function _toJSON(node) {
  var nodeName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var json = {};

  if (node.$name && node.$name !== nodeName) {
    json.$name = node.$name;
  }

  if (node.$relation && node.$relation !== nodeName) {
    json.$relation = node.$relation;
  } // TODO: !isArray(x) -> x.slice() ?


  if (!Array.isArray(node.$modify) || node.$modify.length > 0) {
    json.$modify = node.$modify.slice();
  }

  if (node.$recursive) {
    json.$recursive = node.$recursive;
  }

  if (node.$allRecursive) {
    json.$allRecursive = node.$allRecursive;
  }

  var childNames = getChildNames(node);

  for (var i = 0, l = childNames.length; i < l; ++i) {
    var childName = childNames[i];
    var childNode = node[childName];

    var childJson = _toJSON(childNode, childName);

    if (Object.keys(childJson).length === 0) {
      json[childName] = true;
    } else {
      json[childName] = childJson;
    }
  }

  return json;
}

function toNode(expr) {
  var node = {
    $name: expr.$name,
    $relation: expr.$relation,
    $modify: expr.$modify.slice(),
    $recursive: expr.$recursive,
    $allRecursive: expr.$allRecursive
  };

  for (var i = 0, l = expr.childNames.length; i < l; ++i) {
    var childName = expr.childNames[i];
    node[childName] = cloneDeep(expr[childName]);
  }

  return node;
}

function modelGraphToNode(models, node) {
  if (!models) {
    return;
  }

  if (Array.isArray(models)) {
    for (var i = 0, l = models.length; i < l; ++i) {
      modelToNode(models[i], node);
    }
  } else {
    modelToNode(models, node);
  }

  return node;
} // TODO: recursion check


function modelToNode(model, node) {
  var modelClass = model.constructor;
  var relations = modelClass.getRelationArray();

  for (var r = 0, lr = relations.length; r < lr; ++r) {
    var relName = relations[r].name;

    if (model.hasOwnProperty(relName)) {
      var childNode = node[relName];

      if (!childNode) {
        childNode = newNode(relName);
        node[relName] = childNode;
      }

      modelGraphToNode(model[relName], childNode);
    }
  }
}

function newNode(name) {
  var allRecusive = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  return {
    $name: name || null,
    $relation: name || null,
    $modify: [],
    $recursive: false,
    $allRecursive: allRecusive
  };
}

function normalizeNode(node) {
  var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var normalized = {
    $name: node.$name || name,
    $relation: node.$relation || name,
    $modify: node.$modify || [],
    $recursive: node.$recursive || false,
    $allRecursive: node.$allRecursive || false
  };
  var childNames = getChildNames(node);

  for (var i = 0, l = childNames.length; i < l; ++i) {
    var childName = childNames[i];
    var childNode = node[childName];

    if (isObject(childNode) || childNode === true) {
      normalized[childName] = normalizeNode(childNode, childName);
    }
  }

  return normalized;
}

function findExpressionsAtPath(target, path, results) {
  if (path.childNames.length == 0) {
    // Path leaf reached, add target node to result set.
    results.push(target);
  } else {
    for (var i = 0, l = path.childNames.length; i < l; ++i) {
      var childName = path.childNames[i];
      var pathChild = path.childExpression(childName);
      var targetChild = target.childExpression(childName);

      if (targetChild) {
        findExpressionsAtPath(targetChild, pathChild, results);
      }
    }
  }

  return results;
}

function mergeNodes(node1, node2) {
  var node = {
    $name: node1.$name,
    $relation: node1.$relation,
    $modify: union(node1.$modify, node2.$modify),
    $recursive: mergeRecursion(node1.$recursive, node2.$recursive),
    $allRecursive: node1.$allRecursive || node2.$allRecursive
  };

  if (!node.$recursive && !node.$allRecursive) {
    var _childNames2 = union(getChildNames(node1), getChildNames(node2));

    for (var i = 0, l = _childNames2.length; i < l; ++i) {
      var childName = _childNames2[i];
      var child1 = node1[childName];
      var child2 = node2[childName];

      if (child1 && child2) {
        node[childName] = mergeNodes(child1, child2);
      } else {
        node[childName] = child1 || child2;
      }
    }
  }

  return node;
}

function mergeRecursion(rec1, rec2) {
  if (rec1 === true || rec2 === true) {
    return true;
  } else if (isNumber(rec1) && isNumber(rec2)) {
    return Math.max(rec1, rec2);
  } else {
    return rec1 || rec2;
  }
}

Object.defineProperties(RelationExpression.prototype, {
  isObjectionRelationExpression: {
    enumerable: false,
    writable: false,
    value: true
  }
});
module.exports = {
  RelationExpression: RelationExpression,
  RelationExpressionParseError: RelationExpressionParseError,
  DuplicateRelationError: DuplicateRelationError
};