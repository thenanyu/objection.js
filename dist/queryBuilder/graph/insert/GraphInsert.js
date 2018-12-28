"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var _require = require('./JoinRowGraphInsertAction'),
    JoinRowGraphInsertAction = _require.JoinRowGraphInsertAction;

var _require2 = require('./GraphInsertAction'),
    GraphInsertAction = _require2.GraphInsertAction;

var _require3 = require('../GraphOperation'),
    GraphOperation = _require3.GraphOperation;

var _require4 = require('../../../model/graph/ModelGraphEdge'),
    ModelGraphEdge = _require4.ModelGraphEdge;

var GraphInsert =
/*#__PURE__*/
function (_GraphOperation) {
  _inherits(GraphInsert, _GraphOperation);

  function GraphInsert() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, GraphInsert);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(GraphInsert)).call.apply(_getPrototypeOf2, [this].concat(args)));
    _this.dependencies = _this._createDependencyMap();
    return _this;
  }

  _createClass(GraphInsert, [{
    key: "createActions",
    value: function createActions() {
      return [].concat(_toConsumableArray(this._createNormalActions()), _toConsumableArray(this._createJoinRowActions()));
    }
  }, {
    key: "_createDependencyMap",
    value: function _createDependencyMap() {
      var dependencies = new Map();
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.graph.edges[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var edge = _step.value;

          if (edge.type == ModelGraphEdge.Type.Relation) {
            this._createRelationDependency(edge, dependencies);
          } else {
            this._createReferenceDependency(edge, dependencies);
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

      return dependencies;
    }
  }, {
    key: "_createRelationDependency",
    value: function _createRelationDependency(edge, dependencies) {
      if (edge.relation.isObjectionHasManyRelation) {
        // In case of HasManyRelation the related node depends on the owner node
        // because the related node has the foreign key.
        this._addDependency(edge.relatedNode, edge, dependencies);
      } else if (edge.relation.isObjectionBelongsToOneRelation) {
        // In case of BelongsToOneRelation the owner node depends on the related
        // node because the owner node has the foreign key.
        this._addDependency(edge.ownerNode, edge, dependencies);
      }
    }
  }, {
    key: "_createReferenceDependency",
    value: function _createReferenceDependency(edge, dependencies) {
      this._addDependency(edge.ownerNode, edge, dependencies);
    }
  }, {
    key: "_addDependency",
    value: function _addDependency(node, edge, dependencies) {
      var edges = dependencies.get(node);

      if (!edges) {
        edges = [];
        dependencies.set(node, edges);
      }

      edges.push(edge);
    }
  }, {
    key: "_createNormalActions",
    value: function _createNormalActions() {
      var _this2 = this;

      var handledNodes = new Set();
      var actions = [];

      while (true) {
        // At this point, don't care if the nodes have already been inserted before
        // given to this class. `GraphInsertAction` will test that and only insert
        // new ones. We need to pass all nodes to `GraphInsertActions` so that we
        // can resolve all dependencies.
        var nodesToInsert = this.graph.nodes.filter(function (node) {
          return !_this2._isHandled(node, handledNodes) && !_this2._hasDependencies(node, handledNodes);
        });

        if (nodesToInsert.length === 0) {
          break;
        }

        actions.push(new GraphInsertAction({
          nodes: nodesToInsert,
          currentGraph: this.currentGraph,
          dependencies: this.dependencies,
          graphOptions: this.graphOptions
        }));
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = nodesToInsert[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var node = _step2.value;

            this._markHandled(node, handledNodes);
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
      }

      if (handledNodes.size !== this.graph.nodes.length) {
        throw new Error('the object graph contains cyclic references');
      }

      return actions;
    }
  }, {
    key: "_isHandled",
    value: function _isHandled(node, handledNodes) {
      return handledNodes.has(node);
    }
  }, {
    key: "_hasDependencies",
    value: function _hasDependencies(node, handledNodes) {
      if (!this.dependencies.has(node)) {
        return false;
      }

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.dependencies.get(node)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var edge = _step3.value;
          var dependencyNode = edge.getOtherNode(node);

          if (!handledNodes.has(dependencyNode) && !this.currentGraph.nodeForNode(dependencyNode)) {
            return true;
          }
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

      return false;
    }
  }, {
    key: "_markHandled",
    value: function _markHandled(node, handledNodes) {
      handledNodes.add(node); // The referencing nodes are all references that don't
      // represent any real entity. They are simply intermediate nodes
      // that depend on this node. Once this node is handled, we can
      // also mark those nodes as handled as there is nothing to actually
      // insert.

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = node.referencingNodes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var refNode = _step4.value;

          this._markHandled(refNode, handledNodes);
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
    key: "_createJoinRowActions",
    value: function _createJoinRowActions() {
      var _this3 = this;

      return [new JoinRowGraphInsertAction({
        nodes: this.graph.nodes.filter(function (node) {
          return _this3.currentGraph.nodeForNode(node) === null && node.parentEdge && node.parentEdge.relation.isObjectionManyToManyRelation;
        }),
        currentGraph: this.currentGraph,
        graphOptions: this.graphOptions
      })];
    }
  }]);

  return GraphInsert;
}(GraphOperation);

module.exports = {
  GraphInsert: GraphInsert
};