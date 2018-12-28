'use strict';

var Bluebird = require('bluebird');

var Model = require('./model/Model');

var promiseUtils = require('./utils/promiseUtils');

var _require = require('./utils/classUtils'),
    isSubclassOf = _require.isSubclassOf;

var _require2 = require('./utils/objectUtils'),
    isFunction = _require2.isFunction;

function transaction() {
  // There must be at least one model class and the callback.
  if (arguments.length < 2) {
    return Bluebird.reject(new Error('objection.transaction: provide at least one Model class to bind to the transaction or a knex instance'));
  }

  var args = new Array(arguments.length);

  for (var i = 0, l = args.length; i < l; ++i) {
    args[i] = arguments[i];
  }

  if (!isSubclassOf(args[0], Model) && isFunction(args[0].transaction)) {
    var knex = args[0];
    args = args.slice(1); // If the function is a generator, wrap it using Bluebird.coroutine.

    if (isGenerator(args[0])) {
      args[0] = Bluebird.coroutine(args[0]);
    }

    return knex.transaction.apply(knex, args);
  } else {
    // The last argument should be the callback and all other Model subclasses.
    var callback = args[args.length - 1];
    var modelClasses = args.slice(0, args.length - 1);

    var _i;

    for (_i = 0; _i < modelClasses.length; ++_i) {
      if (!isSubclassOf(modelClasses[_i], Model)) {
        return Bluebird.reject(new Error('objection.transaction: all but the last argument should be Model subclasses'));
      }
    }

    var _knex = modelClasses[0].knex();

    for (_i = 0; _i < modelClasses.length; ++_i) {
      if (modelClasses[_i].knex() !== _knex) {
        return Bluebird.reject(new Error('objection.transaction: all Model subclasses must be bound to the same database'));
      }
    } // If the function is a generator, wrap it using Promise.coroutine.


    if (isGenerator(callback)) {
      callback = Bluebird.coroutine(callback);
    }

    return _knex.transaction(function (trx) {
      var args = new Array(modelClasses.length + 1);

      for (var _i2 = 0; _i2 < modelClasses.length; ++_i2) {
        args[_i2] = modelClasses[_i2].bindTransaction(trx);
      }

      args[args.length - 1] = trx;
      return promiseUtils.try(function () {
        return callback.apply(trx, args);
      });
    });
  }
}

transaction.start = function (modelClassOrKnex) {
  var knex = modelClassOrKnex;

  if (isSubclassOf(modelClassOrKnex, Model)) {
    knex = modelClassOrKnex.knex();
  }

  if (!knex || !isFunction(knex.transaction)) {
    return Bluebird.reject(new Error('objection.transaction.start: first argument must be a model class or a knex instance'));
  }

  return new Bluebird(function (resolve, reject) {
    knex.transaction(function (trx) {
      resolve(trx);
    }).catch(function (err) {
      reject(err);
    });
  });
};

function isGenerator(fn) {
  return fn && fn.constructor && fn.constructor.name === 'GeneratorFunction';
}

module.exports = transaction;