'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _require = require('../../../utils/objectUtils'),
    isString = _require.isString,
    isObject = _require.isObject;

var ALIAS_REGEX = /\s+as\s+/i;

var Selection =
/*#__PURE__*/
function () {
  function Selection(table, column, alias) {
    _classCallCheck(this, Selection);

    this.table = table;
    this.column = column;
    this.alias = alias;
  }

  _createClass(Selection, [{
    key: "name",
    get: function get() {
      return this.alias || this.column;
    }
  }], [{
    key: "create",
    value: function create(selection) {
      if (isObject(selection) && selection.isObjectionReferenceBuilder) {
        return createSelectionFromReference(selection);
      } else if (isString(selection)) {
        return createSelectionFromString(selection);
      } else {
        return null;
      }
    }
    /**
     * Returns true if `selectionInBuilder` causes `selectionToTest` to be selected.
     *
     * Examples that return true:
     *
     * doesSelect(Person.query(), '*', 'name')
     * doesSelect(Person.query(), 'Person.*', 'name')
     * doesSelect(Person.query(), 'name', 'name')
     * doesSelect(Person.query(), 'name', 'Person.name')
     */

  }, {
    key: "doesSelect",
    value: function doesSelect(builder, selectionInBuilder, selectionToTest) {
      selectionInBuilder = ensureSelectionInstance(selectionInBuilder);
      selectionToTest = ensureSelectionInstance(selectionToTest);

      if (selectionInBuilder.column === '*') {
        if (selectionInBuilder.table) {
          if (selectionToTest.column === '*') {
            return selectionToTest.table === selectionInBuilder.table;
          } else {
            return selectionToTest.table === null || selectionToTest.table === selectionInBuilder.table;
          }
        } else {
          return true;
        }
      } else {
        var selectionInBuilderTable = selectionInBuilder.table || builder.tableRef();

        if (selectionToTest.column === '*') {
          return false;
        } else {
          return selectionToTest.column === selectionInBuilder.column && (selectionToTest.table === null || selectionToTest.table === selectionInBuilderTable);
        }
      }
    }
  }]);

  return Selection;
}();

Object.defineProperties(Selection.prototype, {
  isObjectionSelection: {
    enumerable: false,
    writable: false,
    value: true
  }
});

function createSelectionFromReference(ref) {
  return new Selection(ref.tableName, ref.column, ref.alias);
}

function createSelectionFromString(selection) {
  var table = null;
  var column = null;
  var alias = null;

  if (ALIAS_REGEX.test(selection)) {
    var parts = selection.split(ALIAS_REGEX);
    selection = parts[0].trim();
    alias = parts[1].trim();
  }

  var dotIdx = selection.lastIndexOf('.');

  if (dotIdx !== -1) {
    table = selection.substr(0, dotIdx);
    column = selection.substr(dotIdx + 1);
  } else {
    column = selection;
  }

  return new Selection(table, column, alias);
}

function ensureSelectionInstance(selection) {
  if (isObject(selection) && selection.isObjectionSelection) {
    return selection;
  } else {
    return Selection.create(selection);
  }
}

module.exports = {
  Selection: Selection
};