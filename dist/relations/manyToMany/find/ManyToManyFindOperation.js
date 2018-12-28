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

var RelationFindOperation = require('../../RelationFindOperation');

var _require = require('../../../utils/tmpColumnUtils'),
    getTempColumn = _require.getTempColumn;

var _require2 = require('../../../utils/objectUtils'),
    uniqBy = _require2.uniqBy;

var ManyToManyFindOperation =
/*#__PURE__*/
function (_RelationFindOperatio) {
  _inherits(ManyToManyFindOperation, _RelationFindOperatio);

  function ManyToManyFindOperation(name, opt) {
    var _this;

    _classCallCheck(this, ManyToManyFindOperation);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ManyToManyFindOperation).call(this, name, opt));
    _this.ownerJoinColumnAlias = new Array(_this.relation.joinTableOwnerProp.size);

    for (var i = 0, l = _this.ownerJoinColumnAlias.length; i < l; ++i) {
      _this.ownerJoinColumnAlias[i] = getTempColumn(i);
    }

    return _this;
  }

  _createClass(ManyToManyFindOperation, [{
    key: "onBuild",
    value: function onBuild(builder) {
      var relatedModelClass = this.relation.relatedModelClass;
      var joinTableOwnerProp = this.relation.joinTableOwnerProp;
      var ownerProp = this.relation.ownerProp;
      var ids = new Array(this.owners.length);

      for (var i = 0, l = this.owners.length; i < l; ++i) {
        ids[i] = ownerProp.getProps(this.owners[i]);
      }

      this.relation.findQuery(builder, {
        ownerIds: uniqBy(ids, join)
      });

      if (!builder.has(builder.constructor.SelectSelector)) {
        var table = builder.tableRefFor(relatedModelClass.getTableName()); // If the user hasn't specified a select clause, select the related model's columns.
        // If we don't do this we also get the join table's columns.

        builder.select("".concat(table, ".*")); // Also select all extra columns.

        for (var _i = 0, _l = this.relation.joinTableExtras.length; _i < _l; ++_i) {
          var extra = this.relation.joinTableExtras[_i];
          var joinTable = builder.tableRefFor(this.relation.joinTable);
          builder.select("".concat(joinTable, ".").concat(extra.joinTableCol, " as ").concat(extra.aliasCol));
        }
      } // We must select the owner join columns so that we know for which owner model the related
      // models belong to after the requests.


      for (var _i2 = 0, _l2 = joinTableOwnerProp.size; _i2 < _l2; ++_i2) {
        var joinTableOwnerRef = joinTableOwnerProp.ref(builder, _i2);
        var propName = relatedModelClass.columnNameToPropertyName(this.ownerJoinColumnAlias[_i2]);
        builder.select(joinTableOwnerRef.as(this.ownerJoinColumnAlias[_i2])); // Mark them to be omitted later.

        this.omitProps.push(propName);
      }

      this.selectMissingJoinColumns(builder);
    }
  }, {
    key: "onAfter2",
    value: function onAfter2(builder, related) {
      var isOneToOne = this.relation.isOneToOne();

      if (this.assignResultToOwner) {
        var ownerProp = this.relation.ownerProp;
        var relatedByOwnerId = new Map();

        for (var i = 0, l = related.length; i < l; ++i) {
          var rel = related[i];
          var key = rel.$propKey(this.ownerJoinColumnAlias);
          var arr = relatedByOwnerId.get(key);

          if (!arr) {
            arr = [];
            relatedByOwnerId.set(key, arr);
          }

          arr.push(rel);
        }

        for (var _i3 = 0, _l3 = this.owners.length; _i3 < _l3; ++_i3) {
          var own = this.owners[_i3];

          var _key = ownerProp.propKey(own);

          var _related = relatedByOwnerId.get(_key);

          if (isOneToOne) {
            own[this.relationProperty] = _related && _related[0] || null;
          } else {
            own[this.relationProperty] = _related || [];
          }
        }
      }

      return related;
    }
  }]);

  return ManyToManyFindOperation;
}(RelationFindOperation);

function join(arr) {
  return arr.join();
}

module.exports = ManyToManyFindOperation;