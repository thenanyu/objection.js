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

var QueryBuilderOperationSupport = require('./QueryBuilderOperationSupport');

var _require = require('../utils/knexUtils'),
    isSqlite = _require.isSqlite,
    isMsSql = _require.isMsSql;

var KnexOperation = require('./operations/KnexOperation');

var SelectOperation = require('./operations/select/SelectOperation');

var ReturningOperation = require('./operations/ReturningOperation');

var WhereCompositeOperation = require('./operations/WhereCompositeOperation');

var WhereInCompositeOperation = require('./operations/whereInComposite/WhereInCompositeOperation');

var WhereInCompositeSqliteOperation = require('./operations/whereInComposite/WhereInCompositeSqliteOperation');

var WhereInCompositeMsSqlOperation = require('./operations/whereInComposite/WhereInCompositeMsSqlOperation');

var WhereJsonPostgresOperation = require('./operations/jsonApi/WhereJsonPostgresOperation');

var WhereJsonHasPostgresOperation = require('./operations/jsonApi/WhereJsonHasPostgresOperation');

var WhereJsonNotObjectPostgresOperation = require('./operations/jsonApi/WhereJsonNotObjectPostgresOperation');

var QueryBuilderBase =
/*#__PURE__*/
function (_QueryBuilderOperatio) {
  _inherits(QueryBuilderBase, _QueryBuilderOperatio);

  function QueryBuilderBase() {
    _classCallCheck(this, QueryBuilderBase);

    return _possibleConstructorReturn(this, _getPrototypeOf(QueryBuilderBase).apply(this, arguments));
  }

  _createClass(QueryBuilderBase, [{
    key: "modify",
    value: function modify() {
      var func = arguments[0];

      if (!func) {
        return this;
      }

      if (arguments.length === 1) {
        func.call(this, this);
      } else {
        var args = new Array(arguments.length);
        args[0] = this;

        for (var i = 1, l = args.length; i < l; ++i) {
          args[i] = arguments[i];
        }

        func.apply(this, args);
      }

      return this;
    }
  }, {
    key: "transacting",
    value: function transacting(trx) {
      this._context.knex = trx || null;
      return this;
    }
  }, {
    key: "select",
    value: function select() {
      return this.addOperation(new SelectOperation('select'), arguments);
    }
  }, {
    key: "insert",
    value: function insert() {
      return this.addOperation(new KnexOperation('insert'), arguments);
    }
  }, {
    key: "update",
    value: function update() {
      return this.addOperation(new KnexOperation('update'), arguments);
    }
  }, {
    key: "delete",
    value: function _delete() {
      return this.addOperation(new KnexOperation('delete'), arguments);
    }
  }, {
    key: "del",
    value: function del() {
      return this.addOperation(new KnexOperation('delete'), arguments);
    }
  }, {
    key: "forUpdate",
    value: function forUpdate() {
      return this.addOperation(new KnexOperation('forUpdate'), arguments);
    }
  }, {
    key: "forShare",
    value: function forShare() {
      return this.addOperation(new KnexOperation('forShare'), arguments);
    }
  }, {
    key: "as",
    value: function as() {
      return this.addOperation(new KnexOperation('as'), arguments);
    }
  }, {
    key: "columns",
    value: function columns() {
      return this.addOperation(new SelectOperation('columns'), arguments);
    }
  }, {
    key: "column",
    value: function column() {
      return this.addOperation(new SelectOperation('column'), arguments);
    }
  }, {
    key: "from",
    value: function from() {
      return this.addOperation(new KnexOperation('from'), arguments);
    }
  }, {
    key: "fromJS",
    value: function fromJS() {
      return this.addOperation(new KnexOperation('fromJS'), arguments);
    }
  }, {
    key: "into",
    value: function into() {
      return this.addOperation(new KnexOperation('into'), arguments);
    }
  }, {
    key: "withSchema",
    value: function withSchema() {
      return this.addOperation(new KnexOperation('withSchema'), arguments);
    }
  }, {
    key: "table",
    value: function table() {
      return this.addOperation(new KnexOperation('table'), arguments);
    }
  }, {
    key: "distinct",
    value: function distinct() {
      return this.addOperation(new SelectOperation('distinct'), arguments);
    }
  }, {
    key: "join",
    value: function join() {
      return this.addOperation(new KnexOperation('join'), arguments);
    }
  }, {
    key: "joinRaw",
    value: function joinRaw() {
      return this.addOperation(new KnexOperation('joinRaw'), arguments);
    }
  }, {
    key: "innerJoin",
    value: function innerJoin() {
      return this.addOperation(new KnexOperation('innerJoin'), arguments);
    }
  }, {
    key: "leftJoin",
    value: function leftJoin() {
      return this.addOperation(new KnexOperation('leftJoin'), arguments);
    }
  }, {
    key: "leftOuterJoin",
    value: function leftOuterJoin() {
      return this.addOperation(new KnexOperation('leftOuterJoin'), arguments);
    }
  }, {
    key: "rightJoin",
    value: function rightJoin() {
      return this.addOperation(new KnexOperation('rightJoin'), arguments);
    }
  }, {
    key: "rightOuterJoin",
    value: function rightOuterJoin() {
      return this.addOperation(new KnexOperation('rightOuterJoin'), arguments);
    }
  }, {
    key: "outerJoin",
    value: function outerJoin() {
      return this.addOperation(new KnexOperation('outerJoin'), arguments);
    }
  }, {
    key: "fullOuterJoin",
    value: function fullOuterJoin() {
      return this.addOperation(new KnexOperation('fullOuterJoin'), arguments);
    }
  }, {
    key: "crossJoin",
    value: function crossJoin() {
      return this.addOperation(new KnexOperation('crossJoin'), arguments);
    }
  }, {
    key: "where",
    value: function where() {
      return this.addOperation(new KnexOperation('where'), arguments);
    }
  }, {
    key: "andWhere",
    value: function andWhere() {
      return this.addOperation(new KnexOperation('andWhere'), arguments);
    }
  }, {
    key: "orWhere",
    value: function orWhere() {
      return this.addOperation(new KnexOperation('orWhere'), arguments);
    }
  }, {
    key: "whereNot",
    value: function whereNot() {
      return this.addOperation(new KnexOperation('whereNot'), arguments);
    }
  }, {
    key: "orWhereNot",
    value: function orWhereNot() {
      return this.addOperation(new KnexOperation('orWhereNot'), arguments);
    }
  }, {
    key: "whereRaw",
    value: function whereRaw() {
      return this.addOperation(new KnexOperation('whereRaw'), arguments);
    }
  }, {
    key: "andWhereRaw",
    value: function andWhereRaw() {
      return this.addOperation(new KnexOperation('andWhereRaw'), arguments);
    }
  }, {
    key: "orWhereRaw",
    value: function orWhereRaw() {
      return this.addOperation(new KnexOperation('orWhereRaw'), arguments);
    }
  }, {
    key: "whereWrapped",
    value: function whereWrapped() {
      return this.addOperation(new KnexOperation('whereWrapped'), arguments);
    }
  }, {
    key: "havingWrapped",
    value: function havingWrapped() {
      return this.addOperation(new KnexOperation('havingWrapped'), arguments);
    }
  }, {
    key: "whereExists",
    value: function whereExists() {
      return this.addOperation(new KnexOperation('whereExists'), arguments);
    }
  }, {
    key: "orWhereExists",
    value: function orWhereExists() {
      return this.addOperation(new KnexOperation('orWhereExists'), arguments);
    }
  }, {
    key: "whereNotExists",
    value: function whereNotExists() {
      return this.addOperation(new KnexOperation('whereNotExists'), arguments);
    }
  }, {
    key: "orWhereNotExists",
    value: function orWhereNotExists() {
      return this.addOperation(new KnexOperation('orWhereNotExists'), arguments);
    }
  }, {
    key: "whereIn",
    value: function whereIn() {
      return this.addOperation(new KnexOperation('whereIn'), arguments);
    }
  }, {
    key: "orWhereIn",
    value: function orWhereIn() {
      return this.addOperation(new KnexOperation('orWhereIn'), arguments);
    }
  }, {
    key: "whereNotIn",
    value: function whereNotIn() {
      return this.addOperation(new KnexOperation('whereNotIn'), arguments);
    }
  }, {
    key: "orWhereNotIn",
    value: function orWhereNotIn() {
      return this.addOperation(new KnexOperation('orWhereNotIn'), arguments);
    }
  }, {
    key: "whereNull",
    value: function whereNull() {
      return this.addOperation(new KnexOperation('whereNull'), arguments);
    }
  }, {
    key: "orWhereNull",
    value: function orWhereNull() {
      return this.addOperation(new KnexOperation('orWhereNull'), arguments);
    }
  }, {
    key: "whereNotNull",
    value: function whereNotNull() {
      return this.addOperation(new KnexOperation('whereNotNull'), arguments);
    }
  }, {
    key: "orWhereNotNull",
    value: function orWhereNotNull() {
      return this.addOperation(new KnexOperation('orWhereNotNull'), arguments);
    }
  }, {
    key: "whereBetween",
    value: function whereBetween() {
      return this.addOperation(new KnexOperation('whereBetween'), arguments);
    }
  }, {
    key: "andWhereBetween",
    value: function andWhereBetween() {
      return this.addOperation(new KnexOperation('andWhereBetween'), arguments);
    }
  }, {
    key: "whereNotBetween",
    value: function whereNotBetween() {
      return this.addOperation(new KnexOperation('whereNotBetween'), arguments);
    }
  }, {
    key: "andWhereNotBetween",
    value: function andWhereNotBetween() {
      return this.addOperation(new KnexOperation('andWhereNotBetween'), arguments);
    }
  }, {
    key: "orWhereBetween",
    value: function orWhereBetween() {
      return this.addOperation(new KnexOperation('orWhereBetween'), arguments);
    }
  }, {
    key: "orWhereNotBetween",
    value: function orWhereNotBetween() {
      return this.addOperation(new KnexOperation('orWhereNotBetween'), arguments);
    }
  }, {
    key: "groupBy",
    value: function groupBy() {
      return this.addOperation(new KnexOperation('groupBy'), arguments);
    }
  }, {
    key: "groupByRaw",
    value: function groupByRaw() {
      return this.addOperation(new KnexOperation('groupByRaw'), arguments);
    }
  }, {
    key: "orderBy",
    value: function orderBy() {
      return this.addOperation(new KnexOperation('orderBy'), arguments);
    }
  }, {
    key: "orderByRaw",
    value: function orderByRaw() {
      return this.addOperation(new KnexOperation('orderByRaw'), arguments);
    }
  }, {
    key: "union",
    value: function union() {
      return this.addOperation(new KnexOperation('union'), arguments);
    }
  }, {
    key: "unionAll",
    value: function unionAll() {
      return this.addOperation(new KnexOperation('unionAll'), arguments);
    }
  }, {
    key: "having",
    value: function having() {
      return this.addOperation(new KnexOperation('having'), arguments);
    }
  }, {
    key: "orHaving",
    value: function orHaving() {
      return this.addOperation(new KnexOperation('orHaving'), arguments);
    }
  }, {
    key: "havingIn",
    value: function havingIn() {
      return this.addOperation(new KnexOperation('havingIn'), arguments);
    }
  }, {
    key: "orHavingIn",
    value: function orHavingIn() {
      return this.addOperation(new KnexOperation('havingIn'), arguments);
    }
  }, {
    key: "havingNotIn",
    value: function havingNotIn() {
      return this.addOperation(new KnexOperation('havingNotIn'), arguments);
    }
  }, {
    key: "orHavingNotIn",
    value: function orHavingNotIn() {
      return this.addOperation(new KnexOperation('orHavingNotIn'), arguments);
    }
  }, {
    key: "havingNull",
    value: function havingNull() {
      return this.addOperation(new KnexOperation('havingNull'), arguments);
    }
  }, {
    key: "orHavingNull",
    value: function orHavingNull() {
      return this.addOperation(new KnexOperation('orHavingNull'), arguments);
    }
  }, {
    key: "havingNotNull",
    value: function havingNotNull() {
      return this.addOperation(new KnexOperation('havingNotNull'), arguments);
    }
  }, {
    key: "orHavingNotNull",
    value: function orHavingNotNull() {
      return this.addOperation(new KnexOperation('orHavingNotNull'), arguments);
    }
  }, {
    key: "havingExists",
    value: function havingExists() {
      return this.addOperation(new KnexOperation('havingExists'), arguments);
    }
  }, {
    key: "orHavingExists",
    value: function orHavingExists() {
      return this.addOperation(new KnexOperation('orHavingExists'), arguments);
    }
  }, {
    key: "havingNotExists",
    value: function havingNotExists() {
      return this.addOperation(new KnexOperation('havingNotExists'), arguments);
    }
  }, {
    key: "orHavingNotExists",
    value: function orHavingNotExists() {
      return this.addOperation(new KnexOperation('orHavingNotExists'), arguments);
    }
  }, {
    key: "havingBetween",
    value: function havingBetween() {
      return this.addOperation(new KnexOperation('havingBetween'), arguments);
    }
  }, {
    key: "orHavingBetween",
    value: function orHavingBetween() {
      return this.addOperation(new KnexOperation('havingBetween'), arguments);
    }
  }, {
    key: "havingNotBetween",
    value: function havingNotBetween() {
      return this.addOperation(new KnexOperation('havingNotBetween'), arguments);
    }
  }, {
    key: "orHavingNotBetween",
    value: function orHavingNotBetween() {
      return this.addOperation(new KnexOperation('havingNotBetween'), arguments);
    }
  }, {
    key: "havingRaw",
    value: function havingRaw() {
      return this.addOperation(new KnexOperation('havingRaw'), arguments);
    }
  }, {
    key: "orHavingRaw",
    value: function orHavingRaw() {
      return this.addOperation(new KnexOperation('orHavingRaw'), arguments);
    }
  }, {
    key: "offset",
    value: function offset() {
      return this.addOperation(new KnexOperation('offset'), arguments);
    }
  }, {
    key: "limit",
    value: function limit() {
      return this.addOperation(new KnexOperation('limit'), arguments);
    }
  }, {
    key: "count",
    value: function count() {
      return this.addOperation(new SelectOperation('count'), arguments);
    }
  }, {
    key: "countDistinct",
    value: function countDistinct() {
      return this.addOperation(new SelectOperation('countDistinct'), arguments);
    }
  }, {
    key: "min",
    value: function min() {
      return this.addOperation(new SelectOperation('min'), arguments);
    }
  }, {
    key: "max",
    value: function max() {
      return this.addOperation(new SelectOperation('max'), arguments);
    }
  }, {
    key: "sum",
    value: function sum() {
      return this.addOperation(new SelectOperation('sum'), arguments);
    }
  }, {
    key: "sumDistinct",
    value: function sumDistinct() {
      return this.addOperation(new SelectOperation('sumDistinct'), arguments);
    }
  }, {
    key: "avg",
    value: function avg() {
      return this.addOperation(new SelectOperation('avg'), arguments);
    }
  }, {
    key: "avgDistinct",
    value: function avgDistinct() {
      return this.addOperation(new SelectOperation('avgDistinct'), arguments);
    }
  }, {
    key: "debug",
    value: function debug() {
      return this.addOperation(new KnexOperation('debug'), arguments);
    }
  }, {
    key: "returning",
    value: function returning() {
      return this.addOperation(new ReturningOperation('returning'), arguments);
    }
  }, {
    key: "truncate",
    value: function truncate() {
      return this.addOperation(new KnexOperation('truncate'), arguments);
    }
  }, {
    key: "connection",
    value: function connection() {
      return this.addOperation(new KnexOperation('connection'), arguments);
    }
  }, {
    key: "options",
    value: function options() {
      return this.addOperation(new KnexOperation('options'), arguments);
    }
  }, {
    key: "columnInfo",
    value: function columnInfo() {
      return this.addOperation(new KnexOperation('columnInfo'), arguments);
    }
  }, {
    key: "off",
    value: function off() {
      return this.addOperation(new KnexOperation('off'), arguments);
    }
  }, {
    key: "timeout",
    value: function timeout() {
      return this.addOperation(new KnexOperation('timeout'), arguments);
    }
  }, {
    key: "with",
    value: function _with() {
      return this.addOperation(new KnexOperation('with'), arguments);
    }
  }, {
    key: "withRaw",
    value: function withRaw() {
      return this.addOperation(new KnexOperation('withRaw'), arguments);
    }
  }, {
    key: "withWrapped",
    value: function withWrapped() {
      return this.addOperation(new KnexOperation('withWrapped'), arguments);
    }
  }, {
    key: "withRecursive",
    value: function withRecursive() {
      return this.addOperation(new KnexOperation('withRecursive'), arguments);
    }
  }, {
    key: "whereComposite",
    value: function whereComposite() {
      return this.addOperation(new WhereCompositeOperation('whereComposite'), arguments);
    }
  }, {
    key: "whereInComposite",
    value: function whereInComposite() {
      var operation = null;

      if (isSqlite(this.knex())) {
        operation = new WhereInCompositeSqliteOperation('whereInComposite');
      } else if (isMsSql(this.knex())) {
        operation = new WhereInCompositeMsSqlOperation('whereInComposite');
      } else {
        operation = new WhereInCompositeOperation('whereInComposite');
      }

      return this.addOperation(operation, arguments);
    }
  }, {
    key: "whereNotInComposite",
    value: function whereNotInComposite() {
      var operation = null;

      if (isSqlite(this.knex())) {
        operation = new WhereInCompositeSqliteOperation('whereNotInComposite', {
          prefix: 'not'
        });
      } else if (isMsSql(this.knex())) {
        operation = new WhereInCompositeMsSqlOperation('whereNotInComposite', {
          prefix: 'not'
        });
      } else {
        operation = new WhereInCompositeOperation('whereNotInComposite', {
          prefix: 'not'
        });
      }

      return this.addOperation(operation, arguments);
    }
  }, {
    key: "whereJsonSupersetOf",
    value: function whereJsonSupersetOf() {
      return this.addOperation(new WhereJsonPostgresOperation('whereJsonSupersetOf', {
        operator: '@>',
        bool: 'and'
      }), arguments);
    }
  }, {
    key: "orWhereJsonSupersetOf",
    value: function orWhereJsonSupersetOf() {
      return this.addOperation(new WhereJsonPostgresOperation('orWhereJsonSupersetOf', {
        operator: '@>',
        bool: 'or'
      }), arguments);
    }
  }, {
    key: "whereJsonNotSupersetOf",
    value: function whereJsonNotSupersetOf() {
      return this.addOperation(new WhereJsonPostgresOperation('whereJsonNotSupersetOf', {
        operator: '@>',
        bool: 'and',
        prefix: 'not'
      }), arguments);
    }
  }, {
    key: "orWhereJsonNotSupersetOf",
    value: function orWhereJsonNotSupersetOf() {
      return this.addOperation(new WhereJsonPostgresOperation('orWhereJsonNotSupersetOf', {
        operator: '@>',
        bool: 'or',
        prefix: 'not'
      }), arguments);
    }
  }, {
    key: "whereJsonSubsetOf",
    value: function whereJsonSubsetOf() {
      return this.addOperation(new WhereJsonPostgresOperation('whereJsonSubsetOf', {
        operator: '<@',
        bool: 'and'
      }), arguments);
    }
  }, {
    key: "orWhereJsonSubsetOf",
    value: function orWhereJsonSubsetOf(fieldExpression, jsonObjectOrFieldExpression) {
      return this.addOperation(new WhereJsonPostgresOperation('orWhereJsonSubsetOf', {
        operator: '<@',
        bool: 'or'
      }), arguments);
    }
  }, {
    key: "whereJsonNotSubsetOf",
    value: function whereJsonNotSubsetOf() {
      return this.addOperation(new WhereJsonPostgresOperation('whereJsonNotSubsetOf', {
        operator: '<@',
        bool: 'and',
        prefix: 'not'
      }), arguments);
    }
  }, {
    key: "orWhereJsonNotSubsetOf",
    value: function orWhereJsonNotSubsetOf(fieldExpression, jsonObjectOrFieldExpression) {
      return this.addOperation(new WhereJsonPostgresOperation('orWhereJsonNotSubsetOf', {
        operator: '<@',
        bool: 'or',
        prefix: 'not'
      }), arguments);
    }
  }, {
    key: "whereJsonNotArray",
    value: function whereJsonNotArray() {
      return this.addOperation(new WhereJsonNotObjectPostgresOperation('whereJsonNotArray', {
        bool: 'and',
        compareValue: []
      }), arguments);
    }
  }, {
    key: "orWhereJsonNotArray",
    value: function orWhereJsonNotArray() {
      return this.addOperation(new WhereJsonNotObjectPostgresOperation('orWhereJsonNotArray', {
        bool: 'or',
        compareValue: []
      }), arguments);
    }
  }, {
    key: "whereJsonNotObject",
    value: function whereJsonNotObject() {
      return this.addOperation(new WhereJsonNotObjectPostgresOperation('whereJsonNotObject', {
        bool: 'and',
        compareValue: {}
      }), arguments);
    }
  }, {
    key: "orWhereJsonNotObject",
    value: function orWhereJsonNotObject() {
      return this.addOperation(new WhereJsonNotObjectPostgresOperation('orWhereJsonNotObject', {
        bool: 'or',
        compareValue: {}
      }), arguments);
    }
  }, {
    key: "whereJsonHasAny",
    value: function whereJsonHasAny() {
      return this.addOperation(new WhereJsonHasPostgresOperation('whereJsonHasAny', {
        bool: 'and',
        operator: '?|'
      }), arguments);
    }
  }, {
    key: "orWhereJsonHasAny",
    value: function orWhereJsonHasAny() {
      return this.addOperation(new WhereJsonHasPostgresOperation('orWhereJsonHasAny', {
        bool: 'or',
        operator: '?|'
      }), arguments);
    }
  }, {
    key: "whereJsonHasAll",
    value: function whereJsonHasAll() {
      return this.addOperation(new WhereJsonHasPostgresOperation('whereJsonHasAll', {
        bool: 'and',
        operator: '?&'
      }), arguments);
    }
  }, {
    key: "orWhereJsonHasAll",
    value: function orWhereJsonHasAll() {
      return this.addOperation(new WhereJsonHasPostgresOperation('orWhereJsonHasAll', {
        bool: 'or',
        operator: '?&'
      }), arguments);
    }
  }, {
    key: "whereJsonIsArray",
    value: function whereJsonIsArray(fieldExpression) {
      return this.whereJsonSupersetOf(fieldExpression, []);
    }
  }, {
    key: "orWhereJsonIsArray",
    value: function orWhereJsonIsArray(fieldExpression) {
      return this.orWhereJsonSupersetOf(fieldExpression, []);
    }
  }, {
    key: "whereJsonIsObject",
    value: function whereJsonIsObject(fieldExpression) {
      return this.whereJsonSupersetOf(fieldExpression, {});
    }
  }, {
    key: "orWhereJsonIsObject",
    value: function orWhereJsonIsObject(fieldExpression) {
      return this.orWhereJsonSupersetOf(fieldExpression, {});
    }
  }]);

  return QueryBuilderBase;
}(QueryBuilderOperationSupport);

Object.defineProperties(QueryBuilderBase.prototype, {
  isObjectionQueryBuilderBase: {
    enumerable: false,
    writable: false,
    value: true
  }
});
module.exports = QueryBuilderBase;