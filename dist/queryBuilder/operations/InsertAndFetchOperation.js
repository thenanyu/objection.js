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

var InsertOperation = require('./InsertOperation');

var DelegateOperation = require('./DelegateOperation');

var _require = require('../../model/modelUtils'),
    keyByProps = _require.keyByProps;

var _require2 = require('../../utils/objectUtils'),
    asArray = _require2.asArray;

var _require3 = require('../../utils/promiseUtils'),
    after = _require3.after;

var InsertAndFetchOperation =
/*#__PURE__*/
function (_DelegateOperation) {
  _inherits(InsertAndFetchOperation, _DelegateOperation);

  function InsertAndFetchOperation(name, opt) {
    var _this;

    _classCallCheck(this, InsertAndFetchOperation);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(InsertAndFetchOperation).call(this, name, opt));

    if (!_this.delegate.is(InsertOperation)) {
      throw new Error('Invalid delegate');
    }

    return _this;
  }

  _createClass(InsertAndFetchOperation, [{
    key: "onAfter2",
    value: function onAfter2(builder, inserted) {
      var modelClass = builder.modelClass();

      var maybePromise = _get(_getPrototypeOf(InsertAndFetchOperation.prototype), "onAfter2", this).call(this, builder, inserted);

      return after(maybePromise, function (insertedModels) {
        var insertedModelArray = asArray(insertedModels);
        var idProps = modelClass.getIdPropertyArray();
        var idCols = builder.fullIdColumnFor(modelClass);
        var ids = insertedModelArray.map(function (model) {
          return model.$id();
        });
        return modelClass.query().childQueryOf(builder).whereInComposite(idCols, ids).castTo(builder.resultModelClass()).then(function (fetchedModels) {
          var modelsById = keyByProps(fetchedModels, idProps); // Instead of returning the freshly fetched models, update the input
          // models with the fresh values.

          insertedModelArray.forEach(function (insertedModel) {
            insertedModel.$set(modelsById.get(insertedModel.$propKey(idProps)));
          });
          return insertedModels;
        });
      });
    }
  }]);

  return InsertAndFetchOperation;
}(DelegateOperation);

module.exports = InsertAndFetchOperation;