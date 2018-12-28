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

var promiseUtils = require('../../../utils/promiseUtils');

var _require = require('../GraphAction'),
    GraphAction = _require.GraphAction;

var _require2 = require('../../../utils/objectUtils'),
    union = _require2.union,
    difference = _require2.difference,
    isObject = _require2.isObject;

var GraphPatchAction =
/*#__PURE__*/
function (_GraphAction) {
  _inherits(GraphPatchAction, _GraphAction);

  function GraphPatchAction(_ref) {
    var _this;

    var nodes = _ref.nodes,
        graph = _ref.graph,
        currentGraph = _ref.currentGraph,
        graphOptions = _ref.graphOptions;

    _classCallCheck(this, GraphPatchAction);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(GraphPatchAction).call(this)); // Nodes to patch.

    _this.nodes = nodes;
    _this.graph = graph;
    _this.currentGraph = currentGraph;
    _this.graphOptions = graphOptions;
    return _this;
  }

  _createClass(GraphPatchAction, [{
    key: "run",
    value: function run(builder) {
      var _this2 = this;

      return promiseUtils.map(this.nodes, function (node) {
        return _this2._runForNode(builder, node);
      }, {
        concurrency: this._getConcurrency(builder, this.nodes)
      });
    }
  }, {
    key: "_runForNode",
    value: function _runForNode(builder, node) {
      var shouldPatch = this.graphOptions.shouldPatch(node, this.currentGraph);
      var shouldUpdate = this.graphOptions.shouldUpdate(node, this.currentGraph); // BelongsToOneRelation inserts and relates change the parent object's
      // properties. That's why we handle them here.

      var changedPropsBecauseOfBelongsToOneInsert = this._handleBelongsToOneInserts(node); // BelongsToOneRelation deletes and unrelates change the parent object's
      // properties. That's why we handle them here.


      var changePropsBecauseOfBelongsToOneDelete = this._handleBelongsToOneDeletes(node);

      var _this$_findChanges = this._findChanges(node),
          changedProps = _this$_findChanges.changedProps,
          unchangedProps = _this$_findChanges.unchangedProps;

      var allProps = union(changedProps, unchangedProps);
      var propsToUpdate = difference(shouldPatch || shouldUpdate ? changedProps : [].concat(_toConsumableArray(changedPropsBecauseOfBelongsToOneInsert), _toConsumableArray(changePropsBecauseOfBelongsToOneDelete)), // Remove id properties from the props to update. With upsertGraph
      // it never makes sense to change the id.
      node.modelClass.getIdPropertyArray());

      if (propsToUpdate.length === 0) {
        return null;
      }

      delete node.obj[node.modelClass.uidRefProp];
      delete node.obj[node.modelClass.dbRefProp];
      node.obj.$validate(null, {
        dataPath: node.dataPathKey,
        patch: shouldPatch || !shouldPatch && !shouldUpdate
      }); // Don't update the fields that we know not to change.

      node.obj.$omitFromDatabaseJson(difference(allProps, propsToUpdate));
      node.userData.updated = true;

      var updateBuilder = this._createBuilder(node).childQueryOf(builder).copyFrom(builder, GraphAction.ReturningAllSelector);

      if (shouldPatch) {
        updateBuilder.patch(node.obj);
      } else {
        updateBuilder.update(node.obj);
      }

      return updateBuilder.execute().then(function (result) {
        if (isObject(result) && result.$isObjectionModel) {
          // Handle returning('*').
          node.obj.$set(result);
        }

        return result;
      });
    }
  }, {
    key: "_handleBelongsToOneInserts",
    value: function _handleBelongsToOneInserts(node) {
      var currentNode = this.currentGraph.nodeForNode(node);
      var updatedProps = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = node.edges[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var edge = _step.value;

          if (edge.isOwnerNode(node) && edge.relation && edge.relation.isObjectionBelongsToOneRelation && edge.relation.relatedProp.hasProps(edge.relatedNode.obj)) {
            var relation = edge.relation;

            for (var i = 0, l = relation.ownerProp.size; i < l; ++i) {
              var currentValue = currentNode && relation.ownerProp.getProp(currentNode.obj, i);
              var relatedValue = relation.relatedProp.getProp(edge.relatedNode.obj, i);

              if (currentValue != relatedValue) {
                relation.ownerProp.setProp(node.obj, i, relatedValue);
                updatedProps.push(relation.ownerProp.props[i]);
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

      return updatedProps;
    }
  }, {
    key: "_handleBelongsToOneDeletes",
    value: function _handleBelongsToOneDeletes(node) {
      var currentNode = this.currentGraph.nodeForNode(node);
      var updatedProps = [];

      if (!currentNode) {
        return updatedProps;
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = currentNode.edges[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var edge = _step2.value;

          if (edge.isOwnerNode(currentNode) && edge.relation.isObjectionBelongsToOneRelation && node.obj[edge.relation.name] === null && this.graphOptions.shouldDeleteOrUnrelate(edge.relatedNode, this.graph)) {
            var relation = edge.relation;

            for (var i = 0, l = relation.ownerProp.size; i < l; ++i) {
              var currentValue = relation.ownerProp.getProp(currentNode.obj, i);

              if (currentValue != null) {
                relation.ownerProp.setProp(node.obj, i, null);
                updatedProps.push(relation.ownerProp.props[i]);
              }
            }
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

      return updatedProps;
    }
  }, {
    key: "_findChanges",
    value: function _findChanges(node) {
      var obj = node.obj;
      var currentNode = this.currentGraph.nodeForNode(node);
      var currentObj = currentNode && currentNode.obj || {};
      var relations = node.modelClass.getRelations();
      var unchangedProps = [];
      var changedProps = [];

      var _arr = Object.keys(obj);

      for (var _i = 0; _i < _arr.length; _i++) {
        var prop = _arr[_i];

        if (prop[0] === '$' || relations[prop]) {
          continue;
        }

        var value = obj[prop];
        var currentValue = currentObj[prop]; // If the current object doesn't have the property, we have to assume
        // it changes (we cannot know if it will). If the object does have the
        // property, we test non-strict equality. See issue #732.

        if (currentValue === undefined || currentValue != value) {
          changedProps.push(prop);
        } else {
          unchangedProps.push(prop);
        }
      } // We cannot know if the query properties cause changes to the values.
      // We must assume that they do.


      if (obj.$$queryProps) {
        changedProps.push.apply(changedProps, _toConsumableArray(Object.keys(obj.$$queryProps)));
      }

      return {
        changedProps: changedProps,
        unchangedProps: unchangedProps
      };
    }
  }, {
    key: "_createBuilder",
    value: function _createBuilder(node) {
      var currentNode = this.currentGraph.nodeForNode(node);

      if (currentNode && currentNode.parentEdge) {
        return this._createRelatedBuilder(node);
      } else {
        return this._createRootBuilder(node);
      }
    }
  }, {
    key: "_createRelatedBuilder",
    value: function _createRelatedBuilder(node) {
      return node.parentNode.obj.$relatedQuery(node.parentEdge.relation.name).findById(node.obj.$id());
    }
  }, {
    key: "_createRootBuilder",
    value: function _createRootBuilder(node) {
      return node.obj.$query();
    }
  }]);

  return GraphPatchAction;
}(GraphAction);

module.exports = {
  GraphPatchAction: GraphPatchAction
};