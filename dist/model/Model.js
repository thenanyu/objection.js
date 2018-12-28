'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _require = require('./modelClone'),
    clone = _require.clone;

var _require2 = require('./modelBindKnex'),
    _bindKnex = _require2.bindKnex;

var _require3 = require('./modelValidate'),
    validate = _require3.validate;

var _require4 = require('../utils/knexUtils'),
    isMsSql = _require4.isMsSql;

var _require5 = require('./modelFilter'),
    omit = _require5.omit,
    pick = _require5.pick;

var _require6 = require('./modelVisitor'),
    visitModels = _require6.visitModels;

var _require7 = require('./modelId'),
    hasId = _require7.hasId,
    getSetId = _require7.getSetId;

var _require8 = require('./modelToJson'),
    toJson = _require8.toJson,
    toDatabaseJson = _require8.toDatabaseJson;

var _require9 = require('./modelValues'),
    values = _require9.values,
    propKey = _require9.propKey,
    hasProps = _require9.hasProps;

var _require10 = require('./modelUtils'),
    defineNonEnumerableProperty = _require10.defineNonEnumerableProperty;

var _require11 = require('../utils/objectUtils'),
    asArray = _require11.asArray,
    isFunction = _require11.isFunction,
    isString = _require11.isString;

var _require12 = require('./modelParseRelations'),
    parseRelationsIntoModelInstances = _require12.parseRelationsIntoModelInstances;

var _require13 = require('./modelTableMetadata'),
    _fetchTableMetadata = _require13.fetchTableMetadata,
    _tableMetadata = _require13.tableMetadata;

var _require14 = require('./modelSet'),
    setJson = _require14.setJson,
    setFast = _require14.setFast,
    setRelated = _require14.setRelated,
    appendRelated = _require14.appendRelated,
    setDatabaseJson = _require14.setDatabaseJson;

var _require15 = require('./modelJsonAttributes'),
    _getJsonAttributes = _require15.getJsonAttributes,
    parseJsonAttributes = _require15.parseJsonAttributes,
    formatJsonAttributes = _require15.formatJsonAttributes;

var _require16 = require('./modelColPropMap'),
    _columnNameToPropertyName = _require16.columnNameToPropertyName,
    _propertyNameToColumnName = _require16.propertyNameToColumnName;

var _require17 = require('../queryBuilder/RawBuilder'),
    _raw = _require17.raw;

var _require18 = require('../queryBuilder/ReferenceBuilder'),
    ref = _require18.ref;

var AjvValidator = require('./AjvValidator');

var QueryBuilder = require('../queryBuilder/QueryBuilder');

var NotFoundError = require('./NotFoundError');

var ValidationError = require('./ValidationError');

var ModifierNotFoundError = require('./ModifierNotFoundError');

var RelationProperty = require('../relations/RelationProperty');

var HasOneRelation = require('../relations/hasOne/HasOneRelation');

var HasManyRelation = require('../relations/hasMany/HasManyRelation');

var ManyToManyRelation = require('../relations/manyToMany/ManyToManyRelation');

var BelongsToOneRelation = require('../relations/belongsToOne/BelongsToOneRelation');

var HasOneThroughRelation = require('../relations/hasOneThrough/HasOneThroughRelation');

var InstanceFindOperation = require('../queryBuilder/operations/InstanceFindOperation');

var InstanceInsertOperation = require('../queryBuilder/operations/InstanceInsertOperation');

var InstanceUpdateOperation = require('../queryBuilder/operations/InstanceUpdateOperation');

var InstanceDeleteOperation = require('../queryBuilder/operations/InstanceDeleteOperation');

var JoinEagerOperation = require('../queryBuilder/operations/eager/JoinEagerOperation');

var NaiveEagerOperation = require('../queryBuilder/operations/eager/NaiveEagerOperation');

var WhereInEagerOperation = require('../queryBuilder/operations/eager/WhereInEagerOperation');

var JoinEagerAlgorithm = function JoinEagerAlgorithm() {
  return new JoinEagerOperation('eager');
};

var NaiveEagerAlgorithm = function NaiveEagerAlgorithm() {
  return new NaiveEagerOperation('eager');
};

var WhereInEagerAlgorithm = function WhereInEagerAlgorithm() {
  return new WhereInEagerOperation('eager');
};

