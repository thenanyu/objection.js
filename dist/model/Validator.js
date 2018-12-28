'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Validator =
/*#__PURE__*/
function () {
  function Validator() {
    _classCallCheck(this, Validator);
  }

  _createClass(Validator, [{
    key: "beforeValidate",
    value: function beforeValidate(_ref) {
      var model = _ref.model,
          json = _ref.json,
          options = _ref.options;
      model.$beforeValidate(null, json, options);
    }
  }, {
    key: "validate",
    value: function validate(args) {
      /* istanbul ignore next */
      throw new Error('not implemented');
    }
  }, {
    key: "afterValidate",
    value: function afterValidate(_ref2) {
      var model = _ref2.model,
          json = _ref2.json,
          options = _ref2.options;
      model.$afterValidate(json, options);
    }
  }]);

  return Validator;
}();

module.exports = Validator;