'use strict'; // This mixin contains the shared code for all modify operations (update, delete, relate, unrelate)
// for ManyToManyRelation operations.
//
// The most important thing this mixin does is that it moves the filters from the main query
// into a subquery and then adds a single where clause that uses the subquery. This is done so
// that we are able to `innerJoin` the join table to the query. Most SQL engines don't allow
// joins in updates or deletes. Join table is joined so that queries can reference the join
// table columns.

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

var ManyToManyModifyMixin = function ManyToManyModifyMixin(Operation) {
  return (
    /*#__PURE__*/
    function (_Operation) {
      _inherits(_class, _Operation);

      function _class() {
        var _getPrototypeOf2;

        var _this;

        _classCallCheck(this, _class);

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(_class)).call.apply(_getPrototypeOf2, [this].concat(args)));
        _this.modifyFilterSubquery = null;
        return _this;
      }

      _createClass(_class, [{
        key: "onBuild",
        // At this point `builder` should only have the user's own wheres and joins. There can
        // be other operations (like orderBy) too, but those are meaningless with modify operations.
        value: function onBuild(builder) {
          this.modifyFilterSubquery = this.createModifyFilterSubquery(builder);

          if (this.modifyMainQuery) {
            // We can now remove the where and join statements from the main query.
            this.removeFiltersFromMainQuery(builder); // Add a single where clause that uses the created subquery.

            this.applyModifyFilterForRelatedTable(builder);
          }

          return _get(_getPrototypeOf(_class.prototype), "onBuild", this).call(this, builder);
        }
      }, {
        key: "createModifyFilterSubquery",
        value: function createModifyFilterSubquery(builder) {
          var relatedModelClass = this.relation.relatedModelClass;
          var builderClass = builder.constructor;
          var ownerProp = this.relation.ownerProp;
          var ownerIds = [ownerProp.getProps(this.owner)]; // Create an empty subquery.

          var modifyFilterSubquery = relatedModelClass.query().childQueryOf(builder); // Add the necessary joins and wheres so that only rows related to
          // `this.owner` are selected.

          this.relation.findQuery(modifyFilterSubquery, {
            ownerIds: ownerIds
          }); // Copy all where and join statements from the main query to the subquery.

          modifyFilterSubquery.copyFrom(builder, builderClass.WhereSelector).copyFrom(builder, builderClass.JoinSelector);
          return modifyFilterSubquery;
        }
      }, {
        key: "removeFiltersFromMainQuery",
        value: function removeFiltersFromMainQuery(builder) {
          var builderClass = builder.constructor;
          builder.clear(builderClass.WhereSelector);
          builder.clear(builderClass.JoinSelector);
        }
      }, {
        key: "applyModifyFilterForRelatedTable",
        value: function applyModifyFilterForRelatedTable(builder) {
          var idRefs = this.relation.relatedModelClass.getIdRelationProperty().refs(builder);
          var subquery = this.modifyFilterSubquery.clone().select(idRefs);
          return builder.whereInComposite(idRefs, subquery);
        }
      }, {
        key: "applyModifyFilterForJoinTable",
        value: function applyModifyFilterForJoinTable(builder) {
          var joinTableOwnerRefs = this.relation.joinTableOwnerProp.refs(builder);
          var joinTableRelatedRefs = this.relation.joinTableRelatedProp.refs(builder);
          var relatedRefs = this.relation.relatedProp.refs(builder);
          var ownerIds = this.relation.ownerProp.getProps(this.owner);
          var subquery = this.modifyFilterSubquery.clone().select(relatedRefs);
          return builder.whereInComposite(joinTableRelatedRefs, subquery).whereComposite(joinTableOwnerRefs, ownerIds);
        }
      }, {
        key: "modifyMainQuery",
        get: function get() {
          return true;
        }
      }]);

      return _class;
    }(Operation)
  );
};

module.exports = ManyToManyModifyMixin;