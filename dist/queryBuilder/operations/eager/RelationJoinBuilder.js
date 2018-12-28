'use strict';

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var promiseUtils = require('../../../utils/promiseUtils');

var _require = require('../select/Selection'),
    Selection = _require.Selection;

var _require2 = require('../../../utils/objectUtils'),
    uniqBy = _require2.uniqBy,
    values = _require2.values;

var _require3 = require('../../../model/ValidationError'),
    ValidationErrorType = _require3.Type;

var _require4 = require('../../../utils/createModifier'),
    createModifier = _require4.createModifier;

var ID_LENGTH_LIMIT = 63;
var RELATION_RECURSION_LIMIT = 64;

var RelationJoinBuilder =
/*#__PURE__*/
function () {
  function RelationJoinBuilder(_ref) {
    var modelClass = _ref.modelClass,
        expression = _ref.expression,
        _ref$modifiers = _ref.modifiers,
        modifiers = _ref$modifiers === void 0 ? Object.create(null) : _ref$modifiers;

    _classCallCheck(this, RelationJoinBuilder);

    this.rootModelClass = modelClass;
    this.expression = expression;
    this.modifiers = modifiers;
    this.allRelations = null;
    this.pathInfo = new Map();
    this.encodings = new Map();
    this.decodings = new Map();
    this.encIdx = 0;
    this.opt = {
      minimize: false,
      separator: ':',
      aliases: {}
    };
  }

  _createClass(RelationJoinBuilder, [{
    key: "setOptions",
    value: function setOptions(opt) {
      this.opt = Object.assign(this.opt, opt);
    }
    /**
     * Fetches the column information needed for building the select clauses.
     * This must be called before calling `build`. `buildJoinOnly` can be called
     * without this since it doesn't build selects.
     */

  }, {
    key: "fetchColumnInfo",
    value: function fetchColumnInfo(builder) {
      var allModelClasses = findAllModels(this.expression, this.rootModelClass);
      return promiseUtils.map(allModelClasses, function (modelClass) {
        return modelClass.fetchTableMetadata({
          parentBuilder: builder
        });
      }, {
        concurrency: this.rootModelClass.getConcurrency(builder.unsafeKnex())
      });
    }
  }, {
    key: "buildJoinOnly",
    value: function buildJoinOnly(builder) {
      this.doBuild({
        expr: this.expression,
        builder: builder,
        modelClass: builder.modelClass(),
        joinOperation: this.opt.joinOperation || 'leftJoin',
        parentInfo: null,
        relation: null,
        noSelects: true,
        path: ''
      });
    }
  }, {
    key: "build",
    value: function build(builder) {
      var tableName = builder.tableNameFor(this.rootModelClass.getTableName());
      var tableAlias = builder.tableRefFor(this.rootModelClass.getTableName());

      if (tableName === tableAlias) {
        builder.table(tableName);
      } else {
        builder.table("".concat(tableName, " as ").concat(tableAlias));
      }

      this.doBuild({
        expr: this.expression,
        builder: builder,
        modelClass: builder.modelClass(),
        joinOperation: this.opt.joinOperation || 'leftJoin',
        selectFilterQuery: builder.clone(),
        parentInfo: null,
        relation: null,
        path: ''
      });
    }
  }, {
    key: "rowsToTree",
    value: function rowsToTree(rows) {
      if (!Array.isArray(rows) || rows.length === 0) {
        return rows;
      }

      var keyInfoByPath = this.createKeyInfo(rows);
      var pathInfo = Array.from(this.pathInfo.values());
      var tree = Object.create(null);
      var stack = new Map();

      for (var i = 0, lr = rows.length; i < lr; ++i) {
        var row = rows[i];
        var curBranch = tree;

        for (var j = 0, lp = pathInfo.length; j < lp; ++j) {
          var pInfo = pathInfo[j];
          var id = pInfo.idGetter(row);
          var model = void 0;

          if (id === null) {
            continue;
          }

          if (pInfo.relation) {
            var parentModel = stack.get(pInfo.encParentPath);
            curBranch = pInfo.getBranch(parentModel);

            if (!curBranch) {
              curBranch = pInfo.createBranch(parentModel);
            }
          }

          model = pInfo.getModelFromBranch(curBranch, id);

          if (!model) {
            model = createModel(row, pInfo, keyInfoByPath);
            pInfo.setModelToBranch(curBranch, id, model);
          }

          stack.set(pInfo.encPath, model);
        }
      }

      return this.finalize(pathInfo[0], values(tree));
    }
  }, {
    key: "createKeyInfo",
    value: function createKeyInfo(rows) {
      var keys = Object.keys(rows[0]);
      var keyInfo = new Map();

      for (var i = 0, l = keys.length; i < l; ++i) {
        var key = keys[i];
        var sepIdx = key.lastIndexOf(this.sep);
        var col = void 0,
            pInfo = void 0;

        if (sepIdx === -1) {
          pInfo = this.pathInfo.get('');
          col = key;
        } else {
          var encPath = key.substr(0, sepIdx);
          var path = this.decode(encPath);
          col = key.substr(sepIdx + this.sep.length);
          pInfo = this.pathInfo.get(path);
        }

        if (!pInfo.omitCols.has(col)) {
          var infoArr = keyInfo.get(pInfo.encPath);

          if (!infoArr) {
            infoArr = [];
            keyInfo.set(pInfo.encPath, infoArr);
          }

          infoArr.push({
            pInfo: pInfo,
            key: key,
            col: col
          });
        }
      }

      return keyInfo;
    }
  }, {
    key: "finalize",
    value: function finalize(pInfo, models) {
      var relNames = Array.from(pInfo.children.keys());

      if (Array.isArray(models)) {
        for (var m = 0, lm = models.length; m < lm; ++m) {
          this.finalizeOne(pInfo, relNames, models[m]);
        }
      } else if (models) {
        this.finalizeOne(pInfo, relNames, models);
      }

      return models;
    }
  }, {
    key: "finalizeOne",
    value: function finalizeOne(pInfo, relNames, model) {
      for (var r = 0, lr = relNames.length; r < lr; ++r) {
        var relName = relNames[r];
        var branch = model[relName];
        var childPathInfo = pInfo.children.get(relName);
        var finalized = childPathInfo.finalizeBranch(branch, model);
        this.finalize(childPathInfo, finalized);
      }
    }
  }, {
    key: "doBuild",
    value: function doBuild(_ref2) {
      var _this = this;

      var expr = _ref2.expr,
          builder = _ref2.builder,
          relation = _ref2.relation,
          modelClass = _ref2.modelClass,
          selectFilterQuery = _ref2.selectFilterQuery,
          joinOperation = _ref2.joinOperation,
          parentInfo = _ref2.parentInfo,
          noSelects = _ref2.noSelects,
          path = _ref2.path;

      if (!this.allRelations) {
        this.allRelations = findAllRelations(this.expression, this.rootModelClass);
      }

      var info = this.createPathInfo({
        modelClass: modelClass,
        path: path,
        expr: expr,
        relation: relation,
        parentInfo: parentInfo
      });
      this.pathInfo.set(path, info);

      if (!noSelects) {
        this.buildSelects({
          builder: builder,
          selectFilterQuery: selectFilterQuery,
          modelClass: modelClass,
          relation: relation,
          info: info
        });
      }

      forEachExpr(expr, modelClass, function (childExpr, relation) {
        var nextPath = _this.joinPath(path, childExpr.$name);

        var encNextPath = _this.encode(nextPath);

        var encJoinTablePath = relation.joinTable ? _this.encode(modelClass.joinTableAlias(nextPath)) : null;
        var ownerTable = info.encPath || undefined;
        var modifierQuery = createModifierQuery({
          builder: builder,
          modelClass: modelClass,
          relation: relation,
          expr: childExpr,
          modifiers: _this.modifiers
        });
        var relatedJoinSelectQuery = createRelatedJoinFromQuery({
          modifierQuery: modifierQuery,
          relation: relation,
          allRelations: _this.allRelations
        });
        relation.join(builder, {
          ownerTable: ownerTable,
          joinOperation: joinOperation,
          relatedTableAlias: encNextPath,
          joinTableAlias: encJoinTablePath,
          relatedJoinSelectQuery: relatedJoinSelectQuery
        }); // Apply relation.modify since it may also contains selections. Don't move this
        // to the createModifierQuery function because relatedJoinSelectQuery is cloned
        // from the return value of that function and we don't want relation.modify
        // to be called twice for it.

        modifierQuery.modify(relation.modify);

        _this.doBuild({
          expr: childExpr,
          builder: builder,
          modelClass: relation.relatedModelClass,
          joinOperation: joinOperation,
          relation: relation,
          parentInfo: info,
          noSelects: noSelects,
          path: nextPath,
          selectFilterQuery: modifierQuery
        });
      });
    }
  }, {
    key: "createPathInfo",
    value: function createPathInfo(_ref3) {
      var modelClass = _ref3.modelClass,
          path = _ref3.path,
          expr = _ref3.expr,
          relation = _ref3.relation,
          parentInfo = _ref3.parentInfo;
      var encPath = this.encode(path);
      var info;

      if (relation && relation.isOneToOne()) {
        info = new OneToOnePathInfo();
      } else {
        info = new PathInfo();
      }

      info.path = path;
      info.encPath = encPath;
      info.parentPath = parentInfo && parentInfo.path;
      info.encParentPath = parentInfo && parentInfo.encPath;
      info.modelClass = modelClass;
      info.relation = relation;
      info.idGetter = this.createIdGetter(modelClass, encPath);
      info.relationAlias = expr.$name;

      if (parentInfo) {
        parentInfo.children.set(expr.$name, info);
      }

      return info;
    }
  }, {
    key: "buildSelects",
    value: function buildSelects(_ref4) {
      var builder = _ref4.builder,
          selectFilterQuery = _ref4.selectFilterQuery,
          modelClass = _ref4.modelClass,
          relation = _ref4.relation,
          info = _ref4.info;
      var selects = [];
      var idCols = modelClass.getIdColumnArray();
      var rootTable = builder.tableRefFor(this.rootModelClass.getTableName());
      var isSelectFilterQuerySubQuery = !!info.encPath;
      var selections = selectFilterQuery.findAllSelections();
      var selectAllIndex = selections.findIndex(isSelectAll); // If there are no explicit selects, or there is a `select *` item,
      // we need to select all columns using the schema information
      // in `modelClass.tableMetadata()`.

      if (selections.length === 0 || selectAllIndex !== -1) {
        var table = builder.tableNameFor(modelClass.getTableName());
        selections.splice(selectAllIndex, 1);
        selections = modelClass.tableMetadata({
          table: table
        }).columns.map(function (it) {
          return new Selection(null, it);
        }).concat(selections);
      } // Id columns always need to be selected so that we are able to construct
      // the tree structure from the flat columns.


      var _loop = function _loop(i, l) {
        var idCol = idCols[i];

        if (!selections.some(function (it) {
          return it.name === idCol;
        })) {
          info.omitCols.add(idCol);
          selections.unshift(new Selection(null, idCol));
        }
      };

      for (var i = 0, l = idCols.length; i < l; ++i) {
        _loop(i, l);
      }

      for (var i = 0, l = selections.length; i < l; ++i) {
        var selection = selections[i]; // If `selections` come from a subquery, we need to use the possible alias instead
        // of the column name because that's what the root query sees instead of the real
        // column name.

        var col = isSelectFilterQuerySubQuery ? selection.name : selection.column;
        var name = selection.name;
        var fullCol = "".concat(info.encPath || rootTable, ".").concat(col);
        var alias = this.joinPath(info.encPath, name);

        if (!builder.hasSelectionAs(fullCol, alias, true)) {
          checkAliasLength(modelClass, alias);
          selects.push("".concat(fullCol, " as ").concat(alias));
        }
      }

      if (relation && relation.joinTableExtras) {
        var joinTable = this.encode(modelClass.joinTableAlias(info.path));

        for (var _i = 0, _l = relation.joinTableExtras.length; _i < _l; ++_i) {
          var extra = relation.joinTableExtras[_i];
          var filterPassed = selectFilterQuery.hasSelection(extra.joinTableCol);

          if (filterPassed) {
            var _fullCol = "".concat(joinTable, ".").concat(extra.joinTableCol);

            if (!builder.hasSelection(_fullCol, true)) {
              var _alias = this.joinPath(info.encPath, extra.aliasCol);

              checkAliasLength(modelClass, _alias);
              selects.push("".concat(_fullCol, " as ").concat(_alias));
            }
          }
        }
      }

      builder.select(selects);
    }
  }, {
    key: "encode",
    value: function encode(path) {
      var _this2 = this;

      if (!this.opt.minimize) {
        var encPath = this.encodings.get(path);

        if (!encPath) {
          var parts = path.split(this.sep); // Don't encode the root.

          if (!path) {
            encPath = path;
          } else {
            encPath = parts.map(function (part) {
              return _this2.opt.aliases[part] || part;
            }).join(this.sep);
          }

          this.encodings.set(path, encPath);
          this.decodings.set(encPath, path);
        }

        return encPath;
      } else {
        var _encPath = this.encodings.get(path);

        if (!_encPath) {
          // Don't encode the root.
          if (!path) {
            _encPath = path;
          } else {
            _encPath = this.nextEncodedPath();
          }

          this.encodings.set(path, _encPath);
          this.decodings.set(_encPath, path);
        }

        return _encPath;
      }
    }
  }, {
    key: "decode",
    value: function decode(path) {
      return this.decodings.get(path);
    }
  }, {
    key: "nextEncodedPath",
    value: function nextEncodedPath() {
      return "_t".concat(++this.encIdx);
    }
  }, {
    key: "createIdGetter",
    value: function createIdGetter(modelClass, path) {
      var _this3 = this;

      var idCols = modelClass.getIdColumnArray().map(function (col) {
        return _this3.joinPath(path, col);
      });

      if (idCols.length === 1) {
        return createSingleIdGetter(idCols);
      } else if (idCols.length === 2) {
        return createTwoIdGetter(idCols);
      } else if (idCols.length === 3) {
        return createThreeIdGetter(idCols);
      } else {
        return createNIdGetter(idCols);
      }
    }
  }, {
    key: "joinPath",
    value: function joinPath(path, nextPart) {
      if (path) {
        return "".concat(path).concat(this.sep).concat(nextPart);
      } else {
        return nextPart;
      }
    }
  }, {
    key: "sep",
    get: function get() {
      return this.opt.separator;
    }
  }]);

  return RelationJoinBuilder;
}();

