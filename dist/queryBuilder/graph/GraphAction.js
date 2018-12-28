"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _require = require('../../utils/knexUtils'),
    isPostgres = _require.isPostgres;

var _require2 = require('../../utils/objectUtils'),
    asArray = _require2.asArray;

var POSTGRES_MAX_INSERT_BATCH_SIZE = 100;
var MAX_CONCURRENCY = 100;

var GraphAction =
/*#__PURE__*/
function () {
  function GraphAction() {
    _classCallCheck(this, GraphAction);
  }

  _createClass(GraphAction, [{
    key: "run",
    value: function run(builder) {
      return null;
    }
  }, {
    key: "_getConcurrency",
    value: function _getConcurrency(builder, nodes) {
      return nodes.reduce(function (minConcurrency, node) {
        return Math.min(minConcurrency, node.modelClass.getConcurrency(builder.unsafeKnex()));
      }, MAX_CONCURRENCY);
    }
  }, {
    key: "_getBatchSize",
    value: function _getBatchSize(builder) {
      return isPostgres(builder.unsafeKnex()) ? POSTGRES_MAX_INSERT_BATCH_SIZE : 1;
    }
  }, {
    key: "_resolveReferences",
    value: function _resolveReferences(node) {
      if (node.isDbReference) {
        this._resolveDbReference(node);
      }

      if (node.isReference) {
        this._resolveReference(node);
      }
    }
  }, {
    key: "_resolveDbReference",
    value: function _resolveDbReference(node) {
      var dbRef = asArray(node.dbReference);
      var relatedProp = node.parentEdge.relation.relatedProp;

      for (var i = 0, l = relatedProp.size; i < l; ++i) {
        relatedProp.setProp(node.obj, i, dbRef[i]);
      }
    }
  }, {
    key: "_resolveReference",
    value: function _resolveReference(node) {
      var refNode = node.referencedNode;

      var _arr = Object.keys(refNode.obj);

      for (var _i = 0; _i < _arr.length; _i++) {
        var prop = _arr[_i];

        if (!node.obj.hasOwnProperty(prop)) {
          node.obj[prop] = refNode.obj[prop];
        }
      }
    }
  }], [{
    key: "ReturningAllSelector",
    get: function get() {
      return function (op) {
        // Only select `returning('*')` operation.
        return op.name === 'returning' && op.args.includes('*');
      };
    }
  }]);

  return GraphAction;
}();

module.exports = {
  GraphAction: GraphAction
};