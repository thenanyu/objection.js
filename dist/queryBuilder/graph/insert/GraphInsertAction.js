"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var _require = require('../GraphAction'),
    GraphAction = _require.GraphAction;

var _require2 = require('../../../utils/objectUtils'),
    groupBy = _require2.groupBy,
    chunk = _require2.chunk,
    get = _require2.get,
    set = _require2.set;

var _require3 = require('../../../model/graph/ModelGraphEdge'),
    ModelGraphEdge = _require3.ModelGraphEdge;

var _require4 = require('../../../utils/tmpColumnUtils'),
    isTempColumn = _require4.isTempColumn;

var promiseUtils = require('../../../utils/promiseUtils');
/**
 * Inserts a batch of nodes for a GraphInsert.
 *
 * One of these is created for each batch of nodes that can be inserted at once.
 * However, the nodes can have a different table and not all databases support
 * batch inserts, so this class splits the inserts into further sub batches
 * when needed.
 */


var GraphInsertAction =
/*#__PURE__*/
function (_GraphAction) {
  _inherits(GraphInsertAction, _GraphAction);

  function GraphInsertAction(_ref) {
    var _this;

    var nodes = _ref.nodes,
        currentGraph = _ref.currentGraph,
        dependencies = _ref.dependencies,
        graphOptions = _ref.graphOptions;

    _classCallCheck(this, GraphInsertAction);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(GraphInsertAction).call(this)); // Nodes to insert.

    _this.nodes = nodes;
    _this.currentGraph = currentGraph;
    _this.dependencies = dependencies;
    _this.graphOptions = graphOptions;
    return _this;
  }

  _createClass(GraphInsertAction, [{
    key: "run",
    value: function run(builder) {
      var _this2 = this;

      var batches = this._createInsertBatches(builder);

      var concurrency = this._getConcurrency(builder, this.nodes);

      return promiseUtils.map(batches, function (batch) {
        return _this2._insertBatch(builder, batch);
      }, {
        concurrency: concurrency
      });
    }
  }, {
    key: "_createInsertBatches",
    value: function _createInsertBatches(builder) {
      var batches = [];

      var batchSize = this._getBatchSize(builder);

      var nodesByModelClass = groupBy(this.nodes, getModelClass);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = nodesByModelClass.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var nodes = _step.value;
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = chunk(nodes, batchSize)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var nodeBatch = _step2.value;
              batches.push(nodeBatch);
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

      return batches;
    }
  }, {
    key: "_insertBatch",
    value: function _insertBatch(parentBuilder, nodes) {
      var _this3 = this;

      return this._beforeInsert(nodes).then(function () {
        return _this3._insert(parentBuilder, nodes);
      }).then(function () {
        return _this3._afterInsert(nodes);
      });
    }
  }, {
    key: "_beforeInsert",
    value: function _beforeInsert(nodes) {
      this._resolveDependencies(nodes);

      this._omitManyToManyExtraProps(nodes);

      this._copyValuesFromCurrentGraph(nodes);

      return Promise.resolve();
    }
  }, {
    key: "_resolveDependencies",
    value: function _resolveDependencies(nodes) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = nodes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var node = _step3.value;
          var edges = this.dependencies.get(node);

          if (edges) {
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
              for (var _iterator4 = edges[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var edge = _step4.value;
                // `node` needs `dependencyNode` to have been inserted (and it has been).
                var dependencyNode = edge.getOtherNode(node);

                this._resolveDependency(dependencyNode, edge);
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
    key: "_resolveDependency",
    value: function _resolveDependency(dependencyNode, edge) {
      if (edge.type === ModelGraphEdge.Type.Relation && !edge.relation.joinTable) {
        this._resolveRelationDependency(dependencyNode, edge);
      } else if (edge.refType === ModelGraphEdge.ReferenceType.Property) {
        this._resolvePropertyReferenceNode(dependencyNode, edge);
      }
    }
  }, {
    key: "_resolveRelationDependency",
    value: function _resolveRelationDependency(dependencyNode, edge) {
      var dependentNode = edge.getOtherNode(dependencyNode);
      var sourceProp;
      var targetProp;

      if (edge.isOwnerNode(dependencyNode)) {
        sourceProp = edge.relation.ownerProp;
        targetProp = edge.relation.relatedProp;
      } else {
        targetProp = edge.relation.ownerProp;
        sourceProp = edge.relation.relatedProp;
      }

      this._resolveReferences(dependencyNode);

      for (var i = 0, l = targetProp.size; i < l; ++i) {
        targetProp.setProp(dependentNode.obj, i, sourceProp.getProp(dependencyNode.obj, i));
      }
    }
  }, {
    key: "_resolvePropertyReferenceNode",
    value: function _resolvePropertyReferenceNode(dependencyNode, edge) {
      var dependentNode = edge.getOtherNode(dependencyNode);
      var sourcePath;
      var targetPath;

      if (edge.isOwnerNode(dependencyNode)) {
        sourcePath = edge.refOwnerDataPath;
        targetPath = edge.refRelatedDataPath;
      } else {
        targetPath = edge.refOwnerDataPath;
        sourcePath = edge.refRelatedDataPath;
      }

      var sourceValue = get(dependencyNode.obj, sourcePath);
      var targetValue = get(dependentNode.obj, targetPath);

      if (targetValue === edge.refMatch) {
        set(dependentNode.obj, targetPath, sourceValue);
      } else {
        set(dependentNode.obj, targetPath, targetValue.replace(edge.refMatch, sourceValue));
      }
    }
  }, {
    key: "_omitManyToManyExtraProps",
    value: function _omitManyToManyExtraProps(nodes) {
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = nodes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var node = _step5.value;

          if (node.parentEdge && node.parentEdge.type === ModelGraphEdge.Type.Relation && node.parentEdge.relation.joinTableExtras.length > 0) {
            node.parentEdge.relation.omitExtraProps([node.obj]);
          }
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }
    }
  }, {
    key: "_copyValuesFromCurrentGraph",
    value: function _copyValuesFromCurrentGraph(nodes) {
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = nodes[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var node = _step6.value;
          var currentNode = this.currentGraph.nodeForNode(node);

          if (currentNode) {
            var _arr = Object.keys(currentNode.obj);

            for (var _i = 0; _i < _arr.length; _i++) {
              var prop = _arr[_i];

              if (!node.obj.hasOwnProperty(prop) && !isTempColumn(prop)) {
                node.obj[prop] = currentNode.obj[prop];
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return != null) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }
    }
  }, {
    key: "_insert",
    value: function _insert(parentBuilder, nodes) {
      var _this4 = this;

      var _nodes = nodes,
          _nodes2 = _slicedToArray(_nodes, 1),
          modelClass = _nodes2[0].modelClass;

      nodes = nodes.filter(function (node) {
        return _this4.graphOptions.shouldInsert(node, _this4.currentGraph);
      });
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = nodes[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var node = _step7.value;
          delete node.obj[modelClass.uidProp];
          node.obj.$validate(null, {
            dataPath: node.dataPathKey
          });
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return != null) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }

      if (nodes.length === 0) {
        return;
      }

      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = nodes[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var _node = _step8.value;
          _node.userData.inserted = true;
        }
      } catch (err) {
        _didIteratorError8 = true;
        _iteratorError8 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion8 && _iterator8.return != null) {
            _iterator8.return();
          }
        } finally {
          if (_didIteratorError8) {
            throw _iteratorError8;
          }
        }
      }

      return this._runRelationBeforeInsertMethods(parentBuilder, nodes).then(function () {
        return modelClass.query().insert(nodes.map(function (node) {
          return node.obj;
        })).childQueryOf(parentBuilder).copyFrom(parentBuilder, GraphAction.ReturningAllSelector).execute();
      });
    }
  }, {
    key: "_runRelationBeforeInsertMethods",
    value: function _runRelationBeforeInsertMethods(parentBuilder, nodes) {
      return Promise.all(nodes.map(function (node) {
        if (node.parentEdge) {
          return node.parentEdge.relation.beforeInsert(node.obj, parentBuilder.context());
        } else {
          return null;
        }
      }));
    }
  }, {
    key: "_afterInsert",
    value: function _afterInsert(nodes) {
      var _iteratorNormalCompletion9 = true;
      var _didIteratorError9 = false;
      var _iteratorError9 = undefined;

      try {
        for (var _iterator9 = nodes[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
          var node = _step9.value;
          var _iteratorNormalCompletion10 = true;
          var _didIteratorError10 = false;
          var _iteratorError10 = undefined;

          try {
            for (var _iterator10 = node.referencingNodes[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
              var refNode = _step10.value;

              this._resolveDependency(refNode, refNode.parentEdge);
            }
          } catch (err) {
            _didIteratorError10 = true;
            _iteratorError10 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion10 && _iterator10.return != null) {
                _iterator10.return();
              }
            } finally {
              if (_didIteratorError10) {
                throw _iteratorError10;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError9 = true;
        _iteratorError9 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion9 && _iterator9.return != null) {
            _iterator9.return();
          }
        } finally {
          if (_didIteratorError9) {
            throw _iteratorError9;
          }
        }
      }
    }
  }]);

  return GraphInsertAction;
}(GraphAction);

function getModelClass(node) {
  return node.modelClass;
}

module.exports = {
  GraphInsertAction: GraphInsertAction
};