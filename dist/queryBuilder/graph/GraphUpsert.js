'use strict';

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _require = require('../../model/graph/ModelGraph'),
    ModelGraph = _require.ModelGraph;

var _require2 = require('../graph/GraphOperation'),
    GraphOperation = _require2.GraphOperation;

var _require3 = require('../graph/insert/GraphInsert'),
    GraphInsert = _require3.GraphInsert;

var _require4 = require('../graph/patch/GraphPatch'),
    GraphPatch = _require4.GraphPatch;

var _require5 = require('../graph/delete/GraphDelete'),
    GraphDelete = _require5.GraphDelete;

var _require6 = require('../graph/recursiveUpsert/GraphRecursiveUpsert'),
    GraphRecursiveUpsert = _require6.GraphRecursiveUpsert;

var _require7 = require('../graph/GraphOptions'),
    GraphOptions = _require7.GraphOptions;

var _require8 = require('../../model/ValidationError'),
    ValidationErrorType = _require8.Type;

var _require9 = require('../RelationExpression'),
    RelationExpression = _require9.RelationExpression;

var _require10 = require('../../utils/objectUtils'),
    uniqBy = _require10.uniqBy;

var GraphUpsert =
/*#__PURE__*/
function () {
  function GraphUpsert(_ref) {
    var rootModelClass = _ref.rootModelClass,
        objects = _ref.objects,
        upsertOptions = _ref.upsertOptions;

    _classCallCheck(this, GraphUpsert);

    this.objects = rootModelClass.ensureModelArray(objects, GraphUpsert.modelOptions);
    this.isArray = Array.isArray(objects);
    this.upsertOpt = upsertOptions;
  }

  _createClass(GraphUpsert, [{
    key: "run",
    value: function run(builder) {
      var modelClass = builder.modelClass();
      var graphOptions = new GraphOptions(this.upsertOpt);
      var graph = ModelGraph.create(modelClass, this.objects);
      return fetchCurrentGraph(builder, graphOptions, this.objects).then(pruneGraphs(graph, graphOptions)).then(checkForErrors(graph, graphOptions, builder)).then(executeOperations(graph, graphOptions, builder)).then(returnResult(this.objects, this.isArray));
    }
  }], [{
    key: "modelOptions",
    get: function get() {
      return {
        skipValidation: true
      };
    }
  }]);

  return GraphUpsert;
}();

function fetchCurrentGraph(builder, graphOptions, obj) {
  if (graphOptions.isInsertOnly()) {
    return Promise.resolve(ModelGraph.createEmpty());
  } else {
    return GraphOperation.fetchCurrentGraph({
      builder: builder,
      obj: obj
    });
  }
}

function pruneGraphs(graph, graphOptions) {
  return function (currentGraph) {
    pruneRelatedBranches(graph, currentGraph, graphOptions);

    if (!graphOptions.isInsertOnly()) {
      pruneDeletedBranches(graph, currentGraph);
    }

    return currentGraph;
  };
}

function pruneRelatedBranches(graph, currentGraph, graphOptions) {
  var relateNodes = graph.nodes.filter(function (node) {
    return !currentGraph.nodeForNode(node) && !graphOptions.shouldInsertIgnoreDisable(node, currentGraph);
  });
  removeBranchesFromGraph(findRoots(relateNodes), graph);
}

function pruneDeletedBranches(graph, currentGraph) {
  var deleteNodes = currentGraph.nodes.filter(function (currentNode) {
    return !graph.nodeForNode(currentNode);
  });
  removeBranchesFromGraph(findRoots(deleteNodes), currentGraph);
}

function findRoots(nodes) {
  var nodeSet = new Set(nodes);
  return uniqBy(nodes.filter(function (node) {
    var parentNode = node.parentNode;

    while (parentNode) {
      if (nodeSet.has(parentNode)) {
        return false;
      }

      parentNode = parentNode.parentNode;
    }

    return true;
  }));
}

