'use strict';

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var QueryBuilderOperation = require('./QueryBuilderOperation');

var _require = require('../graph/GraphUpsert'),
    GraphUpsert = _require.GraphUpsert;

var UpsertGraphOperation =
/*#__PURE__*/
function (_QueryBuilderOperatio) {
  _inherits(UpsertGraphOperation, _QueryBuilderOperatio);

  function UpsertGraphOperation(name, opt) {
    var _this;

    _classCallCheck(this, UpsertGraphOperation);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(UpsertGraphOperation).call(this, name, Object.assign({}, opt, {
      upsertOptions: {}
    })));
    _this.upsertOptions = opt.upsertOptions || {};
    _this.upsert = null;
    return _this;
  }

  _createClass(UpsertGraphOperation, [{
    key: "onAdd",
    value: function onAdd(builder, args) {
      var _args = _slicedToArray(args, 1),
          objects = _args[0];

      this.upsert = new GraphUpsert({
        objects: objects,
        rootModelClass: builder.modelClass(),
        upsertOptions: this.upsertOptions
      }); // Never execute this builder.

      builder.resolve([]);
      return true;
    }
  }, {
    key: "onAfter1",
    value: function onAfter1(builder) {
      return this.upsert.run(builder);
    }
  }, {
    key: "models",
    get: function get() {
      return this.upsert.objects;
    }
  }, {
    key: "isArray",
    get: function get() {
      return this.upsert.isArray;
    }
  }]);

  return UpsertGraphOperation;
}(QueryBuilderOperation);

module.exports = UpsertGraphOperation;