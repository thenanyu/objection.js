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

var ManyToManyModifyMixin = require('./ManyToManyModifyMixin'); // We need to override this mixin for mysql because mysql doesn't
// allow referencing the updated/deleted table directly in a subquery.
// We need to wrap the subquery into yet another subquery (sigh).


var ManyToManyMySqlModifyMixin = function ManyToManyMySqlModifyMixin(Operation) {
  return (
    /*#__PURE__*/
    function (_ManyToManyModifyMixi) {
      _inherits(_class, _ManyToManyModifyMixi);

      function _class() {
        _classCallCheck(this, _class);

        return _possibleConstructorReturn(this, _getPrototypeOf(_class).apply(this, arguments));
      }

      _createClass(_class, [{
        key: "createModifyFilterSubquery",
        value: function createModifyFilterSubquery(builder) {
          var modifyFilterSubquery = _get(_getPrototypeOf(_class.prototype), "createModifyFilterSubquery", this).call(this, builder);

          return this.wrapIntoYetAnotherSubquery(builder, modifyFilterSubquery);
        }
      }, {
        key: "wrapIntoYetAnotherSubquery",
        value: function wrapIntoYetAnotherSubquery(builder, modifyFilterSubquery) {
          var relatedModelClass = this.relation.relatedModelClass;
          var tableRef = builder.tableRefFor(relatedModelClass.getTableName());
          return relatedModelClass.query().childQueryOf(builder).from(modifyFilterSubquery.as(tableRef));
        }
      }]);

      return _class;
    }(ManyToManyModifyMixin(Operation))
  );
};

module.exports = ManyToManyMySqlModifyMixin;