var Model =
/*#__PURE__*/
function () {
  function Model() {
    _classCallCheck(this, Model);
  }

  _createClass(Model, [{
    key: "$id",
    value: function $id(maybeId) {
      return getSetId(this, maybeId);
    }
  }, {
    key: "$hasId",
    value: function $hasId() {
      return hasId(this);
    }
  }, {
    key: "$hasProps",
    value: function $hasProps(props) {
      return hasProps(this, props);
    }
  }, {
    key: "$query",
    value: function $query(trx) {
      var _this = this;

      var modelClass = this.constructor;
      return modelClass.query(trx).findOperationFactory(function () {
        return new InstanceFindOperation('find', {
          instance: _this
        });
      }).insertOperationFactory(function () {
        return new InstanceInsertOperation('insert', {
          instance: _this
        });
      }).updateOperationFactory(function () {
        return new InstanceUpdateOperation('update', {
          instance: _this
        });
      }).patchOperationFactory(function () {
        return new InstanceUpdateOperation('patch', {
          instance: _this,
          modelOptions: {
            patch: true
          }
        });
      }).deleteOperationFactory(function () {
        return new InstanceDeleteOperation('delete', {
          instance: _this
        });
      }).relateOperationFactory(function () {
        throw new Error('`relate` makes no sense in this context');
      }).unrelateOperationFactory(function () {
        throw new Error('`unrelate` makes no sense in this context');
      });
    }
  }, {
    key: "$relatedQuery",
    value: function $relatedQuery(relationName, trx) {
      var _this2 = this;

      var modelClass = this.constructor;
      var relation = modelClass.getRelation(relationName);
      var RelatedModelClass = relation.relatedModelClass;
      return RelatedModelClass.query(trx).findOperationFactory(function (builder) {
        var operation = relation.find(builder, [_this2]);
        operation.assignResultToOwner = _this2.constructor.relatedFindQueryMutates;
        return operation;
      }).insertOperationFactory(function (builder) {
        var operation = relation.insert(builder, _this2);
        operation.assignResultToOwner = _this2.constructor.relatedInsertQueryMutates;
        return operation;
      }).updateOperationFactory(function (builder) {
        return relation.update(builder, _this2);
      }).patchOperationFactory(function (builder) {
        return relation.patch(builder, _this2);
      }).deleteOperationFactory(function (builder) {
        return relation.delete(builder, _this2);
      }).relateOperationFactory(function (builder) {
        return relation.relate(builder, _this2);
      }).unrelateOperationFactory(function (builder) {
        return relation.unrelate(builder, _this2);
      });
    }
  }, {
    key: "$loadRelated",
    value: function $loadRelated(relationExpression, modifiers, trx) {
      return this.constructor.loadRelated(this, relationExpression, modifiers, trx);
    }
  }, {
    key: "$beforeValidate",
    value: function $beforeValidate(jsonSchema, json, options) {
      /* istanbul ignore next */
      return jsonSchema;
    }
  }, {
    key: "$validate",
    value: function $validate(json, options) {
      return validate(this, json, options);
    }
  }, {
    key: "$afterValidate",
    value: function $afterValidate(json, options) {// Do nothing by default.
    }
  }, {
    key: "$parseDatabaseJson",
    value: function $parseDatabaseJson(json) {
      var columnNameMappers = this.constructor.getColumnNameMappers();

      if (columnNameMappers) {
        json = columnNameMappers.parse(json);
      }

      return parseJsonAttributes(json, this.constructor);
    }
  }, {
    key: "$formatDatabaseJson",
    value: function $formatDatabaseJson(json) {
      var columnNameMappers = this.constructor.getColumnNameMappers();
      json = formatJsonAttributes(json, this.constructor);

      if (columnNameMappers) {
        json = columnNameMappers.format(json);
      }

      return json;
    }
  }, {
    key: "$parseJson",
    value: function $parseJson(json, options) {
      return json;
    }
  }, {
    key: "$formatJson",
    value: function $formatJson(json) {
      return json;
    }
  }, {
    key: "$setJson",
    value: function $setJson(json, options) {
      return setJson(this, json, options);
    }
  }, {
    key: "$setDatabaseJson",
    value: function $setDatabaseJson(json) {
      return setDatabaseJson(this, json);
    }
  }, {
    key: "$set",
    value: function $set(obj) {
      return setFast(this, obj);
    }
  }, {
    key: "$setRelated",
    value: function $setRelated(relation, models) {
      return setRelated(this, relation, models);
    }
  }, {
    key: "$appendRelated",
    value: function $appendRelated(relation, models) {
      return appendRelated(this, relation, models);
    }
  }, {
    key: "$toJson",
    value: function $toJson(opt) {
      return toJson(this, opt);
    }
  }, {
    key: "toJSON",
    value: function toJSON(opt) {
      return this.$toJson(opt);
    }
  }, {
    key: "$toDatabaseJson",
    value: function $toDatabaseJson(builder) {
      return toDatabaseJson(this, builder);
    }
  }, {
    key: "$beforeInsert",
    value: function $beforeInsert(queryContext) {// Do nothing by default.
    }
  }, {
    key: "$afterInsert",
    value: function $afterInsert(queryContext) {// Do nothing by default.
    }
  }, {
    key: "$beforeUpdate",
    value: function $beforeUpdate(opt, queryContext) {// Do nothing by default.
    }
  }, {
    key: "$afterUpdate",
    value: function $afterUpdate(opt, queryContext) {// Do nothing by default.
    }
  }, {
    key: "$afterGet",
    value: function $afterGet(queryContext) {// Do nothing by default.
    }
  }, {
    key: "$beforeDelete",
    value: function $beforeDelete(queryContext) {// Do nothing by default.
    }
  }, {
    key: "$afterDelete",
    value: function $afterDelete(queryContext) {// Do nothing by default.
    }
  }, {
    key: "$omit",
    value: function $omit() {
      return omit(this, arguments);
    }
  }, {
    key: "$pick",
    value: function $pick() {
      return pick(this, arguments);
    }
  }, {
    key: "$values",
    value: function $values(props) {
      return values(this, props);
    }
  }, {
    key: "$propKey",
    value: function $propKey(props) {
      return propKey(this, props);
    }
  }, {
    key: "$idKey",
    value: function $idKey() {
      return this.$propKey(this.constructor.getIdPropertyArray());
    }
  }, {
    key: "$clone",
    value: function $clone(opt) {
      return clone(this, !!(opt && opt.shallow), false);
    }
  }, {
    key: "$traverse",
    value: function $traverse(filterConstructor, callback) {
      if (callback === undefined) {
        callback = filterConstructor;
        filterConstructor = null;
      }

      this.constructor.traverse(filterConstructor, this, callback);
      return this;
    }
  }, {
    key: "$omitFromJson",
    value: function $omitFromJson(props) {
      if (arguments.length === 0) {
        return this.$$omitFromJson;
      } else {
        if (!this.hasOwnProperty('$$omitFromJson')) {
          defineNonEnumerableProperty(this, '$$omitFromJson', props);
        } else {
          this.$$omitFromJson = this.$$omitFromJson.concat(props);
        }
      }
    }
  }, {
    key: "$omitFromDatabaseJson",
    value: function $omitFromDatabaseJson(props) {
      if (arguments.length === 0) {
        return this.$$omitFromDatabaseJson;
      } else {
        if (!this.hasOwnProperty('$$omitFromDatabaseJson')) {
          defineNonEnumerableProperty(this, '$$omitFromDatabaseJson', props);
        } else {
          this.$$omitFromDatabaseJson = this.$$omitFromDatabaseJson.concat(props);
        }
      }
    }
  }, {
    key: "$knex",
    value: function $knex() {
      return this.constructor.knex();
    }
  }, {
    key: "$transaction",
    value: function $transaction() {
      return this.constructor.transaction();
    }
  }, {
    key: "$ref",
    get: function get() {
      return this.constructor.ref;
    }
  }], [{
    key: "fromJson",
    value: function fromJson(json, options) {
      var model = new this();
      model.$setJson(json || {}, options);
      return model;
    }
  }, {
    key: "fromDatabaseJson",
    value: function fromDatabaseJson(json) {
      var model = new this();
      model.$setDatabaseJson(json || {});
      return model;
    }
  }, {
    key: "omitImpl",
    value: function omitImpl(obj, prop) {
      delete obj[prop];
    }
  }, {
    key: "joinTableAlias",
    value: function joinTableAlias(relationPath) {
      return "".concat(relationPath, "_join");
    }
  }, {
    key: "createValidator",
    value: function createValidator() {
      return new AjvValidator({
        onCreateAjv: function onCreateAjv(ajv) {
          /* Do Nothing by default */
        },
        options: {
          allErrors: true,
          validateSchema: false,
          ownProperties: true,
          v5: true
        }
      });
    }
  }, {
    key: "modifierNotFound",
    value: function modifierNotFound(builder, modifier) {
      throw new this.ModifierNotFoundError(modifier);
    }
  }, {
    key: "createNotFoundError",
    value: function createNotFoundError(ctx, props) {
      return new this.NotFoundError(props);
    }
  }, {
    key: "createValidationError",
    value: function createValidationError(props) {
      return new this.ValidationError(props);
    }
  }, {
    key: "getTableName",
    value: function getTableName() {
      var tableName = this.tableName;

      if (isFunction(tableName)) {
        tableName = this.tableName();
      }

      if (!isString(tableName)) {
        throw new Error("Model ".concat(this.name, " must have a static property tableName"));
      }

      return tableName;
    }
  }, {
    key: "getIdColumn",
    value: function getIdColumn() {
      var idColumn = this.idColumn;

      if (isFunction(idColumn)) {
        idColumn = this.idColumn();
      }

      return idColumn;
    }
  }, {
    key: "getValidator",
    value: function getValidator() {
      return cachedGet(this, '$$validator', _getValidator);
    }
  }, {
    key: "getJsonSchema",
    value: function getJsonSchema() {
      return cachedGet(this, '$$jsonSchema', _getJsonSchema);
    }
  }, {
    key: "getJsonAttributes",
    value: function getJsonAttributes() {
      return cachedGet(this, '$$jsonAttributes', _getJsonAttributes);
    }
  }, {
    key: "getColumnNameMappers",
    value: function getColumnNameMappers() {
      return cachedGet(this, '$$columnNameMappers', _getColumnNameMappers);
    }
  }, {
    key: "getConcurrency",
    value: function getConcurrency(knex) {
      if (this.concurrency === null) {
        // The mssql driver is shit, and we cannot have concurrent queries.
        if (isMsSql(knex)) {
          return 1;
        } else {
          return 4;
        }
      } else {
        if (isFunction(this.concurrency)) {
          return this.concurrency();
        } else {
          return this.concurrency;
        }
      }
    }
  }, {
    key: "getModifiers",
    value: function getModifiers() {
      return this.modifiers || this.namedFilters || {};
    }
  }, {
    key: "columnNameToPropertyName",
    value: function columnNameToPropertyName(columnName) {
      var colToProp = cachedGet(this, '$$colToProp', function () {
        return new Map();
      });
      var propertyName = colToProp.get(columnName);

      if (!propertyName) {
        propertyName = _columnNameToPropertyName(this, columnName);
        colToProp.set(columnName, propertyName);
      }

      return propertyName;
    }
  }, {
    key: "propertyNameToColumnName",
    value: function propertyNameToColumnName(propertyName) {
      var propToCol = cachedGet(this, '$$propToCol', function () {
        return new Map();
      });
      var columnName = propToCol.get(propertyName);

      if (!columnName) {
        columnName = _propertyNameToColumnName(this, propertyName);
        propToCol.set(propertyName, columnName);
      }

      return columnName;
    }
  }, {
    key: "getReadOnlyVirtualAttributes",
    value: function getReadOnlyVirtualAttributes() {
      return cachedGet(this, '$$readOnlyVirtualAttributes', _getReadOnlyVirtualAttributes);
    }
  }, {
    key: "getIdRelationProperty",
    value: function getIdRelationProperty() {
      return cachedGet(this, '$$idRelationProperty', _getIdRelationProperty);
    }
  }, {
    key: "getIdColumnArray",
    value: function getIdColumnArray() {
      return this.getIdRelationProperty().cols;
    }
  }, {
    key: "getIdPropertyArray",
    value: function getIdPropertyArray() {
      return this.getIdRelationProperty().props;
    }
  }, {
    key: "getIdProperty",
    value: function getIdProperty() {
      var idProps = this.getIdPropertyArray();

      if (idProps.length === 1) {
        return idProps[0];
      } else {
        return idProps;
      }
    }
  }, {
    key: "getRelations",
    value: function getRelations() {
      return cachedGet(this, '$$relations', _getRelations);
    }
  }, {
    key: "getRelationArray",
    value: function getRelationArray() {
      return cachedGet(this, '$$relationArray', _getRelationArray);
    }
  }, {
    key: "query",
    value: function query(trx) {
      return this.QueryBuilder.forClass(this).transacting(trx);
    }
  }, {
    key: "relatedQuery",
    value: function relatedQuery(relationName) {
      var relation = this.getRelation(relationName);
      var modelClass = relation.relatedModelClass;
      return modelClass.query().alias(relation.name).findOperationFactory(function (builder) {
        return relation.subQuery(builder);
      });
    }
  }, {
    key: "fetchTableMetadata",
    value: function fetchTableMetadata(opt) {
      return _fetchTableMetadata(this, opt);
    }
  }, {
    key: "tableMetadata",
    value: function tableMetadata(opt) {
      return _tableMetadata(this, opt);
    }
  }, {
    key: "knex",
    value: function knex() {
      if (arguments.length) {
        defineNonEnumerableProperty(this, '$$knex', arguments[0]);
      } else {
        return this.$$knex;
      }
    }
  }, {
    key: "transaction",
    value: function transaction() {
      return this.knex();
    }
  }, {
    key: "raw",
    value: function raw() {
      return _raw.apply(undefined, arguments).toKnexRaw(this);
    }
  }, {
    key: "knexQuery",
    value: function knexQuery() {
      return this.knex().table(this.getTableName());
    }
  }, {
    key: "uniqueTag",
    value: function uniqueTag() {
      if (this.name) {
        return "".concat(this.getTableName(), "_").concat(this.name);
      } else {
        return this.getTableName();
      }
    }
  }, {
    key: "bindKnex",
    value: function bindKnex(knex) {
      return _bindKnex(this, knex);
    }
  }, {
    key: "bindTransaction",
    value: function bindTransaction(trx) {
      return _bindKnex(this, trx);
    }
  }, {
    key: "ensureModel",
    value: function ensureModel(model, options) {
      var modelClass = this;

      if (!model) {
        return null;
      }

      if (model instanceof modelClass) {
        return parseRelationsIntoModelInstances(model, model, options);
      } else {
        return modelClass.fromJson(model, options);
      }
    }
  }, {
    key: "ensureModelArray",
    value: function ensureModelArray(input, options) {
      if (!input) {
        return [];
      }

      if (Array.isArray(input)) {
        var models = new Array(input.length);

        for (var i = 0, l = input.length; i < l; ++i) {
          models[i] = this.ensureModel(input[i], options);
        }

        return models;
      } else {
        return [this.ensureModel(input, options)];
      }
    }
  }, {
    key: "getRelation",
    value: function getRelation(name) {
      var relation = this.getRelations()[name];

      if (!relation) {
        throw new Error("A model class ".concat(this.name, " doesn't have relation ").concat(name));
      }

      return relation;
    }
  }, {
    key: "loadRelated",
    value: function loadRelated($models, expression, modifiers, trx) {
      return this.query(trx).resolve(this.ensureModelArray($models)).findOptions({
        dontCallAfterGet: true
      }).eager(expression, modifiers).runAfter(function (models) {
        return Array.isArray($models) ? models : models[0];
      });
    }
  }, {
    key: "traverse",
    value: function traverse(filterConstructor, models, traverser) {
      filterConstructor = filterConstructor || null;

      if (traverser === undefined) {
        traverser = models;
        models = filterConstructor;
        filterConstructor = null;
      }

      if (!isFunction(traverser)) {
        throw new Error('traverser must be a function');
      }

      if (!models || Array.isArray(models) && !models.length) {
        return this;
      }

      var modelClass = Array.isArray(models) ? models[0].constructor : models.constructor;
      visitModels(models, modelClass, function (model, modelClass, parent, relation) {
        if (!filterConstructor || model instanceof filterConstructor) {
          traverser(model, parent, relation && relation.name);
        }
      });
      return this;
    }
  }, {
    key: "objectionModelClass",
    get: function get() {
      return Model;
    }
  }, {
    key: "ref",
    get: function get() {
      var _this3 = this;

      return function () {
        return ref.apply(void 0, arguments).model(_this3);
      };
    }
    /**
     * NB. for v2.0, this can simply return `this.knex().fn`.
     * However, in order to maintain backwards comparability of a bug that didn't
     * have this method as a getter, the returned value needs to be callable and
     * return the "same" `knex#FunctionHelper` instance.
     * The effect is that `Model.fn.now()` and `Model.fn().now()` produce the same result.
     */

  }, {
    key: "fn",
    get: function get() {
      var fnHelper = this.knex().fn;

      var wrapper = function wrapper() {
        return fnHelper;
      };

      Object.assign(wrapper, fnHelper);
      Object.setPrototypeOf(wrapper, Object.getPrototypeOf(fnHelper));
      return wrapper;
    }
  }]);

  return Model;
}();

