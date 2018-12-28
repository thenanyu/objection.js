'use strict';

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var RelationInsertOperation = require('../RelationInsertOperation');

var _require = require('../../utils/promiseUtils'),
    after = _require.after;

var BelongsToOneInsertOperation =
/*#__PURE__*/
function (_RelationInsertOperat) {
  _inherits(BelongsToOneInsertOperation, _RelationInsertOperat);

  function BelongsToOneInsertOperation() {
    _classCallCheck(this, BelongsToOneInsertOperation);

    return _possibleConstructorReturn(this, _getPrototypeOf(BelongsToOneInsertOperation).apply(this, arguments));
  }

  _createClass(BelongsToOneInsertOperation, [{
    key: "onAdd",
    value: function onAdd(builder, args) {
      var retVal = _get(_getPrototypeOf(BelongsToOneInsertOperation.prototype), "onAdd", this).call(this, builder, args);

      if (this.models.length > 1) {
        throw this.relation.createError('can only insert one model to a BelongsToOneRelation');
      }

      return retVal;
    }
  }, {
    key: "onAfter1",
    value: function onAfter1(builder, ret) {
      var _this = this;

      var maybePromise = _get(_getPrototypeOf(BelongsToOneInsertOperation.prototype), "onAfter1", this).call(this, builder, ret);

      var owner = this.owner;
      var ownerProp = this.relation.ownerProp;
      var relatedProp = this.relation.relatedProp;
      return after(maybePromise, function (inserted) {
        var patch = {};

        for (var i = 0, l = ownerProp.size; i < l; ++i) {
          var relatedValue = relatedProp.getProp(inserted[0], i);
          ownerProp.setProp(_this.owner, i, relatedValue);
          ownerProp.patch(patch, i, relatedValue);
        }

        if (_this.assignResultToOwner) {
          owner.$setRelated(_this.relation, inserted);
        }

        return _this.owner.$query().childQueryOf(builder).patch(patch).return(inserted);
      });
    }
  }]);

  return BelongsToOneInsertOperation;
}(RelationInsertOperation);

module.exports = BelongsToOneInsertOperation;