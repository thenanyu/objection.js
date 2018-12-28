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
    chunk = _require2.chunk;

var promiseUtils = require('../../../utils/promiseUtils');

var JoinRowGraphInsertAction =
/*#__PURE__*/
function (_GraphAction) {
  _inherits(JoinRowGraphInsertAction, _GraphAction);

  function JoinRowGraphInsertAction(_ref) {
    var _this;

    var nodes = _ref.nodes,
        currentGraph = _ref.currentGraph,
        graphOptions = _ref.graphOptions;

    _classCallCheck(this, JoinRowGraphInsertAction);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(JoinRowGraphInsertAction).call(this));
    _this.nodes = nodes;
    _this.currentGraph = currentGraph;
    _this.graphOptions = graphOptions;
    return _this;
  }

  _createClass(JoinRowGraphInsertAction, [{
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

      var nodesByModel = groupBy(this.nodes, function (node) {
        return getJoinTableModel(builder, node);
      });
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = nodesByModel.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _step$value = _slicedToArray(_step.value, 2),
              joinTableModelClass = _step$value[0],
              nodes = _step$value[1];

          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = chunk(nodes, batchSize)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var nodeBatch = _step2.value;
              batches.push(this._createBatch(joinTableModelClass, nodeBatch));
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
    key: "_createBatch",
    value: function _createBatch(joinTableModelClass, nodes) {
      var _this3 = this;

      return nodes.filter(function (node) {
        return _this3.graphOptions.shouldRelate(node, _this3.currentGraph) || node.userData.inserted;
      }).map(function (node) {
        return {
          node: node,
          joinTableModelClass: joinTableModelClass,
          joinTableObj: _this3._createJoinTableObj(joinTableModelClass, node)
        };
      });
    }
  }, {
    key: "_createJoinTableObj",
    value: function _createJoinTableObj(joinTableModelClass, node) {
      var parentEdge = node.parentEdge,
          parentNode = node.parentNode;
      var relation = parentEdge.relation;

      this._resolveReferences(node);

      return joinTableModelClass.fromJson(relation.createJoinModel(relation.ownerProp.getProps(parentNode.obj), node.obj));
    }
  }, {
    key: "_insertBatch",
    value: function _insertBatch(parentBuilder, batch) {
      var _this4 = this;

      return this._beforeInsert(parentBuilder, batch).then(function () {
        return _this4._insert(parentBuilder, batch);
      });
    }
  }, {
    key: "_beforeInsert",
    value: function _beforeInsert(parentBuilder, batch) {
      return Promise.all(batch.map(function (_ref2) {
        var node = _ref2.node,
            joinTableObj = _ref2.joinTableObj;

        if (node.parentEdge) {
          return node.parentEdge.relation.joinTableBeforeInsert(joinTableObj, parentBuilder.context());
        } else {
          return null;
        }
      }));
    }
  }, {
    key: "_insert",
    value: function _insert(parentBuilder, batch) {
      if (batch.length > 0) {
        return batch[0].joinTableModelClass.query().childQueryOf(parentBuilder).insert(batch.map(function (it) {
          return it.joinTableObj;
        }));
      }
    }
  }]);

  return JoinRowGraphInsertAction;
}(GraphAction);

function getJoinTableModel(builder, node) {
  return node.parentEdge.relation.getJoinModelClass(builder.unsafeKnex());
}

module.exports = {
  JoinRowGraphInsertAction: JoinRowGraphInsertAction
};