'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var RelationProperty = require('./RelationProperty');

var getModel = function getModel() {
  return require('../model/Model');
};

var RelationFindOperation = require('./RelationFindOperation');

var RelationUpdateOperation = require('./RelationUpdateOperation');

var RelationDeleteOperation = require('./RelationDeleteOperation');

var RelationSubqueryOperation = require('./RelationSubqueryOperation');

var _require = require('../queryBuilder/ReferenceBuilder'),
    ref = _require.ref;

var _require2 = require('../utils/classUtils'),
    isSubclassOf = _require2.isSubclassOf;

var _require3 = require('../utils/resolveModel'),
    resolveModel = _require3.resolveModel;

var _require4 = require('../utils/objectUtils'),
    get = _require4.get,
    isFunction = _require4.isFunction;

var _require5 = require('../utils/promiseUtils'),
    mapAfterAllReturn = _require5.mapAfterAllReturn;

var _require6 = require('../utils/createModifier'),
    createModifier = _require6.createModifier;

var Relation =
/*#__PURE__*/
function () {
  function Relation(relationName, OwnerClass) {
    _classCallCheck(this, Relation);

    this.name = relationName;
    this.ownerModelClass = OwnerClass;
    this.relatedModelClass = null;
    this.ownerProp = null;
    this.relatedProp = null;
    this.joinTableModelClass = null;
    this.joinTableOwnerProp = null;
    this.joinTableRelatedProp = null;
    this.joinTableBeforeInsert = null;
    this.joinTableExtras = [];
    this.modify = null;
    this.beforeInsert = null;
  }

  _createClass(Relation, [{
    key: "setMapping",
    value: function setMapping(mapping) {
      var _this = this;

      var ctx = {
        name: this.name,
        mapping: mapping,
        ownerModelClass: this.ownerModelClass,
        relatedModelClass: null,
        relatedProp: null,
        ownerProp: null,
        modify: null,
        beforeInsert: null,
        forbiddenMappingProperties: this.forbiddenMappingProperties,
        createError: function createError(msg) {
          return _this.createError(msg);
        }
      };
      ctx = checkForbiddenProperties(ctx);
      ctx = checkOwnerModelClass(ctx);
      ctx = checkRelatedModelClass(ctx);
      ctx = resolveRelatedModelClass(ctx);
      ctx = checkRelation(ctx);
      ctx = createJoinProperties(ctx);
      ctx = parseModify(ctx);
      ctx = parseBeforeInsert(ctx);
      this.relatedModelClass = ctx.relatedModelClass;
      this.ownerProp = ctx.ownerProp;
      this.relatedProp = ctx.relatedProp;
      this.modify = ctx.modify;
      this.beforeInsert = ctx.beforeInsert;
    }
  }, {
    key: "getJoinModelClass",
    value: function getJoinModelClass(knex) {
      return this.joinTableModelClass && knex !== this.joinTableModelClass.knex() ? this.joinTableModelClass.bindKnex(knex) : this.joinTableModelClass;
    }
  }, {
    key: "isOneToOne",
    value: function isOneToOne() {
      return false;
    }
  }, {
    key: "clone",
    value: function clone() {
      var relation = new this.constructor(this.name, this.ownerModelClass);
      relation.relatedModelClass = this.relatedModelClass;
      relation.ownerProp = this.ownerProp;
      relation.relatedProp = this.relatedProp;
      relation.modify = this.modify;
      relation.beforeInsert = this.beforeInsert;
      relation.joinTableModelClass = this.joinTableModelClass;
      relation.joinTableOwnerProp = this.joinTableOwnerProp;
      relation.joinTableRelatedProp = this.joinTableRelatedProp;
      relation.joinTableBeforeInsert = this.joinTableBeforeInsert;
      relation.joinTableExtras = this.joinTableExtras;
      return relation;
    }
  }, {
    key: "bindKnex",
    value: function bindKnex(knex) {
      var bound = this.clone();
      bound.relatedModelClass = this.relatedModelClass.bindKnex(knex);
      bound.ownerModelClass = this.ownerModelClass.bindKnex(knex);

      if (this.joinTableModelClass) {
        bound.joinTableModelClass = this.joinTableModelClass.bindKnex(knex);
      }

      return bound;
    }
  }, {
    key: "findQuery",
    value: function findQuery(builder, opt) {
      var relatedRefs = this.relatedProp.refs(builder);

      if (opt.isColumnRef) {
        for (var i = 0, l = relatedRefs.length; i < l; ++i) {
          builder.where(relatedRefs[i], ref(opt.ownerIds[i]));
        }
      } else if (containsNonNull(opt.ownerIds)) {
        builder.whereInComposite(relatedRefs, opt.ownerIds);
      } else {
        builder.resolve([]);
      }

      try {
        return builder.modify(this.modify);
      } catch (err) {
        if (err instanceof this.relatedModelClass.ModifierNotFoundError) {
          throw this.createError(err.message);
        } else {
          throw err;
        }
      }
    }
  }, {
    key: "join",
    value: function join(builder) {
      var _this2 = this;

      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$joinOperation = _ref.joinOperation,
          joinOperation = _ref$joinOperation === void 0 ? 'join' : _ref$joinOperation,
          _ref$relatedTableAlia = _ref.relatedTableAlias,
          relatedTableAlias = _ref$relatedTableAlia === void 0 ? builder.tableRefFor(this.relatedModelClass.getTableName()) : _ref$relatedTableAlia,
          _ref$relatedJoinSelec = _ref.relatedJoinSelectQuery,
          relatedJoinSelectQuery = _ref$relatedJoinSelec === void 0 ? this.relatedModelClass.query().childQueryOf(builder) : _ref$relatedJoinSelec,
          _ref$relatedTable = _ref.relatedTable,
          relatedTable = _ref$relatedTable === void 0 ? builder.tableNameFor(this.relatedModelClass.getTableName()) : _ref$relatedTable,
          _ref$ownerTable = _ref.ownerTable,
          ownerTable = _ref$ownerTable === void 0 ? builder.tableRefFor(this.ownerModelClass.getTableName()) : _ref$ownerTable;

      var relatedSelect = relatedJoinSelectQuery.modify(this.modify).as(relatedTableAlias);

      if (relatedSelect.isSelectAll()) {
        // No need to join a subquery if the query is `select * from "RelatedTable"`.
        relatedSelect = aliasedTableName(relatedTable, relatedTableAlias);
      }

      return builder[joinOperation](relatedSelect, function (join) {
        var relatedProp = _this2.relatedProp;
        var ownerProp = _this2.ownerProp;

        for (var i = 0, l = relatedProp.size; i < l; ++i) {
          var relatedRef = relatedProp.ref(builder, i).table(relatedTableAlias);
          var ownerRef = ownerProp.ref(builder, i).table(ownerTable);
          join.on(relatedRef, ownerRef);
        }
      });
    }
  }, {
    key: "insert",
    value: function insert(builder, owner) {
      /* istanbul ignore next */
      throw this.createError('not implemented');
    }
  }, {
    key: "update",
    value: function update(builder, owner) {
      return new RelationUpdateOperation('update', {
        relation: this,
        owner: owner
      });
    }
  }, {
    key: "patch",
    value: function patch(builder, owner) {
      return new RelationUpdateOperation('patch', {
        relation: this,
        owner: owner,
        modelOptions: {
          patch: true
        }
      });
    }
  }, {
    key: "find",
    value: function find(builder, owners) {
      return new RelationFindOperation('find', {
        relation: this,
        owners: owners
      });
    }
  }, {
    key: "subQuery",
    value: function subQuery(builder) {
      return new RelationSubqueryOperation('subQuery', {
        relation: this
      });
    }
  }, {
    key: "delete",
    value: function _delete(builder, owner) {
      return new RelationDeleteOperation('delete', {
        relation: this,
        owner: owner
      });
    }
  }, {
    key: "relate",
    value: function relate(builder, owner) {
      /* istanbul ignore next */
      throw this.createError('not implemented');
    }
  }, {
    key: "unrelate",
    value: function unrelate(builder, owner) {
      /* istanbul ignore next */
      throw this.createError('not implemented');
    }
  }, {
    key: "hasRelateProp",
    value: function hasRelateProp(model) {
      return model.$hasProps(this.relatedProp.props);
    }
  }, {
    key: "executeBeforeInsert",
    value: function executeBeforeInsert(models, queryContext, result) {
      var _this3 = this;

      return mapAfterAllReturn(models, function (model) {
        return _this3.beforeInsert(model, queryContext);
      }, result);
    }
  }, {
    key: "createError",
    value: function createError(message) {
      if (this.ownerModelClass && this.ownerModelClass.name && this.name) {
        return new Error("".concat(this.ownerModelClass.name, ".relationMappings.").concat(this.name, ": ").concat(message));
      } else {
        return new Error("".concat(this.constructor.name, ": ").concat(message));
      }
    }
  }, {
    key: "forbiddenMappingProperties",
    get: function get() {
      return ['join.through'];
    }
  }, {
    key: "joinTable",
    get: function get() {
      return this.joinTableModelClass ? this.joinTableModelClass.getTableName() : null;
    }
  }, {
    key: "joinModelClass",
    get: function get() {
      return this.getJoinModelClass(this.ownerModelClass.knex());
    }
  }]);

  return Relation;
}();

