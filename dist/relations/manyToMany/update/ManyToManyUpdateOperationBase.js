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

var UpdateOperation = require('../../../queryBuilder/operations/UpdateOperation');

var ManyToManyUpdateOperationBase =
/*#__PURE__*/
function (_UpdateOperation) {
  _inherits(ManyToManyUpdateOperationBase, _UpdateOperation);

  function ManyToManyUpdateOperationBase(name, opt) {
    var _this;

    _classCallCheck(this, ManyToManyUpdateOperationBase);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ManyToManyUpdateOperationBase).call(this, name, opt));
    _this.relation = opt.relation;
    _this.owner = opt.owner;
    _this.hasExtraProps = false;
    _this.joinTablePatch = {};
    _this.joinTablePatchFilterQuery = null;
    return _this;
  }

  _createClass(ManyToManyUpdateOperationBase, [{
    key: "onAdd",
    value: function onAdd(builder, args) {
      var obj = args[0]; // Copy all extra properties to the `joinTablePatch` object.

      for (var i = 0; i < this.relation.joinTableExtras.length; ++i) {
        var extra = this.relation.joinTableExtras[i];

        if (extra.aliasProp in obj) {
          this.hasExtraProps = true;
          this.joinTablePatch[extra.joinTableProp] = obj[extra.aliasProp];
        }
      }

      var res = _get(_getPrototypeOf(ManyToManyUpdateOperationBase.prototype), "onAdd", this).call(this, builder, args);

      if (this.hasExtraProps) {
        // Make sure we don't try to insert the extra properties
        // to the target table.
        this.relation.omitExtraProps([this.model]);
      }

      return res;
    }
  }, {
    key: "onAfter1",
    value: function onAfter1(builder, result) {
      if (this.hasExtraProps) {
        var joinTableUpdateQuery = this.relation.getJoinModelClass(builder.knex()).query().childQueryOf(builder).patch(this.joinTablePatch);
        return this.applyModifyFilterForJoinTable(joinTableUpdateQuery).return(result);
      } else {
        return result;
      }
    }
    /* istanbul ignore next */

  }, {
    key: "applyModifyFilterForRelatedTable",
    value: function applyModifyFilterForRelatedTable(builder) {
      throw new Error('not implemented');
    }
    /* istanbul ignore next */

  }, {
    key: "applyModifyFilterForJoinTable",
    value: function applyModifyFilterForJoinTable(builder) {
      throw new Error('not implemented');
    }
  }]);

  return ManyToManyUpdateOperationBase;
}(UpdateOperation);

module.exports = ManyToManyUpdateOperationBase;