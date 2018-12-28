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

var getModel = function getModel() {
  return require('../../model/Model');
};

var Relation = require('../Relation');

var RelationProperty = require('../RelationProperty');

var _require = require('../../queryBuilder/ReferenceBuilder'),
    ref = _require.ref;

var _require2 = require('../../utils/knexUtils'),
    isSqlite = _require2.isSqlite,
    isMySql = _require2.isMySql;

var _require3 = require('../../model/inheritModel'),
    inheritModel = _require3.inheritModel;

var _require4 = require('../../utils/resolveModel'),
    resolveModel = _require4.resolveModel;

var _require5 = require('../../utils/promiseUtils'),
    mapAfterAllReturn = _require5.mapAfterAllReturn;

var _require6 = require('../../utils/objectUtils'),
    isFunction = _require6.isFunction,
    isObject = _require6.isObject;

var ManyToManyFindOperation = require('./find/ManyToManyFindOperation');

var ManyToManyInsertOperation = require('./insert/ManyToManyInsertOperation');

var ManyToManyRelateOperation = require('./relate/ManyToManyRelateOperation');

var ManyToManyUnrelateOperation = require('./unrelate/ManyToManyUnrelateOperation');

var ManyToManyUnrelateMySqlOperation = require('./unrelate/ManyToManyUnrelateMySqlOperation');

var ManyToManyUnrelateSqliteOperation = require('./unrelate/ManyToManyUnrelateSqliteOperation');

var ManyToManyUpdateOperation = require('./update/ManyToManyUpdateOperation');

var ManyToManyUpdateMySqlOperation = require('./update/ManyToManyUpdateMySqlOperation');

var ManyToManyUpdateSqliteOperation = require('./update/ManyToManyUpdateSqliteOperation');

var ManyToManyDeleteOperation = require('./delete/ManyToManyDeleteOperation');

var ManyToManyDeleteMySqlOperation = require('./delete/ManyToManyDeleteMySqlOperation');

var ManyToManyDeleteSqliteOperation = require('./delete/ManyToManyDeleteSqliteOperation');