Object.defineProperties(Model.prototype, {
  $isObjectionModel: {
    enumerable: false,
    writable: false,
    value: true
  },
  $objectionModelClass: {
    enumerable: false,
    writable: false,
    value: Model
  }
});
Model.QueryBuilder = QueryBuilder;
Model.HasOneRelation = HasOneRelation;
Model.HasManyRelation = HasManyRelation;
Model.ManyToManyRelation = ManyToManyRelation;
Model.BelongsToOneRelation = BelongsToOneRelation;
Model.HasOneThroughRelation = HasOneThroughRelation;
Model.JoinEagerAlgorithm = JoinEagerAlgorithm;
Model.NaiveEagerAlgorithm = NaiveEagerAlgorithm;
Model.WhereInEagerAlgorithm = WhereInEagerAlgorithm;
Model.ValidationError = ValidationError;
Model.NotFoundError = NotFoundError;
Model.ModifierNotFoundError = ModifierNotFoundError;
Model.tableName = null;
Model.jsonSchema = null;
Model.idColumn = 'id';
Model.uidProp = '#id';
Model.uidRefProp = '#ref';
Model.dbRefProp = '#dbRef';
Model.propRefRegex = /#ref{([^\.]+)\.([^}]+)}/g;
Model.jsonAttributes = null;
Model.virtualAttributes = null;
Model.relationMappings = null;
Model.modelPaths = [];
Model.pickJsonSchemaProperties = false;
Model.defaultEagerAlgorithm = WhereInEagerAlgorithm;
Model.defaultEagerOptions = Object.freeze({
  minimize: false,
  separator: ':',
  aliases: {}
});
Model.defaultFindOptions = Object.freeze({});
Model.modifiers = null;
Model.namedFilters = null;
Model.useLimitInFirst = false;
Model.columnNameMappers = null;
Model.relatedFindQueryMutates = true;
Model.relatedInsertQueryMutates = true;
Model.concurrency = null;