Object.defineProperties(Relation.prototype, {
  isObjectionRelation: {
    enumerable: false,
    writable: false,
    value: true
  }
});

function checkForbiddenProperties(ctx) {
  ctx.forbiddenMappingProperties.forEach(function (prop) {
    if (get(ctx.mapping, prop.split('.')) !== undefined) {
      throw ctx.createError("Property ".concat(prop, " is not supported for this relation type."));
    }
  });
  return ctx;
}

function checkOwnerModelClass(ctx) {
  if (!isSubclassOf(ctx.ownerModelClass, getModel())) {
    throw ctx.createError("Relation's owner is not a subclass of Model");
  }

  return ctx;
}

function checkRelatedModelClass(ctx) {
  if (!ctx.mapping.modelClass) {
    throw ctx.createError('modelClass is not defined');
  }

  return ctx;
}

function resolveRelatedModelClass(ctx) {
  var relatedModelClass;

  try {
    relatedModelClass = resolveModel(ctx.mapping.modelClass, ctx.ownerModelClass.modelPaths, 'modelClass');
  } catch (err) {
    throw ctx.createError(err.message);
  }

  return Object.assign(ctx, {
    relatedModelClass: relatedModelClass
  });
}

function checkRelation(ctx) {
  if (!ctx.mapping.relation) {
    throw ctx.createError('relation is not defined');
  }

  if (!isSubclassOf(ctx.mapping.relation, Relation)) {
    throw ctx.createError('relation is not a subclass of Relation');
  }

  return ctx;
}

