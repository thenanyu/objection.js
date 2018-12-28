"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Type = {
  Relation: 'Relation',
  Reference: 'Reference'
};
var ReferenceType = {
  Object: 'Object',
  Property: 'Property'
};

var ModelGraphEdge =
/*#__PURE__*/
function () {
  function ModelGraphEdge(type, ownerNode, relatedNode) {
    var relation = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    var relationIndex = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

    _classCallCheck(this, ModelGraphEdge);

    this.type = type;
    this.ownerNode = ownerNode;
    this.relatedNode = relatedNode;
    this.relation = relation;
    this.relationIndex = relationIndex;
    this.refType = null;
    this.refMatch = null;
    this.refOwnerDataPath = null;
    this.refRelatedDataPath = null;
  }

  _createClass(ModelGraphEdge, [{
    key: "getOtherNode",
    value: function getOtherNode(node) {
      return this.isOwnerNode(node) ? this.relatedNode : this.ownerNode;
    }
  }, {
    key: "isOwnerNode",
    value: function isOwnerNode(node) {
      return node === this.ownerNode;
    }
  }, {
    key: "isRelatedNode",
    value: function isRelatedNode(node) {
      return node === this.relatedNode;
    }
  }], [{
    key: "Type",
    get: function get() {
      return Type;
    }
  }, {
    key: "ReferenceType",
    get: function get() {
      return ReferenceType;
    }
  }]);

  return ModelGraphEdge;
}();

module.exports = {
  ModelGraphEdge: ModelGraphEdge
};