function findAllModels(expr, modelClass) {
  var modelClasses = [];
  findAllModelsImpl(expr, modelClass, modelClasses);
  return uniqBy(modelClasses, getTableName);
}

function getTableName(modelClass) {
  return modelClass.getTableName();
}

function findAllModelsImpl(expr, modelClass, models) {
  models.push(modelClass);
  forEachExpr(expr, modelClass, function (childExpr, relation) {
    findAllModelsImpl(childExpr, relation.relatedModelClass, models);
  });
}

function findAllRelations(expr, modelClass) {
  var relations = [];
  findAllRelationsImpl(expr, modelClass, relations);
  return uniqBy(relations);
}

function findAllRelationsImpl(expr, modelClass, relations) {
  forEachExpr(expr, modelClass, function (childExpr, relation) {
    relations.push(relation);
    findAllRelationsImpl(childExpr, relation.relatedModelClass, relations);
  });
}

function forEachExpr(expr, modelClass, callback) {
  var relations = modelClass.getRelations();

  if (expr.isAllRecursive || expr.maxRecursionDepth > RELATION_RECURSION_LIMIT) {
    throw modelClass.createValidationError({
      type: ValidationErrorType.RelationExpression,
      message: "recursion depth of eager expression ".concat(expr.toString(), " too big for JoinEagerAlgorithm")
    });
  }

  expr.forEachChildExpression(relations, callback);
}

