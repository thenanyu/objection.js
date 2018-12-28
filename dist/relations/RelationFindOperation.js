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

var FindOperation = require('../queryBuilder/operations/FindOperation');

var _require = require('../utils/objectUtils'),
    uniqBy = _require.uniqBy;

var RelationFindOperation =
/*#__PURE__*/
function (_FindOperation) {
  _inherits(RelationFindOperation, _FindOperation);

  function RelationFindOperation(name, opt) {
    var _this;

    _classCallCheck(this, RelationFindOperation);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(RelationFindOperation).call(this, name, opt));
    _this.relation = opt.relation;
    _this.owners = opt.owners;
    _this.alwaysReturnArray = false;
    _this.assignResultToOwner = true;
    _this.relationProperty = opt.relationProperty || _this.relation.name;
    _this.omitProps = [];
    return _this;
  }

  _createClass(RelationFindOperation, [{
    key: "onBuild",
    value: function onBuild(builder) {
      var ids = new Array(this.owners.length);

      for (var i = 0, l = this.owners.length; i < l; ++i) {
        ids[i] = this.relation.ownerProp.getProps(this.owners[i]);
      }

      this.relation.findQuery(builder, {
        ownerIds: uniqBy(ids, join)
      });
      this.selectMissingJoinColumns(builder);
    }
  }, {
    key: "onAfter2",
    value: function onAfter2(builder, related) {
      var isOneToOne = this.relation.isOneToOne();

      if (this.assignResultToOwner) {
        var owners = this.owners;
        var relatedByOwnerId = new Map();

        for (var i = 0, l = related.length; i < l; ++i) {
          var rel = related[i];
          var key = this.relation.relatedProp.propKey(rel);
          var arr = relatedByOwnerId.get(key);

          if (!arr) {
            arr = [];
            relatedByOwnerId.set(key, arr);
          }

          arr.push(rel);
        }

        for (var _i = 0, _l = owners.length; _i < _l; ++_i) {
          var own = owners[_i];

          var _key = this.relation.ownerProp.propKey(own);

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
  }, {
    key: "onAfter3",
    value: function onAfter3(builder, related) {
      var isOneToOne = this.relation.isOneToOne();
      var intOpt = builder.internalOptions();

      if (!intOpt.keepImplicitJoinProps) {
        this.omitImplicitJoinProps(related);
      }

      if (!this.alwaysReturnArray && isOneToOne && related.length <= 1) {
        related = related[0] || undefined;
      }

      return _get(_getPrototypeOf(RelationFindOperation.prototype), "onAfter3", this).call(this, builder, related);
    }
  }, {
    key: "selectMissingJoinColumns",
    value: function selectMissingJoinColumns(builder) {
      var relatedProp = this.relation.relatedProp;
      var addedSelects = [];

      for (var c = 0, lc = relatedProp.size; c < lc; ++c) {
        var fullCol = relatedProp.fullCol(builder, c);
        var prop = relatedProp.props[c];
        var col = relatedProp.cols[c];

        if (!builder.hasSelectionAs(fullCol, col) && addedSelects.indexOf(fullCol) === -1) {
          this.omitProps.push(prop);
          addedSelects.push(fullCol);
        }
      }

      if (addedSelects.length) {
        builder.select(addedSelects);
      }
    }
  }, {
    key: "omitImplicitJoinProps",
    value: function omitImplicitJoinProps(related) {
      var relatedModelClass = this.relation.relatedModelClass;

      if (!this.omitProps.length || !related) {
        return related;
      }

      if (!Array.isArray(related)) {
        return this.omitImplicitJoinPropsFromOne(relatedModelClass, related);
      }

      if (!related.length) {
        return related;
      }

      for (var i = 0, l = related.length; i < l; ++i) {
        this.omitImplicitJoinPropsFromOne(relatedModelClass, related[i]);
      }

      return related;
    }
  }, {
    key: "omitImplicitJoinPropsFromOne",
    value: function omitImplicitJoinPropsFromOne(relatedModelClass, model) {
      for (var c = 0, lc = this.omitProps.length; c < lc; ++c) {
        relatedModelClass.omitImpl(model, this.omitProps[c]);
      }

      return model;
    }
  }]);

  return RelationFindOperation;
}(FindOperation);

function join(arr) {
  return arr.join();
}

module.exports = RelationFindOperation;