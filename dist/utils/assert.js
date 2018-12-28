'use strict';

function assertHasId(model) {
  if (!model.$hasId()) {
    var modelClass = model.constructor;
    var ids = modelClass.getIdColumnArray().join(', ');
    throw new Error("one of the identifier columns [".concat(ids, "] is null or undefined. Have you specified the correct identifier column for the model '").concat(modelClass.name, "' using the 'idColumn' property?"));
  }
}

module.exports = {
  assertHasId: assertHasId
};