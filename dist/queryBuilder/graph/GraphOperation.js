"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _require = require('../../utils/objectUtils'),
    asArray = _require.asArray;

var _require2 = require('../../model/graph/ModelGraph'),
    ModelGraph = _require2.ModelGraph;

var _require3 = require('../RelationExpression'),
    RelationExpression = _require3.RelationExpression;

var GraphOperation =
/*#__PURE__*/
function () {
  function GraphOperation(_ref) {
    var graph = _ref.graph,
        currentGraph = _ref.currentGraph,
        graphOptions = _ref.graphOptions;

    _classCallCheck(this, GraphOperation);

    this.graph = graph;
    this.currentGraph = currentGraph;
    this.graphOptions = graphOptions;
  }

  _createClass(GraphOperation, [{
    key: "createActions",
    value: function createActions() {
      return [];
    }
  }, {
    key: "shouldRelateAncestor",
    value: function shouldRelateAncestor(node) {
      if (!node.parentNode) {
        return false;
      }

      return this.graphOptions.shouldRelate(node.parentNode, this.currentGraph) || this.shouldRelateAncestor(node.parentNode);
    }
  }], [{
    key: "fetchCurrentGraph",
    value: function fetchCurrentGraph(_ref2) {
      var builder = _ref2.builder,
          obj = _ref2.obj;
      var rootIds = getRootIds(obj);
      var modelClass = builder.modelClass();

      if (rootIds.length === 0) {
        return Promise.resolve(ModelGraph.create(modelClass, []));
      }

      return modelClass.query().childQueryOf(builder, childQueryOptions()).modify(propagateMethodCallsFromQuery(builder)).whereInComposite(builder.fullIdColumnFor(modelClass), rootIds).eager(RelationExpression.fromModelGraph(obj)).internalOptions(fetchQueryInternalOptions()).mergeContext(idSelectorContext(builder)).then(function (models) {
        return ModelGraph.create(modelClass, models);
      });
    }
  }]);

  return GraphOperation;
}();

function getRootIds(graph) {
  return asArray(graph).filter(function (it) {
    return it.$hasId();
  }).map(function (root) {
    return root.$id();
  });
}

function propagateMethodCallsFromQuery(builder) {
  return function (fetchBuilder) {
    // Propagate some method calls from the root query.
    var _arr = ['forUpdate', 'forShare'];

    for (var _i = 0; _i < _arr.length; _i++) {
      var method = _arr[_i];

      if (builder.has(method)) {
        fetchBuilder[method]();
      }
    }
  };
}

function childQueryOptions() {
  return {
    fork: true,
    isInternalQuery: true
  };
}

function fetchQueryInternalOptions() {
  return {
    keepImplicitJoinProps: true
  };
}

function idSelectorContext(builder) {
  var _builder$context = builder.context(),
      _onBuild = _builder$context.onBuild;

  return {
    onBuild: function onBuild(builder) {
      // There may be an onBuild hook in the old context.
      if (_onBuild) {
        _onBuild.call(this, builder);
      }

      var modelClass = builder.modelClass();
      var idColumn = builder.fullIdColumnFor(modelClass); // We only select the id column(s). The relation columns (foreign keys etc.)
      // are automatically selected by objection. We keep them from being
      // deleted by enabling the `keepImplicitJoinProps` option.

      builder.select(idColumn);
    }
  };
}

module.exports = {
  GraphOperation: GraphOperation
};