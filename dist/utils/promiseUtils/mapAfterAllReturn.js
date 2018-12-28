'use strict';

var isPromise = require('./isPromise'); // Map `arr` with `mapper` and after that return `returnValue`. If none of
// the mapped values is a promise, return synchronously for performance
// reasons.


function mapAfterAllReturn(arr, mapper, returnValue) {
  var results = new Array(arr.length);
  var containsPromise = false;

  for (var i = 0, l = arr.length; i < l; ++i) {
    results[i] = mapper(arr[i]);

    if (isPromise(results[i])) {
      containsPromise = true;
    }
  }

  if (containsPromise) {
    return Promise.all(results).then(function () {
      return returnValue;
    });
  } else {
    return returnValue;
  }
}

module.exports = mapAfterAllReturn;