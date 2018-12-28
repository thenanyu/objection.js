'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var InternalOptions =
/*#__PURE__*/
function () {
  function InternalOptions() {
    _classCallCheck(this, InternalOptions);

    this.skipUndefined = false;
    this.keepImplicitJoinProps = false;
    this.isInternalQuery = false;
    this.debug = false;
  }

  _createClass(InternalOptions, [{
    key: "clone",
    value: function clone() {
      var copy = new this.constructor();
      copy.skipUndefined = this.skipUndefined;
      copy.keepImplicitJoinProps = this.keepImplicitJoinProps;
      copy.isInternalQuery = this.isInternalQuery;
      copy.debug = this.debug;
      return copy;
    }
  }]);

  return InternalOptions;
}();

module.exports = InternalOptions;