function createSingleIdGetter(idCols) {
  var idCol = idCols[0];
  return function (row) {
    var val = row[idCol];

    if (isNullOrUndefined(val)) {
      return null;
    } else {
      return "id:".concat(val);
    }
  };
}

function createTwoIdGetter(idCols) {
  var idCol1 = idCols[0];
  var idCol2 = idCols[1];
  return function (row) {
    var val1 = row[idCol1];
    var val2 = row[idCol2];

    if (isNullOrUndefined(val1) || isNullOrUndefined(val2)) {
      return null;
    } else {
      return "id:".concat(val1, ",").concat(val2);
    }
  };
}

function createThreeIdGetter(idCols) {
  var idCol1 = idCols[0];
  var idCol2 = idCols[1];
  var idCol3 = idCols[2];
  return function (row) {
    var val1 = row[idCol1];
    var val2 = row[idCol2];
    var val3 = row[idCol3];

    if (isNullOrUndefined(val1) || isNullOrUndefined(val2) || isNullOrUndefined(val3)) {
      return null;
    } else {
      return "id:".concat(val1, ",").concat(val2, ",").concat(val3);
    }
  };
}

function createNIdGetter(idCols) {
  return function (row) {
    var id = 'id:';

    for (var i = 0, l = idCols.length; i < l; ++i) {
      var val = row[idCols[i]];

      if (isNullOrUndefined(val)) {
        return null;
      }

      id += (i > 0 ? ',' : '') + val;
    }

    return id;
  };
}

