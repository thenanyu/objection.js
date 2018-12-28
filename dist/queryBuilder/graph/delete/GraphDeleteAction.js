"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var promiseUtils = require('../../../utils/promiseUtils');

var _require = require('../GraphAction'),
    GraphAction = _require.GraphAction;

var _require2 = require('../../../utils/objectUtils'),
    groupBy = _require2.groupBy;

var GraphDeleteAction =
/*#__PURE__*/
function (_GraphAction) {
  _inherits(GraphDeleteAction, _GraphAction);

  function GraphDeleteAction(_ref) {
    var _this;

    var nodes = _ref.nodes,
        graph = _ref.graph,
        graphOptions = _ref.graphOptions;

    _classCallCheck(this, GraphDeleteAction);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(GraphDeleteAction).call(this)); // Nodes to delete.

    _this.nodes = nodes;
    _this.graph = graph;
    _this.graphOptions = graphOptions;
    return _this;
  }

  _createClass(GraphDeleteAction, [{
    key: "run",
    value: function run(builder) {
      var nodesTodelete = this._filterOutBelongsToOneRelationUnrelates(this.nodes);

      var builders = this._createDeleteBuilders(builder, nodesTodelete);

      return promiseUtils.map(builders, function (builder) {
        return builder.execute();
      }, {
        concurrency: this._getConcurrency(builder, nodesTodelete)
      });
    }
  }, {
    key: "_filterOutBelongsToOneRelationUnrelates",
    value: function _filterOutBelongsToOneRelationUnrelates(nodes) {
      var _this2 = this;

      // `BelongsToOneRelation` unrelate is handled by `GraphPatch` because
      // unrelating a `BelongsToOneRelation` is just a matter of updating
      // one field of the parent node.
      return nodes.filter(function (node) {
        return !(_this2.graphOptions.shouldUnrelate(node, _this2.graph) && node.parentEdge.relation.isObjectionBelongsToOneRelation);
      });
    }
  }, {
    key: "_createDeleteBuilders",
    value: function _createDeleteBuilders(parentBuilder, nodesTodelete) {
      var _this3 = this;

      var nodesByRelation = groupBy(nodesTodelete, getRelation);
      var builders = [];
      nodesByRelation.forEach(function (nodes, relation) {
        var nodesByParent = groupBy(nodes, getParent);
        nodesByParent.forEach(function (nodes, parentNode) {
          var shouldUnrelate = _this3.graphOptions.shouldUnrelate(nodes[0], _this3.graph);

          var builder = parentNode.obj.$relatedQuery(relation.name).childQueryOf(parentBuilder);

          if (!relation.isObjectionBelongsToOneRelation) {
            // This is useless in case of BelongsToOneRelation.
            builder.findByIds(nodes.map(function (node) {
              return node.obj.$id();
            }));
          }

          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var node = _step.value;
              node.userData.deleted = true;
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

          builders.push(shouldUnrelate ? builder.unrelate() : builder.delete());
        });
      });
      return builders;
    }
  }]);

  return GraphDeleteAction;
}(GraphAction);

function getRelation(node) {
  return node.parentEdge.relation;
}

function getParent(node) {
  return node.parentNode;
}

module.exports = {
  GraphDeleteAction: GraphDeleteAction
};