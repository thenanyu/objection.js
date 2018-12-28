'use strict';

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var normalizeIds = require('../../utils/normalizeIds');

var RelateOperation = require('../../queryBuilder/operations/RelateOperation');

var BelongsToOneRelateOperation =
/*#__PURE__*/
function (_RelateOperation) {
  _inherits(BelongsToOneRelateOperation, _RelateOperation);

  function BelongsToOneRelateOperation() {
    _classCallCheck(this, BelongsToOneRelateOperation);

    return _possibleConstructorReturn(this, _getPrototypeOf(BelongsToOneRelateOperation).apply(this, arguments));
  }

  _createClass(BelongsToOneRelateOperation, [{
    key: "onAdd",
    value: function onAdd(builder, args) {
      this.input = args[0];
      this.ids = normalizeIds(args[0], this.relation.relatedProp, {
        arrayOutput: true
      });

      if (this.ids.length > 1) {
        throw this.relation.createError('can only relate one model to a BelongsToOneRelation');
      }

      return true;
    }
  }, {
    key: "queryExecutor",
    value: function queryExecutor(builder) {
      var patch = {};
      var ownerProp = this.relation.ownerProp;
      var idColumn = builder.fullIdColumnFor(this.relation.ownerModelClass);

      for (var i = 0, l = ownerProp.size; i < l; ++i) {
        var relatedValue = this.ids[0][i];
        ownerProp.setProp(this.owner, i, relatedValue);
        ownerProp.patch(patch, i, relatedValue);
      }

      return this.relation.ownerModelClass.query().childQueryOf(builder).copyFrom(builder, builder.constructor.WhereSelector).patch(patch).whereComposite(idColumn, this.owner.$id());
    }
  }]);

  return BelongsToOneRelateOperation;
}(RelateOperation);

module.exports = BelongsToOneRelateOperation;