function isNullOrUndefined(val) {
  return val === null || val === undefined;
}

function createModifierQuery(_ref5) {
  var builder = _ref5.builder,
      modelClass = _ref5.modelClass,
      expr = _ref5.expr,
      modifiers = _ref5.modifiers,
      relation = _ref5.relation;
  var modifierQuery = relation.relatedModelClass.query().childQueryOf(builder);

  for (var i = 0, l = expr.$modify.length; i < l; ++i) {
    var modifierName = expr.$modify[i];
    var modifier = createModifier({
      modifier: modifierName,
      modelClass: relation.relatedModelClass,
      modifiers: modifiers
    });

    try {
      modifier(modifierQuery);
    } catch (err) {
      if (err instanceof modelClass.ModifierNotFoundError) {
        throw modelClass.createValidationError({
          type: ValidationErrorType.RelationExpression,
          message: "could not find modifier \"".concat(modifierName, "\" for relation \"").concat(relation.name, "\"")
        });
      } else {
        throw err;
      }
    }
  }

  return modifierQuery;
}

function createRelatedJoinFromQuery(_ref6) {
  var modifierQuery = _ref6.modifierQuery,
      relation = _ref6.relation,
      allRelations = _ref6.allRelations;
  var relatedJoinFromQuery = modifierQuery.clone();
  var tableRef = modifierQuery.tableRefFor(relation.relatedModelClass.getTableName());
  var allForeignKeys = findAllForeignKeysForModel({
    modelClass: relation.relatedModelClass,
    allRelations: allRelations
  });
  return relatedJoinFromQuery.select(allForeignKeys.filter(function (col) {
    return !relatedJoinFromQuery.hasSelectionAs(col, col);
  }).map(function (col) {
    return "".concat(tableRef, ".").concat(col);
  }));
}