var ManyToManyRelation =
/*#__PURE__*/
function (_Relation) {
  _inherits(ManyToManyRelation, _Relation);

  function ManyToManyRelation() {
    _classCallCheck(this, ManyToManyRelation);

    return _possibleConstructorReturn(this, _getPrototypeOf(ManyToManyRelation).apply(this, arguments));
  }

  _createClass(ManyToManyRelation, [{
    key: "setMapping",
    value: function setMapping(mapping) {
      var _this = this;

      var retVal = _get(_getPrototypeOf(ManyToManyRelation.prototype), "setMapping", this).call(this, mapping);

      var ctx = {
        mapping: mapping,
        ownerModelClass: this.ownerModelClass,
        relatedModelClass: this.relatedModelClass,
        ownerProp: this.ownerProp,
        relatedProp: this.relatedProp,
        joinTableModelClass: null,
        joinTableOwnerProp: null,
        joinTableRelatedProp: null,
        joinTableBeforeInsert: null,
        joinTableExtras: [],
        createError: function createError(msg) {
          return _this.createError(msg);
        }
      };
      ctx = checkThroughObject(ctx);
      ctx = resolveJoinModelClassIfDefined(ctx);
      ctx = createJoinProperties(ctx);
      ctx = parseExtras(ctx);
      ctx = parseBeforeInsert(ctx);
      ctx = finalizeJoinModelClass(ctx);
      this.joinTableExtras = ctx.joinTableExtras;
      this.joinTableModelClass = ctx.joinTableModelClass;
      this.joinTableOwnerProp = ctx.joinTableOwnerProp;
      this.joinTableRelatedProp = ctx.joinTableRelatedProp;
      this.joinTableBeforeInsert = ctx.joinTableBeforeInsert;
      return retVal;
    }
  }, {
    key: "findQuery",
    value: function findQuery(builder, opt) {
      var _this2 = this;

      var joinTableOwnerRefs = this.joinTableOwnerProp.refs(builder);
      var joinTable = builder.tableNameFor(this.joinTable);
      var joinTableAlias = builder.tableRefFor(this.joinTable);
      builder.join(aliasedTableName(joinTable, joinTableAlias), function (join) {
        for (var i = 0, l = _this2.relatedProp.size; i < l; ++i) {
          var relatedRef = _this2.relatedProp.ref(builder, i);

          var joinTableRelatedRef = _this2.joinTableRelatedProp.ref(builder, i);

          join.on(relatedRef, joinTableRelatedRef);
        }
      });

      if (opt.isColumnRef) {
        for (var i = 0, l = joinTableOwnerRefs.length; i < l; ++i) {
          builder.where(joinTableOwnerRefs[i], ref(opt.ownerIds[i]));
        }
      } else if (containsNonNull(opt.ownerIds)) {
        builder.whereInComposite(joinTableOwnerRefs, opt.ownerIds);
      } else {
        builder.resolve([]);
      }

      return builder.modify(this.modify);
    }
  }, {
    key: "join",
    value: function join(builder) {
      var _this3 = this;

      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$joinOperation = _ref.joinOperation,
          joinOperation = _ref$joinOperation === void 0 ? defaultJoinOperation(this, builder) : _ref$joinOperation,
          _ref$relatedTableAlia = _ref.relatedTableAlias,
          relatedTableAlias = _ref$relatedTableAlia === void 0 ? defaultRelatedTablealias(this, builder) : _ref$relatedTableAlia,
          _ref$relatedJoinSelec = _ref.relatedJoinSelectQuery,
          relatedJoinSelectQuery = _ref$relatedJoinSelec === void 0 ? defaultRelatedJoinSelectQuery(this, builder) : _ref$relatedJoinSelec,
          _ref$relatedTable = _ref.relatedTable,
          relatedTable = _ref$relatedTable === void 0 ? defaultRelatedTable(this, builder) : _ref$relatedTable,
          _ref$ownerTable = _ref.ownerTable,
          ownerTable = _ref$ownerTable === void 0 ? defaultOwnerTable(this, builder) : _ref$ownerTable,
          _ref$joinTableAlias = _ref.joinTableAlias,
          joinTableAlias = _ref$joinTableAlias === void 0 ? defaultJoinTableAlias(this, relatedTableAlias, builder) : _ref$joinTableAlias;

      var relatedJoinSelect = relatedJoinSelectQuery.modify(this.modify).as(relatedTableAlias);

      if (relatedJoinSelect.isSelectAll()) {
        // No need to join a subquery if the query is `select * from "RelatedTable"`.
        relatedJoinSelect = aliasedTableName(relatedTable, relatedTableAlias);
      }

      return builder[joinOperation](aliasedTableName(this.joinTable, joinTableAlias), function (join) {
        var ownerProp = _this3.ownerProp;
        var joinTableOwnerProp = _this3.joinTableOwnerProp;

        for (var i = 0, l = ownerProp.size; i < l; ++i) {
          var joinTableOwnerRef = joinTableOwnerProp.ref(builder, i).table(joinTableAlias);
          var ownerRef = ownerProp.ref(builder, i).table(ownerTable);
          join.on(joinTableOwnerRef, ownerRef);
        }
      })[joinOperation](relatedJoinSelect, function (join) {
        var relatedProp = _this3.relatedProp;
        var joinTableRelatedProp = _this3.joinTableRelatedProp;

        for (var i = 0, l = relatedProp.size; i < l; ++i) {
          var joinTableRelatedRef = joinTableRelatedProp.ref(builder, i).table(joinTableAlias);
          var relatedRef = relatedProp.ref(builder, i).table(relatedTableAlias);
          join.on(joinTableRelatedRef, relatedRef);
        }
      });
    }
  }, {
    key: "find",
    value: function find(builder, owners) {
      return new ManyToManyFindOperation('find', {
        relation: this,
        owners: owners
      });
    }
  }, {
    key: "insert",
    value: function insert(builder, owner) {
      return new ManyToManyInsertOperation('insert', {
        relation: this,
        owner: owner
      });
    }
  }, {
    key: "update",
    value: function update(builder, owner) {
      if (isSqlite(builder.knex())) {
        return new ManyToManyUpdateSqliteOperation('update', {
          relation: this,
          owner: owner
        });
      } else if (isMySql(builder.knex())) {
        return new ManyToManyUpdateMySqlOperation('update', {
          relation: this,
          owner: owner
        });
      } else {
        return new ManyToManyUpdateOperation('update', {
          relation: this,
          owner: owner
        });
      }
    }
  }, {
    key: "patch",
    value: function patch(builder, owner) {
      if (isSqlite(builder.knex())) {
        return new ManyToManyUpdateSqliteOperation('patch', {
          modelOptions: {
            patch: true
          },
          relation: this,
          owner: owner
        });
      } else if (isMySql(builder.knex())) {
        return new ManyToManyUpdateMySqlOperation('patch', {
          modelOptions: {
            patch: true
          },
          relation: this,
          owner: owner
        });
      } else {
        return new ManyToManyUpdateOperation('patch', {
          modelOptions: {
            patch: true
          },
          relation: this,
          owner: owner
        });
      }
    }
  }, {
    key: "delete",
    value: function _delete(builder, owner) {
      if (isSqlite(builder.knex())) {
        return new ManyToManyDeleteSqliteOperation('delete', {
          relation: this,
          owner: owner
        });
      } else if (isMySql(builder.knex())) {
        return new ManyToManyDeleteMySqlOperation('delete', {
          relation: this,
          owner: owner
        });
      } else {
        return new ManyToManyDeleteOperation('delete', {
          relation: this,
          owner: owner
        });
      }
    }
  }, {
    key: "relate",
    value: function relate(builder, owner) {
      return new ManyToManyRelateOperation('relate', {
        relation: this,
        owner: owner
      });
    }
  }, {
    key: "unrelate",
    value: function unrelate(builder, owner) {
      if (isSqlite(builder.knex())) {
        return new ManyToManyUnrelateSqliteOperation('unrelate', {
          relation: this,
          owner: owner
        });
      } else if (isMySql(builder.knex())) {
        return new ManyToManyUnrelateMySqlOperation('unrelate', {
          relation: this,
          owner: owner
        });
      } else {
        return new ManyToManyUnrelateOperation('unrelate', {
          relation: this,
          owner: owner
        });
      }
    }
  }, {
    key: "createJoinModels",
    value: function createJoinModels(ownerId, related) {
      var joinModels = new Array(related.length);

      for (var i = 0, lr = related.length; i < lr; ++i) {
        joinModels[i] = this.createJoinModel(ownerId, related[i]);
      }

      return joinModels;
    }
  }, {
    key: "createJoinModel",
    value: function createJoinModel(ownerId, rel) {
      var joinModel = {};

      for (var j = 0, lp = this.joinTableOwnerProp.size; j < lp; ++j) {
        this.joinTableOwnerProp.setProp(joinModel, j, ownerId[j]);
      }

      for (var _j = 0, _lp = this.joinTableRelatedProp.size; _j < _lp; ++_j) {
        var value = this.relatedProp.getProp(rel, _j);

        if (value !== undefined) {
          this.joinTableRelatedProp.setProp(joinModel, _j, value);
        }
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.joinTableExtras[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var extra = _step.value;
          var extraValue = rel[extra.aliasProp];

          if (extraValue === undefined && rel.$$queryProps) {
            extraValue = rel.$$queryProps[extra.aliasProp];
          }

          if (extraValue !== undefined) {
            joinModel[extra.joinTableProp] = extraValue;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return joinModel;
    }
  }, {
    key: "omitExtraProps",
    value: function omitExtraProps(models) {
      if (this.joinTableExtras && this.joinTableExtras.length) {
        var props = this.joinTableExtras.map(function (extra) {
          return extra.aliasProp;
        });
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = models[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var model = _step2.value;
            // Omit extra properties instead of deleting them from the models so that they can
            // be used in the `$before` and `$after` hooks.
            model.$omitFromDatabaseJson(props);
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }
    }
  }, {
    key: "executeJoinTableBeforeInsert",
    value: function executeJoinTableBeforeInsert(models, queryContext, result) {
      var _this4 = this;

      return mapAfterAllReturn(models, function (model) {
        return _this4.joinTableBeforeInsert(model, queryContext);
      }, result);
    }
  }, {
    key: "forbiddenMappingProperties",
    get: function get() {
      return [];
    }
  }]);

  return ManyToManyRelation;
}(Relation);

Object.defineProperties(ManyToManyRelation.prototype, {
  isObjectionManyToManyRelation: {
    enumerable: false,
    writable: false,
    value: true
  }
});

function defaultJoinOperation() {
  return 'join';
}

function defaultRelatedTablealias(relation, builder) {
  return builder.tableRefFor(relation.relatedModelClass.getTableName());
}

function defaultRelatedJoinSelectQuery(relation, builder) {
  return relation.relatedModelClass.query().childQueryOf(builder);
}

function defaultRelatedTable(relation, builder) {
  return builder.tableNameFor(relation.relatedModelClass.getTableName());
}

function defaultOwnerTable(relation, builder) {
  return builder.tableRefFor(relation.ownerModelClass.getTableName());
}

function defaultJoinTableAlias(relation, relatedTableAlias, builder) {
  var alias = builder.tableRefFor(relation.joinTable);

  if (alias === relation.joinTable) {
    return relation.ownerModelClass.joinTableAlias(relatedTableAlias);
  } else {
    return alias;
  }
}

function aliasedTableName(tableName, alias) {
  if (tableName === alias) {
    return tableName;
  } else {
    return "".concat(tableName, " as ").concat(alias);
  }
}

function checkThroughObject(ctx) {
  var mapping = ctx.mapping;

  if (!isObject(mapping.join.through)) {
    throw ctx.createError('join must have a `through` object that describes the join table.');
  }

  if (!mapping.join.through.from || !mapping.join.through.to) {
    throw ctx.createError('join.through must be an object that describes the join table. For example: {from: "JoinTable.someId", to: "JoinTable.someOtherId"}');
  }

  return ctx;
}

function resolveJoinModelClassIfDefined(ctx) {
  var joinTableModelClass = null;

  if (ctx.mapping.join.through.modelClass) {
    try {
      joinTableModelClass = resolveModel(ctx.mapping.join.through.modelClass, ctx.ownerModelClass.modelPaths, 'join.through.modelClass');
    } catch (err) {
      throw ctx.createError(err.message);
    }
  }

  return Object.assign(ctx, {
    joinTableModelClass: joinTableModelClass
  });
}

function createJoinProperties(ctx) {
  var ret;
  var fromProp;
  var toProp;
  var relatedProp;
  var ownerProp;
  ret = createRelationProperty(ctx, ctx.mapping.join.through.from, 'join.through.from');
  fromProp = ret.prop;
  ctx = ret.ctx;
  ret = createRelationProperty(ctx, ctx.mapping.join.through.to, 'join.through.to');
  toProp = ret.prop;
  ctx = ret.ctx;

  if (fromProp.modelClass.getTableName() !== toProp.modelClass.getTableName()) {
    throw ctx.createError('join.through `from` and `to` must point to the same join table.');
  }

  if (ctx.relatedProp.modelClass.getTableName() === fromProp.modelClass.getTableName()) {
    relatedProp = fromProp;
    ownerProp = toProp;
  } else {
    relatedProp = toProp;
    ownerProp = fromProp;
  }

  return Object.assign(ctx, {
    joinTableOwnerProp: ownerProp,
    joinTableRelatedProp: relatedProp
  });
}

function createRelationProperty(ctx, refString, messagePrefix) {
  var prop = null;
  var joinTableModelClass = ctx.joinTableModelClass;

  var resolveModelClass = function resolveModelClass(table) {
    if (joinTableModelClass === null) {
      joinTableModelClass = inheritModel(getModel());
      joinTableModelClass.tableName = table;
      joinTableModelClass.idColumn = null;
      joinTableModelClass.concurrency = ctx.ownerModelClass.concurrency;
    }

    if (joinTableModelClass.getTableName() === table) {
      return joinTableModelClass;
    } else {
      return null;
    }
  };

  try {
    prop = new RelationProperty(refString, resolveModelClass);
  } catch (err) {
    if (err instanceof RelationProperty.ModelNotFoundError) {
      throw ctx.createError('join.through `from` and `to` must point to the same join table.');
    } else {
      throw ctx.createError("".concat(messagePrefix, " must have format JoinTable.columnName. For example \"JoinTable.someId\" or in case of composite key [\"JoinTable.a\", \"JoinTable.b\"]."));
    }
  }

  return {
    ctx: Object.assign(ctx, {
      joinTableModelClass: joinTableModelClass
    }),
    prop: prop
  };
}

function parseExtras(ctx) {
  var extraDef = ctx.mapping.join.through.extra;

  if (!extraDef) {
    return ctx;
  }

  if (Array.isArray(extraDef)) {
    extraDef = extraDef.reduce(function (extraDef, col) {
      extraDef[col] = col;
      return extraDef;
    }, {});
  }

  var joinTableExtras = Object.keys(extraDef).map(function (key) {
    var val = extraDef[key];
    return {
      joinTableCol: val,
      joinTableProp: ctx.joinTableModelClass.columnNameToPropertyName(val),
      aliasCol: key,
      aliasProp: ctx.joinTableModelClass.columnNameToPropertyName(key)
    };
  });
  return Object.assign(ctx, {
    joinTableExtras: joinTableExtras
  });
}

function parseBeforeInsert(ctx) {
  var joinTableBeforeInsert;

  if (isFunction(ctx.mapping.join.through.beforeInsert)) {
    joinTableBeforeInsert = ctx.mapping.join.through.beforeInsert;
  } else {
    joinTableBeforeInsert = function joinTableBeforeInsert(model) {
      return model;
    };
  }

  return Object.assign(ctx, {
    joinTableBeforeInsert: joinTableBeforeInsert
  });
}

function finalizeJoinModelClass(ctx) {
  if (ctx.joinTableModelClass.getIdColumn() === null) {
    // We cannot know if the join table has a primary key. Therefore we set some
    // known column as the idColumn so that inserts will work.
    ctx.joinTableModelClass.idColumn = ctx.joinTableRelatedProp.cols;
  }

  return ctx;
}

function containsNonNull(arr) {
  for (var i = 0, l = arr.length; i < l; ++i) {
    var val = arr[i];

    if (Array.isArray(val) && containsNonNull(val)) {
      return true;
    } else if (val !== null && val !== undefined) {
      return true;
    }
  }

  return false;
}

module.exports = ManyToManyRelation;