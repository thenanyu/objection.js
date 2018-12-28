"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var NO_RELATE = 'noRelate';
var NO_UNRELATE = 'noUnrelate';
var NO_INSERT = 'noInsert';
var NO_UPDATE = 'noUpdate';
var NO_DELETE = 'noDelete';
var UPDATE = 'update';
var RELATE = 'relate';
var UNRELATE = 'unrelate';
var INSERT_MISSING = 'insertMissing';

var GraphOptions =
/*#__PURE__*/
function () {
  function GraphOptions(options) {
    _classCallCheck(this, GraphOptions);

    if (options instanceof GraphOptions) {
      this.options = options.options;
    } else {
      this.options = options;
    }
  }

  _createClass(GraphOptions, [{
    key: "isInsertOnly",
    value: function isInsertOnly() {
      var _this = this;

      // NO_RELATE is not in the list, since the `insert only` mode does
      // relate things that can be related using inserts.
      return [NO_DELETE, NO_UPDATE, NO_UNRELATE, INSERT_MISSING].every(function (opt) {
        return _this.options[opt] === true;
      });
    }
  }, {
    key: "shouldRelateIgnoreDisable",
    value: function shouldRelateIgnoreDisable(node, currentGraph) {
      if (node.isReference || node.isDbReference) {
        return true;
      }

      return !getCurrentNode(node, currentGraph) && this._hasOption(node, RELATE) && !!node.parentEdge && !!node.parentEdge.relation && node.parentEdge.relation.hasRelateProp(node.obj);
    }
  }, {
    key: "shouldRelate",
    value: function shouldRelate(node, currentGraph) {
      return !this._hasOption(node, NO_RELATE) && this.shouldRelateIgnoreDisable(node, currentGraph);
    }
  }, {
    key: "shouldInsertIgnoreDisable",
    value: function shouldInsertIgnoreDisable(node, currentGraph) {
      return !getCurrentNode(node, currentGraph) && !this.shouldRelateIgnoreDisable(node, currentGraph) && (!node.obj.$hasId() || this._hasOption(node, INSERT_MISSING));
    }
  }, {
    key: "shouldInsert",
    value: function shouldInsert(node, currentGraph) {
      return !this._hasOption(node, NO_INSERT) && this.shouldInsertIgnoreDisable(node, currentGraph);
    }
  }, {
    key: "shouldPatchOrUpdateIgnoreDisable",
    value: function shouldPatchOrUpdateIgnoreDisable(node, currentGraph) {
      if (this.shouldRelate(node)) {
        // We should update all nodes that are going to be related. Note that
        // we don't actually update anything unless there is something to update
        // so this is just a preliminary test.
        return true;
      }

      return !!getCurrentNode(node, currentGraph);
    }
  }, {
    key: "shouldPatch",
    value: function shouldPatch(node, currentGraph) {
      return this.shouldPatchOrUpdateIgnoreDisable(node, currentGraph) && !this._hasOption(node, NO_UPDATE) && !this._hasOption(node, UPDATE);
    }
  }, {
    key: "shouldUpdate",
    value: function shouldUpdate(node, currentGraph) {
      return this.shouldPatchOrUpdateIgnoreDisable(node, currentGraph) && !this._hasOption(node, NO_UPDATE) && this._hasOption(node, UPDATE);
    }
  }, {
    key: "shouldUnrelateIgnoreDisable",
    value: function shouldUnrelateIgnoreDisable(currentNode) {
      return this._hasOption(currentNode, UNRELATE);
    }
  }, {
    key: "shouldUnrelate",
    value: function shouldUnrelate(currentNode, graph) {
      return !getNode(currentNode, graph) && !this._hasOption(currentNode, NO_UNRELATE) && this.shouldUnrelateIgnoreDisable(currentNode);
    }
  }, {
    key: "shouldDelete",
    value: function shouldDelete(currentNode, graph) {
      return !getNode(currentNode, graph) && !this._hasOption(currentNode, NO_DELETE) && !this.shouldUnrelateIgnoreDisable(currentNode);
    }
  }, {
    key: "shouldInsertOrRelate",
    value: function shouldInsertOrRelate(node, currentGraph) {
      return this.shouldInsert(node, currentGraph) || this.shouldRelate(node, currentGraph);
    }
  }, {
    key: "shouldDeleteOrUnrelate",
    value: function shouldDeleteOrUnrelate(currentNode, graph) {
      return this.shouldDelete(currentNode, graph) || this.shouldUnrelate(currentNode, graph);
    }
  }, {
    key: "rebasedOptions",
    value: function rebasedOptions(newRoot) {
      var newOpt = {};
      var newRootRelationPath = newRoot.relationPathKey;

      var _arr = Object.keys(this.options);

      for (var _i = 0; _i < _arr.length; _i++) {
        var name = _arr[_i];
        var value = this.options[name];

        if (Array.isArray(value)) {
          newOpt[name] = value.filter(function (it) {
            return it.startsWith(newRootRelationPath);
          }).map(function (it) {
            return it.slice(newRootRelationPath.length + 1);
          }).filter(function (it) {
            return !!it;
          });
        } else {
          newOpt[name] = value;
        }
      }

      return new GraphOptions(newOpt);
    }
  }, {
    key: "_hasOption",
    value: function _hasOption(node, optionName) {
      var option = this.options[optionName];

      if (Array.isArray(option)) {
        return option.indexOf(node.relationPathKey) !== -1;
      } else {
        return !!option;
      }
    }
  }]);

  return GraphOptions;
}();

function getCurrentNode(node, currentGraph) {
  if (!currentGraph || !node) {
    return null;
  }

  return currentGraph.nodeForNode(node);
}

function getNode(currentNode, graph) {
  if (!graph || !currentNode) {
    return null;
  }

  return graph.nodeForNode(currentNode);
}

module.exports = {
  GraphOptions: GraphOptions
};