function findAllForeignKeysForModel(_ref7) {
  var modelClass = _ref7.modelClass,
      allRelations = _ref7.allRelations;
  var foreignKeys = modelClass.getIdColumnArray().slice();
  allRelations.forEach(function (rel) {
    if (rel.relatedModelClass === modelClass) {
      rel.relatedProp.cols.forEach(function (col) {
        return foreignKeys.push(col);
      });
    }

    if (rel.ownerModelClass === modelClass) {
      rel.ownerProp.cols.forEach(function (col) {
        return foreignKeys.push(col);
      });
    }
  });
  return uniqBy(foreignKeys);
}

function createModel(row, pInfo, keyInfoByPath) {
  var keyInfo = keyInfoByPath.get(pInfo.encPath);
  var json = {};

  for (var k = 0, lk = keyInfo.length; k < lk; ++k) {
    var kInfo = keyInfo[k];
    json[kInfo.col] = row[kInfo.key];
  }

  return pInfo.modelClass.fromDatabaseJson(json);
}

function checkAliasLength(modelClass, alias) {
  if (alias.length > ID_LENGTH_LIMIT) {
    throw modelClass.createValidationError({
      type: ValidationErrorType.RelationExpression,
      message: "identifier ".concat(alias, " is over ").concat(ID_LENGTH_LIMIT, " characters long and would be truncated by the database engine.")
    });
  }
}