function cachedGet(target, hiddenPropertyName, creator) {
  if (!target.hasOwnProperty(hiddenPropertyName)) {
    defineNonEnumerableProperty(target, hiddenPropertyName, creator(target));
  }

  return target[hiddenPropertyName];
}

function _getValidator(modelClass) {
  return modelClass.createValidator();
}

function _getJsonSchema(modelClass) {
  return modelClass.jsonSchema;
}

function _getColumnNameMappers(modelClass) {
  return modelClass.columnNameMappers;
}

function _getIdRelationProperty(modelClass) {
  var idColumn = asArray(modelClass.getIdColumn());
  return new RelationProperty(idColumn.map(function (idCol) {
    return "".concat(modelClass.getTableName(), ".").concat(idCol);
  }), function () {
    return modelClass;
  });
}

function _getReadOnlyVirtualAttributes(modelClass) {
  var virtuals = modelClass.virtualAttributes;

  if (!Array.isArray(virtuals)) {
    return null;
  }

  return virtuals.filter(function (virtual) {
    var desc = Object.getOwnPropertyDescriptor(modelClass.prototype, virtual);

    if (!desc) {
      return false;
    }

    return desc.get && !desc.set || desc.writable === false || isFunction(desc.value);
  });
}

function _getRelations(modelClass) {
  var relationMappings = modelClass.relationMappings;

  if (isFunction(relationMappings)) {
    relationMappings = relationMappings.call(modelClass);
  }

  return Object.keys(relationMappings || {}).reduce(function (relations, relationName) {
    var mapping = relationMappings[relationName];
    relations[relationName] = new mapping.relation(relationName, modelClass);
    relations[relationName].setMapping(mapping);
    return relations;
  }, Object.create(null));
}

function _getRelationArray(modelClass) {
  var relations = modelClass.getRelations();
  return Object.keys(relations).map(function (key) {
    return relations[key];
  });
}

module.exports = Model;