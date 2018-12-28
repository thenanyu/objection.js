"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _require = require('../../utils/objectUtils'),
    isObject = _require.isObject,
    isString = _require.isString;

var _require2 = require('./ModelGraphNode'),
    ModelGraphNode = _require2.ModelGraphNode;

var _require3 = require('./ModelGraphEdge'),
    ModelGraphEdge = _require3.ModelGraphEdge;

var ModelGraphBuilder =
/*#__PURE__*/
function () {
  function ModelGraphBuilder() {
    _classCallCheck(this, ModelGraphBuilder);

    this.nodes = [];
    this.edges = [];
  }

  _createClass(ModelGraphBuilder, [{
    key: "_buildGraph",
    value: function _buildGraph(rootModelClass, roots) {
      if (roots) {
        if (Array.isArray(roots)) {
          this._buildNodes(rootModelClass, roots);
        } else {
          this._buildNode(rootModelClass, roots);
        }
      }

      this._buildReferences();
    }
  }, {
    key: "_buildNodes",
    value: function _buildNodes(modelClass, objs) {
      var _this = this;

      var parentNode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var relation = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      objs.forEach(function (obj, index) {
        _this._buildNode(modelClass, obj, parentNode, relation, index);
      });
    }
  }, {
    key: "_buildNode",
    value: function _buildNode(modelClass, obj) {
      var parentNode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var relation = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      var index = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
      var node = new ModelGraphNode(modelClass, obj);
      this.nodes.push(node);

      if (parentNode) {
        var edge = new ModelGraphEdge(ModelGraphEdge.Type.Relation, parentNode, node, relation, index);
        node.parentEdge = edge;

        this._addEdge(parentNode, node, edge);
      }

      this._buildRelationNodes(node);
    }
  }, {
    key: "_buildRelationNodes",
    value: function _buildRelationNodes(node) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = node.modelClass.getRelationArray()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var relation = _step.value;
          var relatedObjects = node.obj[relation.name];

          if (!relatedObjects) {
            continue;
          }

          if (relation.isOneToOne()) {
            this._buildNode(relation.relatedModelClass, relatedObjects, node, relation);
          } else {
            this._buildNodes(relation.relatedModelClass, relatedObjects, node, relation);
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
    }
  }, {
    key: "_buildReferences",
    value: function _buildReferences() {
      var nodesByUid = this._nodesByUid();

      this._buildObjectReferences(nodesByUid);

      this._buildPropertyReferences(nodesByUid);
    }
  }, {
    key: "_nodesByUid",
    value: function _nodesByUid() {
      var nodesByUid = new Map();
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.nodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var node = _step2.value;
          var uid = node.uid;

          if (uid === undefined) {
            continue;
          }

          nodesByUid.set(uid, node);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return nodesByUid;
    }
  }, {
    key: "_buildObjectReferences",
    value: function _buildObjectReferences(nodesByUid) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.nodes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var node = _step3.value;
          var ref = node.reference;

          if (ref === undefined) {
            continue;
          }

          var refNode = nodesByUid.get(ref);

          if (!refNode) {
            throw createReferenceFoundError(node, ref);
          }

          var edge = new ModelGraphEdge(ModelGraphEdge.Type.Reference, node, refNode);
          edge.refType = ModelGraphEdge.ReferenceType.Object;

          this._addEdge(node, refNode, edge);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }
  }, {
    key: "_buildPropertyReferences",
    value: function _buildPropertyReferences(nodesByUid) {
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = this.nodes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var node = _step4.value;
          var relations = node.modelClass.getRelations();

          var _arr = Object.keys(node.obj);

          for (var _i = 0; _i < _arr.length; _i++) {
            var prop = _arr[_i];

            if (relations[prop]) {
              continue;
            }

            this._buildPropertyReference(nodesByUid, node, prop);
          }
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }
    }
  }, {
    key: "_buildPropertyReference",
    value: function _buildPropertyReference(nodesByUid, node, prop) {
      var _this2 = this;

      visitStrings(node.obj[prop], [prop], function (str, path) {
        forEachMatch(node.modelClass.propRefRegex, str, function (match) {
          var _match = _slicedToArray(match, 3),
              _ = _match[0],
              ref = _match[1],
              refPath = _match[2];

          var refNode = nodesByUid.get(ref);

          if (!refNode) {
            throw createReferenceFoundError(node, ref);
          }

          var edge = new ModelGraphEdge(ModelGraphEdge.Type.Reference, node, refNode);
          edge.refType = ModelGraphEdge.ReferenceType.Property;
          edge.refMatch = match[0];
          edge.refOwnerDataPath = path.slice();
          edge.refRelatedDataPath = refPath.split('.');

          _this2._addEdge(node, refNode, edge);
        });
      });
    }
  }, {
    key: "_addEdge",
    value: function _addEdge(ownerNode, relatedNode, edge) {
      this.edges.push(edge);
      ownerNode.edges.push(edge);
      relatedNode.edges.push(edge);

      if (edge.type === ModelGraphEdge.Type.Reference) {
        ownerNode.refEdges.push(edge);
        relatedNode.refEdges.push(edge);
      }
    }
  }], [{
    key: "buildGraph",
    value: function buildGraph(rootModelClass, roots) {
      var builder = new this();

      builder._buildGraph(rootModelClass, roots);

      return builder;
    }
  }]);

  return ModelGraphBuilder;
}();

function visitStrings(value, path, visit) {
  if (Array.isArray(value)) {
    visitStringsInArray(value, path, visit);
  } else if (isObject(value)) {
    visitStringsInObject(value, path, visit);
  } else if (isString(value)) {
    visit(value, path);
  }
}

function visitStringsInArray(value, path, visit) {
  for (var i = 0; i < value.length; ++i) {
    path.push(i);
    visitStrings(value[i], path, visit);
    path.pop();
  }
}

function visitStringsInObject(value, path, visit) {
  var _arr2 = Object.keys(value);

  for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
    var prop = _arr2[_i2];
    path.push(prop);
    visitStrings(value[prop], path, visit);
    path.pop();
  }
}

function forEachMatch(regex, str, cb) {
  var matchResult = regex.exec(str);

  while (matchResult) {
    cb(matchResult);
    matchResult = regex.exec(str);
  }
}

function createReferenceFoundError(node, ref) {
  return new Error('no reference found');
}

module.exports = {
  ModelGraphBuilder: ModelGraphBuilder
};