function removeBranchesFromGraph(branchRoots, graph) {
  var nodesToRemove = new Set(branchRoots.reduce(function (nodesToRemove, node) {
    return [].concat(_toConsumableArray(nodesToRemove), _toConsumableArray(node.descendantRelationNodes));
  }, []));
  var edgesToRemove = new Set();
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = nodesToRemove[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var node = _step.value;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = node.edges[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var edge = _step2.value;
          var otherNode = edge.getOtherNode(node);

          if (!nodesToRemove.has(otherNode)) {
            otherNode.removeEdge(edge);
            edgesToRemove.add(edge);
          }
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

  graph.nodes = graph.nodes.filter(function (node) {
    return !nodesToRemove.has(node);
  });
  graph.edges = graph.edges.filter(function (edge) {
    return !edgesToRemove.has(edge);
  });
  return graph;
}

function checkForErrors(graph, graphOptions, builder) {
  return function (currentGraph) {
    checkForNotFoundErrors(graph, currentGraph, graphOptions, builder);
    checkForUnallowedRelationErrors(graph, builder);

    if (graphOptions.isInsertOnly()) {
      checkForHasManyRelateErrors(graph, currentGraph, graphOptions);
    }

    return currentGraph;
  };
}

function checkForNotFoundErrors(graph, currentGraph, graphOptions, builder) {
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = graph.nodes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var node = _step3.value;

      if (node.obj.$hasId() && !graphOptions.shouldInsertIgnoreDisable(node, currentGraph) && !graphOptions.shouldRelateIgnoreDisable(node, currentGraph) && !currentGraph.nodeForNode(node)) {
        if (!node.parentNode) {
          throw node.modelClass.createNotFoundError(builder.context(), {
            message: "root model (id=".concat(node.obj.$id(), ") does not exist. If you want to insert it with an id, use the insertMissing option"),
            dataPath: node.dataPath
          });
        } else {
          throw node.modelClass.createNotFoundError(builder.context(), {
            message: "model (id=".concat(node.obj.$id(), ") is not a child of model (id=").concat(node.parentNode.obj.$id(), "). If you want to relate it, use the relate option. If you want to insert it with an id, use the insertMissing option"),
            dataPath: node.dataPath
          });
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

function checkForUnallowedRelationErrors(graph, builder) {
  var allowedExpression = builder.allowedUpsertExpression();

  if (allowedExpression) {
    var rootsObjs = graph.nodes.filter(function (node) {
      return !node.parentEdge;
    }).map(function (node) {
      return node.obj;
    });
    var expression = RelationExpression.fromModelGraph(rootsObjs);

    if (!allowedExpression.isSubExpression(expression)) {
      throw builder.modelClass().createValidationError({
        type: ValidationErrorType.UnallowedRelation,
        message: 'trying to upsert an unallowed relation'
      });
    }
  }
}

function checkForHasManyRelateErrors(graph, currentGraph, graphOptions) {
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = graph.nodes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var node = _step4.value;

      if (graphOptions.shouldRelate(node, currentGraph) && node.parentEdge.relation.isObjectionHasManyRelation) {
        throw new Error('You cannot relate HasManyRelation or HasOneRelation using insertGraph, because those require update operations. Consider using upsertGraph instead.');
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

function executeOperations(graph, graphOptions, builder) {
  var operations = graphOptions.isInsertOnly() ? [GraphInsert] : [GraphDelete, GraphInsert, GraphPatch, GraphRecursiveUpsert];
  return function (currentGraph) {
    return operations.reduce(function (promise, Operation) {
      var operation = new Operation({
        graph: graph,
        currentGraph: currentGraph,
        graphOptions: graphOptions
      });
      var actions = operation.createActions();
      return promise.then(function () {
        return executeActions(builder, actions);
      });
    }, Promise.resolve());
  };
}

function executeActions(builder, actions) {
  return actions.reduce(function (promise, action) {
    return promise.then(function () {
      return action.run(builder);
    });
  }, Promise.resolve());
}

function returnResult(objects, isArray) {
  return function () {
    return isArray ? objects : objects[0];
  };
}

module.exports = {
  GraphUpsert: GraphUpsert
};