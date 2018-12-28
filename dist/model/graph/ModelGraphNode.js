"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _require = require('./ModelGraphEdge'),
    ModelGraphEdge = _require.ModelGraphEdge;

var _require2 = require('../../utils/objectUtils'),
    isNumber = _require2.isNumber;

var NOT_CALCULATED = {};

var ModelGraphNode =
/*#__PURE__*/
function () {
  function ModelGraphNode(modelClass, obj) {
    _classCallCheck(this, ModelGraphNode);

    this.modelClass = modelClass;
    this.obj = obj;
    this.edges = [];
    this.userData = {}; // These are also included in `edges`. These are simply
    // shortcuts for commonly used edges.

    this.refEdges = [];
    this.parentEdge = null; // These are calculated lazily.

    this._relationPath = NOT_CALCULATED;
    this._relationPathKey = NOT_CALCULATED;
    this._dataPath = NOT_CALCULATED;
    this._dataPathKey = NOT_CALCULATED;
    this._idPath = NOT_CALCULATED;
    this._idPathKey = NOT_CALCULATED;
  }

  _createClass(ModelGraphNode, [{
    key: "removeEdge",
    value: function removeEdge(edge) {
      // Don't allow removing parent edges for now. It would
      // cause all kinds of cache invalidation.
      if (edge === this.parentEdge) {
        throw new Error('cannot remove parent edge');
      }

      this.edges = this.edges.filter(function (it) {
        return it !== edge;
      });
      this.refEdges = this.refEdges.filter(function (it) {
        return it !== edge;
      });
    }
  }, {
    key: "_collectDescendantRelationNodes",
    value: function _collectDescendantRelationNodes(nodes) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.edges[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var edge = _step.value;

          if (edge.type === ModelGraphEdge.Type.Relation && edge.isOwnerNode(this)) {
            nodes.push(edge.relatedNode);

            edge.relatedNode._collectDescendantRelationNodes(nodes);
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

      return nodes;
    }
  }, {
    key: "_createRelationPath",
    value: function _createRelationPath() {
      if (this.parentNode === null) {
        return [];
      } else {
        return [].concat(_toConsumableArray(this.parentNode.relationPath), [this.relationName]);
      }
    }
  }, {
    key: "_createRelationPathKey",
    value: function _createRelationPathKey() {
      return this.relationPath.join('.');
    }
  }, {
    key: "_createDataPath",
    value: function _createDataPath() {
      if (this.parentEdge === null) {
        return [];
      } else if (this.parentEdge.relation.isOneToOne()) {
        return [].concat(_toConsumableArray(this.parentNode.dataPath), [this.relationName]);
      } else {
        return [].concat(_toConsumableArray(this.parentNode.dataPath), [this.relationName, this.indexInRelation]);
      }
    }
  }, {
    key: "_createDataPathKey",
    value: function _createDataPathKey() {
      var dataPathKey = this.dataPath.reduce(function (key, it) {
        if (isNumber(it)) {
          return "".concat(key, "[").concat(it, "]");
        } else {
          return key ? "".concat(key, ".").concat(it) : it;
        }
      }, '');
      return dataPathKey ? '.' + dataPathKey : dataPathKey;
    }
  }, {
    key: "_createIdPath",
    value: function _createIdPath() {
      if (!this.obj.$hasId()) {
        return null;
      }

      if (this.parentEdge === null) {
        return [this.obj.$idKey()];
      } else {
        var path = this.parentNode.idPath;

        if (path === null) {
          return null;
        }

        return [].concat(_toConsumableArray(path), [this.relationName, this.obj.$idKey()]);
      }
    }
  }, {
    key: "_createIdPathKey",
    value: function _createIdPathKey() {
      var idPath = this.idPath;

      if (idPath) {
        return this.idPath.join('.');
      } else {
        return null;
      }
    }
  }, {
    key: "isReference",
    get: function get() {
      return this.reference !== undefined;
    }
  }, {
    key: "isDbReference",
    get: function get() {
      return this.dbReference !== undefined;
    }
  }, {
    key: "reference",
    get: function get() {
      return this.obj[this.modelClass.uidRefProp];
    }
  }, {
    key: "dbReference",
    get: function get() {
      return this.obj[this.modelClass.dbRefProp];
    }
  }, {
    key: "uid",
    get: function get() {
      return this.obj[this.modelClass.uidProp];
    }
  }, {
    key: "parentNode",
    get: function get() {
      if (this.parentEdge) {
        return this.parentEdge.ownerNode;
      } else {
        return null;
      }
    }
  }, {
    key: "indexInRelation",
    get: function get() {
      if (this.parentEdge) {
        return this.parentEdge.relationIndex;
      } else {
        return null;
      }
    }
  }, {
    key: "relationName",
    get: function get() {
      if (this.parentEdge) {
        return this.parentEdge.relation.name;
      } else {
        return null;
      }
    }
  }, {
    key: "relationPath",
    get: function get() {
      if (this._relationPath === NOT_CALCULATED) {
        this._relationPath = this._createRelationPath();
      }

      return this._relationPath;
    }
  }, {
    key: "relationPathKey",
    get: function get() {
      if (this._relationPathKey === NOT_CALCULATED) {
        this._relationPathKey = this._createRelationPathKey();
      }

      return this._relationPathKey;
    }
  }, {
    key: "dataPath",
    get: function get() {
      if (this._dataPath === NOT_CALCULATED) {
        this._dataPath = this._createDataPath();
      }

      return this._dataPath;
    }
  }, {
    key: "dataPathKey",
    get: function get() {
      if (this._dataPathKey === NOT_CALCULATED) {
        this._dataPathKey = this._createDataPathKey();
      }

      return this._dataPathKey;
    }
  }, {
    key: "idPath",
    get: function get() {
      if (this._idPath === NOT_CALCULATED) {
        this._idPath = this._createIdPath();
      }

      return this._idPath;
    }
  }, {
    key: "idPathKey",
    get: function get() {
      if (this._idPathKey === NOT_CALCULATED) {
        this._idPathKey = this._createIdPathKey();
      }

      return this._idPathKey;
    }
    /**
     * If this node is a reference, returns the referred node.
     */

  }, {
    key: "referencedNode",
    get: function get() {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.refEdges[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var edge = _step2.value;

          if (edge.refType === ModelGraphEdge.ReferenceType.Object && edge.isOwnerNode(this)) {
            return edge.relatedNode;
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

      return null;
    }
    /**
     * Returns all nodes that are references to this node.
     */

  }, {
    key: "referencingNodes",
    get: function get() {
      var nodes = [];
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.refEdges[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var edge = _step3.value;

          if (edge.refType === ModelGraphEdge.ReferenceType.Object && edge.isRelatedNode(this)) {
            nodes.push(edge.ownerNode);
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

      return nodes;
    }
  }, {
    key: "descendantRelationNodes",
    get: function get() {
      return this._collectDescendantRelationNodes([]);
    }
  }]);

  return ModelGraphNode;
}();

module.exports = {
  ModelGraphNode: ModelGraphNode
};