'use strict';

var OWNER_JOIN_COLUMN_ALIAS_PREFIX = 'objectiontmpjoin';

function getTempColumn(index) {
  return "".concat(OWNER_JOIN_COLUMN_ALIAS_PREFIX).concat(index);
}

function isTempColumn(col) {
  return col.startsWith(OWNER_JOIN_COLUMN_ALIAS_PREFIX);
}

module.exports = {
  getTempColumn: getTempColumn,
  isTempColumn: isTempColumn
};