function createJoinProperties(ctx) {
  var mapping = ctx.mapping;

  if (!mapping.join || !mapping.join.from || !mapping.join.to) {
    throw ctx.createError('join must be an object that maps the columns of the related models together. For example: {from: "SomeTable.id", to: "SomeOtherTable.someModelId"}');
  }

  var fromProp = createRelationProperty(ctx, mapping.join.from, 'join.from');
  var toProp = createRelationProperty(ctx, mapping.join.to, 'join.to');
  var ownerProp;
  var relatedProp;

  if (fromProp.modelClass.getTableName() === ctx.ownerModelClass.getTableName()) {
    ownerProp = fromProp;
    relatedProp = toProp;
  } else if (toProp.modelClass.getTableName() === ctx.ownerModelClass.getTableName()) {
    ownerProp = toProp;
    relatedProp = fromProp;
  } else {
    throw ctx.createError('join: either `from` or `to` must point to the owner model table.');
  }

  if (ownerProp.props.some(function (it) {
    return it === ctx.name;
  })) {
    throw ctx.createError("join: relation name and join property '".concat(ctx.name, "' cannot have the same name. If you cannot change one or the other, you can use $parseDatabaseJson and $formatDatabaseJson methods to convert the column name."));
  }

  if (relatedProp.modelClass.getTableName() !== ctx.relatedModelClass.getTableName()) {
    throw ctx.createError('join: either `from` or `to` must point to the related model table.');
  }

  return Object.assign(ctx, {
    ownerProp: ownerProp,
    relatedProp: relatedProp
  });
}

function createRelationProperty(ctx, refString, propName) {
  try {
    return new RelationProperty(refString, function (table) {
      return [ctx.ownerModelClass, ctx.relatedModelClass].find(function (it) {
        return it.getTableName() === table;
      });
    });
  } catch (err) {
    if (err instanceof RelationProperty.ModelNotFoundError) {
      throw ctx.createError("join: either `from` or `to` must point to the owner model table and the other one to the related table. It might be that specified table '".concat(err.tableName, "' is not correct"));
    } else if (err instanceof RelationProperty.InvalidReferenceError) {
      throw ctx.createError("".concat(propName, " must have format TableName.columnName. For example \"SomeTable.id\" or in case of composite key [\"SomeTable.a\", \"SomeTable.b\"]."));
    } else {
      throw err;
    }
  }
}

function parseModify(ctx) {
  var mapping = ctx.mapping;
  var modifier = mapping.modify || mapping.filter;
  var modify = modifier && createModifier({
    modifier: modifier,
    modelClass: ctx.relatedModelClass
  });
  return Object.assign(ctx, {
    modify: modify
  });
}

function parseBeforeInsert(ctx) {
  var beforeInsert;

  if (isFunction(ctx.mapping.beforeInsert)) {
    beforeInsert = ctx.mapping.beforeInsert;
  } else {
    beforeInsert = function beforeInsert(model) {
      return model;
    };
  }

  return Object.assign(ctx, {
    beforeInsert: beforeInsert
  });
}

function containsNonNull(arr) {
  for (var i = 0, l = arr.length; i < l; ++i) {
    var val = arr[i];

    if (Array.isArray(val)) {
      if (containsNonNull(val)) {
        return true;
      }
    } else if (val !== null && val !== undefined) {
      return true;
    }
  }

  return false;
}

function aliasedTableName(tableName, alias) {
  if (tableName === alias) {
    return tableName;
  } else {
    return "".concat(tableName, " as ").concat(alias);
  }
}

module.exports = Relation;