function isSelectAll(selection) {
  return selection.column === '*';
}

var PathInfo =
/*#__PURE__*/
function () {
  function PathInfo() {
    _classCallCheck(this, PathInfo);

    this.path = null;
    this.encPath = null;
    this.encParentPath = null;
    this.modelClass = null;
    this.relation = null;
    this.omitCols = new Set();
    this.children = new Map();
    this.idGetter = null;
    this.relationAlias = null;
  }

  _createClass(PathInfo, [{
    key: "createBranch",
    value: function createBranch(parentModel) {
      var branch = Object.create(null);
      parentModel[this.relationAlias] = branch;
      return branch;
    }
  }, {
    key: "getBranch",
    value: function getBranch(parentModel) {
      return parentModel[this.relationAlias];
    }
  }, {
    key: "getModelFromBranch",
    value: function getModelFromBranch(branch, id) {
      return branch[id];
    }
  }, {
    key: "setModelToBranch",
    value: function setModelToBranch(branch, id, model) {
      branch[id] = model;
    }
  }, {
    key: "finalizeBranch",
    value: function finalizeBranch(branch, parentModel) {
      var relModels = values(branch);
      parentModel[this.relationAlias] = relModels;
      return relModels;
    }
  }]);

  return PathInfo;
}();

var OneToOnePathInfo =
/*#__PURE__*/
function (_PathInfo) {
  _inherits(OneToOnePathInfo, _PathInfo);

  function OneToOnePathInfo() {
    _classCallCheck(this, OneToOnePathInfo);

    return _possibleConstructorReturn(this, _getPrototypeOf(OneToOnePathInfo).apply(this, arguments));
  }

  _createClass(OneToOnePathInfo, [{
    key: "createBranch",
    value: function createBranch(parentModel) {
      return parentModel;
    }
  }, {
    key: "getBranch",
    value: function getBranch(parentModel) {
      return parentModel;
    }
  }, {
    key: "getModelFromBranch",
    value: function getModelFromBranch(branch, id) {
      return branch[this.relationAlias];
    }
  }, {
    key: "setModelToBranch",
    value: function setModelToBranch(branch, id, model) {
      branch[this.relationAlias] = model;
    }
  }, {
    key: "finalizeBranch",
    value: function finalizeBranch(branch, parentModel) {
      parentModel[this.relationAlias] = branch || null;
      return branch || null;
    }
  }]);

  return OneToOnePathInfo;
}(PathInfo);

module.exports = RelationJoinBuilder;