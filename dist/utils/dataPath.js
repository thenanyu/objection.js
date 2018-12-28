'use strict';

var _require = require('./objectUtils'),
    isNumber = _require.isNumber;

function appendDataPath(dataPath, relationOrIndex) {
  var token = isNumber(relationOrIndex) ? "[".concat(relationOrIndex, "]") : ".".concat(relationOrIndex.name);
  return dataPath ? "".concat(dataPath).concat(token) : token;
}

module.exports = {
  appendDataPath: appendDataPath
};