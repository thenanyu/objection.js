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

var ManyToManyModifyMixin = require('./ManyToManyModifyMixin');

var SQLITE_BUILTIN_ROW_ID = '_rowid_'; // We need to override this mixin for sqlite because sqlite doesn't support
// multi-column where in statements with subqueries. We need to use the
// internal _rowid_ column instead.

var ManyToManySqliteModifyMixin = function ManyToManySqliteModifyMixin(Operation) {
  return (
    /*#__PURE__*/
    function (_ManyToManyModifyMixi) {
      _inherits(_class, _ManyToManyModifyMixi);

      function _class() {
        _classCallCheck(this, _class);

        return _possibleConstructorReturn(this, _getPrototypeOf(_class).apply(this, arguments));
      }

      _createClass(_class, [{
        key: "applyModifyFilterForRelatedTable",
        value: function applyModifyFilterForRelatedTable(builder) {
          var tableRef = builder.tableRefFor(this.relation.relatedModelClass.getTableName());
          var rowIdRef = "".concat(tableRef, ".").concat(SQLITE_BUILTIN_ROW_ID);
          var subquery = this.modifyFilterSubquery.clone().select(rowIdRef);
          return builder.whereInComposite(rowIdRef, subquery);
        }
      }, {
        key: "applyModifyFilterForJoinTable",
        value: function applyModifyFilterForJoinTable(builder) {
          var joinTableOwnerRefs = this.relation.joinTableOwnerProp.refs(builder);
          var tableRef = builder.tableRefFor(this.relation.getJoinModelClass(builder).getTableName());
          var rowIdRef = "".concat(tableRef, ".").concat(SQLITE_BUILTIN_ROW_ID);
          var ownerIds = this.relation.ownerProp.getProps(this.owner);
          var subquery = this.modifyFilterSubquery.clone().select(rowIdRef);
          return builder.whereInComposite(rowIdRef, subquery).whereComposite(joinTableOwnerRefs, ownerIds);
        }
      }]);

      return _class;
    }(ManyToManyModifyMixin(Operation))
  );
};

module.exports = ManyToManySqliteModifyMixin;