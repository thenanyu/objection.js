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

var QueryBuilderOperation = require('./QueryBuilderOperation');

var RelationJoinBuilder = require('./eager/RelationJoinBuilder');

var _require = require('../RelationExpression'),
    RelationExpression = _require.RelationExpression;

var _require2 = require('../../utils/objectUtils'),
    isString = _require2.isString;

var JoinRelationOperation =
/*#__PURE__*/
function (_QueryBuilderOperatio) {
  _inherits(JoinRelationOperation, _QueryBuilderOperatio);

  function JoinRelationOperation(name, opt) {
    var _this;

    _classCallCheck(this, JoinRelationOperation);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(JoinRelationOperation).call(this, name, opt));
    _this.expression = null;
    _this.callOpt = null;
    return _this;
  }

  _createClass(JoinRelationOperation, [{
    key: "onAdd",
    value: function onAdd(builder, args) {
      this.expression = RelationExpression.create(args[0]);
      this.callOpt = args[1] || {};
      return true;
    }
  }, {
    key: "onBuild",
    value: function onBuild(builder) {
      var _this2 = this;

      var modelClass = builder.modelClass();
      var opt = Object.assign({}, this.callOpt);
      opt.aliases = Object.assign({}, opt.aliases);
      opt.joinOperation = this.opt.joinOperation; // Special case for one single relation.

      if (this.expression.numChildren === 1) {
        var relationNames = this.expression.childNames.map(function (it) {
          return _this2.expression[it].$relation;
        });
        var relationName = relationNames[0];
        var relation = modelClass.getRelation(relationName);
        var alias = null;

        if (opt.alias === false) {
          alias = builder.tableRefFor(relation.relatedModelClass.getTableName());
        } else if (opt.alias === true || !opt.alias) {
          alias = relation.name;
        } else if (isString(opt.alias)) {
          alias = opt.alias;
        }

        if (alias) {
          opt.aliases[relationName] = alias;
        }
      }

      var joinBuilder = new RelationJoinBuilder({
        modelClass: modelClass,
        expression: this.expression
      });
      joinBuilder.setOptions(opt);
      joinBuilder.buildJoinOnly(builder);
    }
  }]);

  return JoinRelationOperation;
}(QueryBuilderOperation);

module.exports = JoinRelationOperation;