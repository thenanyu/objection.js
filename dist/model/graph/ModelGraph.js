"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _require = require('./ModelGraphBuilder'),
    ModelGraphBuilder = _require.ModelGraphBuilder;

var NOT_CALCULATED = {};

var ModelGraph =
/*#__PURE__*/
function () {
  function ModelGraph(nodes, edges) {
    _classCallCheck(this, ModelGraph);

    this.nodes = nodes;
    this.edges = edges; // These are calculated lazily.

    this._nodesByObjects = NOT_CALCULATED;
    this._nodesByIdPathKeys = NOT_CALCULATED;
  }

  _createClass(ModelGraph, [{
    key: "nodeForObject",
    value: function nodeForObject(obj) {
      if (!obj) {
        return null;
      }

      if (this._nodesByObjects === NOT_CALCULATED) {
        this._nodesByObjects = createNodesByObjectsMap(this.nodes);
      }

      return this._nodesByObjects.get(obj) || null;
    }
  }, {
    key: "nodeForNode",
    value: function nodeForNode(node) {
      if (!node) {
        return null;
      }

      if (this._nodesByIdPathKeys === NOT_CALCULATED) {
        this._nodesByIdPathKeys = createNodesByIdPathKeysMap(this.nodes);
      }

      return this._nodesByIdPathKeys.get(node.idPathKey) || null;
    }
  }], [{
    key: "create",
    value: function create(rootModelClass, roots) {
      var builder = ModelGraphBuilder.buildGraph(rootModelClass, roots);
      return new ModelGraph(builder.nodes, builder.edges);
    }
  }, {
    key: "createEmpty",
    value: function createEmpty() {
      return new ModelGraph([], []);
    }
  }]);

  return ModelGraph;
}();

function createNodesByObjectsMap(nodes) {
  var nodesByObjects = new Map();
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var node = _step.value;
      nodesByObjects.set(node.obj, node);
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

  return nodesByObjects;
}

function createNodesByIdPathKeysMap(nodes) {
  var nodesByIdPathKeys = new Map();
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = nodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var node = _step2.value;
      var idPathKey = node.idPathKey;

      if (idPathKey !== null) {
        nodesByIdPathKeys.set(idPathKey, node);
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

  return nodesByIdPathKeys;
}

module.exports = {
  ModelGraph: ModelGraph
};