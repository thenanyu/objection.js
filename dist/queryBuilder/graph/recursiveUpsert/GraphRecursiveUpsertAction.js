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

var GraphRecursiveUpsertAction =
/*#__PURE__*/
function (_GraphAction) {
  _inherits(GraphRecursiveUpsertAction, _GraphAction);

  function GraphRecursiveUpsertAction(_ref) {
    var _this;

    var nodes = _ref.nodes,
        graph = _ref.graph,
        graphOptions = _ref.graphOptions;

    _classCallCheck(this, GraphRecursiveUpsertAction);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(GraphRecursiveUpsertAction).call(this)); // Nodes to upsert.

    _this.nodes = nodes;
    _this.graph = graph;
    _this.graphOptions = graphOptions;
    return _this;
  }

  _createClass(GraphRecursiveUpsertAction, [{
    key: "run",
    value: function run(builder) {
      var builders = this._createUpsertBuilders(builder, this.nodes);

      return promiseUtils.map(builders, function (builder) {
        return builder.execute();
      }, {
        concurrency: this._getConcurrency(builder, this.nodes)
      });
    }
  }, {
    key: "_createUpsertBuilders",
    value: function _createUpsertBuilders(parentBuilder, nodesToUpsert) {
      var _this2 = this;

      var nodesByRelation = groupBy(nodesToUpsert, getRelation);
      var builders = [];
      nodesByRelation.forEach(function (nodes) {
        var nodesByParent = groupBy(nodes, getParent);
        nodesByParent.forEach(function (nodes) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var node = _step.value;
              node.userData.upserted = true;
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

          builders.push(nodes[0].modelClass.query().childQueryOf(parentBuilder).copyFrom(parentBuilder, GraphAction.ReturningAllSelector).upsertGraph(nodes.map(function (node) {
            return node.obj;
          }), _this2.graphOptions.rebasedOptions(nodes[0])));
        });
      });
      return builders;
    }
  }]);

  return GraphRecursiveUpsertAction;
}(GraphAction);

function getRelation(node) {
  return node.parentEdge.relation;
}

function getParent(node) {
  return node.parentNode;
}

module.exports = {
  GraphRecursiveUpsertAction: GraphRecursiveUpsertAction
};