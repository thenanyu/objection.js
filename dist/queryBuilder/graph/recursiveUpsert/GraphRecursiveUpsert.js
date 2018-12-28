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

var _require = require('../GraphOperation'),
    GraphOperation = _require.GraphOperation;

var _require2 = require('./GraphRecursiveUpsertAction'),
    GraphRecursiveUpsertAction = _require2.GraphRecursiveUpsertAction;

var GraphRecursiveUpsert =
/*#__PURE__*/
function (_GraphOperation) {
  _inherits(GraphRecursiveUpsert, _GraphOperation);

  function GraphRecursiveUpsert() {
    _classCallCheck(this, GraphRecursiveUpsert);

    return _possibleConstructorReturn(this, _getPrototypeOf(GraphRecursiveUpsert).apply(this, arguments));
  }

  _createClass(GraphRecursiveUpsert, [{
    key: "createActions",
    value: function createActions() {
      var _this = this;

      return [new GraphRecursiveUpsertAction({
        nodes: this.graph.nodes.filter(function (node) {
          var shouldRelate = _this.graphOptions.shouldRelate(node, _this.currentGraph);

          return shouldRelate && hasRelations(node.obj);
        }),
        currentGraph: this.currentGraph,
        graphOptions: this.graphOptions
      })];
    }
  }]);

  return GraphRecursiveUpsert;
}(GraphOperation);

function hasRelations(obj) {
  var relations = obj.constructor.getRelationArray();
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = relations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var relation = _step.value;

      if (obj.hasOwnProperty(relation.name)) {
        return true;
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

  return false;
}

module.exports = {
  GraphRecursiveUpsert: GraphRecursiveUpsert
};