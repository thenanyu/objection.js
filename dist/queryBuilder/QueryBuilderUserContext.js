'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var SYMBOL_BUILDER = Symbol();

var QueryBuilderUserContext =
/*#__PURE__*/
function () {
  function QueryBuilderUserContext(builder) {
    _classCallCheck(this, QueryBuilderUserContext);

    // This should never ever be accessed outside this class. We only
    // store it so that we can access builder.knex() lazily.
    this[SYMBOL_BUILDER] = builder;
  }

  _createClass(QueryBuilderUserContext, [{
    key: "newFromObject",
    value: function newFromObject(builder, obj) {
      var ctx = new this.constructor(builder);
      Object.assign(ctx, obj);
      return ctx;
    }
  }, {
    key: "newMerge",
    value: function newMerge(builder, obj) {
      var ctx = new this.constructor(builder);
      Object.assign(ctx, this, obj);
      return ctx;
    }
  }, {
    key: "transaction",
    get: function get() {
      return this[SYMBOL_BUILDER].knex();
    }
  }]);

  return QueryBuilderUserContext;
}();

module.exports = QueryBuilderUserContext;