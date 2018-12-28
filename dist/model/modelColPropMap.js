'use strict';

var _require = require('../utils/objectUtils'),
    difference = _require.difference;

function columnNameToPropertyName(modelClass, columnName) {
  var model = new modelClass();
  var addedProps = Object.keys(model.$parseDatabaseJson({}));
  var row = {};
  row[columnName] = null;
  var props = Object.keys(model.$parseDatabaseJson(row));
  var propertyName = difference(props, addedProps)[0];
  return propertyName || null;
}

function propertyNameToColumnName(modelClass, propertyName) {
  var model = new modelClass();
  var addedCols = Object.keys(model.$formatDatabaseJson({}));
  var obj = {};
  obj[propertyName] = null;
  var cols = Object.keys(model.$formatDatabaseJson(obj));
  var columnName = difference(cols, addedCols)[0];
  return columnName || null;
}

function idColumnToIdProperty(modelClass, idColumn) {
  var idProperty = modelClass.columnNameToPropertyName(idColumn);

  if (!idProperty) {
    throw new Error(modelClass.name + '.$parseDatabaseJson probably changes the value of the id column `' + idColumn + '` which is a no-no.');
  }

  return idProperty;
}

module.exports = {
  columnNameToPropertyName: columnNameToPropertyName,
  propertyNameToColumnName: propertyNameToColumnName,
  idColumnToIdProperty: idColumnToIdProperty
};