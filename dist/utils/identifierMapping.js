'use strict';

var _require = require('./objectUtils'),
    isObject = _require.isObject; // Super fast memoize for single argument functions.


function memoize(func) {
  var cache = new Map();
  return function (input) {
    var output = cache.get(input);

    if (output === undefined) {
      output = func(input);
      cache.set(input, output);
    }

    return output;
  };
} // camelCase to snake_case converter that also works with non-ascii characters
// This is needed especially so that aliases containing the `:` character,
// objection uses internally, work.


function snakeCase(str) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$upperCase = _ref.upperCase,
      upperCase = _ref$upperCase === void 0 ? false : _ref$upperCase,
      _ref$underscoreBefore = _ref.underscoreBeforeDigits,
      underscoreBeforeDigits = _ref$underscoreBefore === void 0 ? false : _ref$underscoreBefore;

  if (str.length === 0) {
    return str;
  }

  var upper = str.toUpperCase();
  var lower = str.toLowerCase();
  var out = lower[0];

  for (var i = 1, l = str.length; i < l; ++i) {
    var char = str[i];
    var prevChar = str[i - 1];
    var upperChar = upper[i];
    var prevUpperChar = upper[i - 1];
    var lowerChar = lower[i];
    var prevLowerChar = lower[i - 1]; // If underScoreBeforeDigits is true then, well, insert an underscore
    // before digits :). Only the first digit gets an underscore if
    // there are multiple.

    if (underscoreBeforeDigits && isDigit(char) && !isDigit(prevChar)) {
      out += '_' + char;
      continue;
    } // Test if `char` is an upper-case character and that the character
    // actually has different upper and lower case versions.


    if (char === upperChar && upperChar !== lowerChar) {
      // Multiple consecutive upper case characters shouldn't add underscores.
      // For example "fooBAR" should be converted to "foo_bar".
      if (prevChar === prevUpperChar && prevUpperChar !== prevLowerChar) {
        out += lowerChar;
      } else {
        out += '_' + lowerChar;
      }
    } else {
      out += char;
    }
  }

  if (upperCase) {
    return out.toUpperCase();
  } else {
    return out;
  }
} // snake_case to camelCase converter that simply reverses
// the actions done by `snakeCase` function.


function camelCase(str) {
  var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref2$upperCase = _ref2.upperCase,
      upperCase = _ref2$upperCase === void 0 ? false : _ref2$upperCase;

  if (str.length === 0) {
    return str;
  }

  if (upperCase && isAllUpperCaseSnakeCase(str)) {
    // Only convert to lower case if the string is all upper
    // case snake_case. This allowes camelCase strings to go
    // through without changing.
    str = str.toLowerCase();
  }

  var out = str[0];

  for (var i = 1, l = str.length; i < l; ++i) {
    var char = str[i];
    var prevChar = str[i - 1];

    if (char !== '_') {
      if (prevChar === '_') {
        out += char.toUpperCase();
      } else {
        out += char;
      }
    }
  }

  return out;
}

function isAllUpperCaseSnakeCase(str) {
  for (var i = 1, l = str.length; i < l; ++i) {
    var char = str[i];

    if (char !== '_' && char !== char.toUpperCase()) {
      return false;
    }
  }

  return true;
}

function isDigit(char) {
  return char >= '0' && char <= '9';
} // Returns a function that splits the inputs string into pieces using `separator`,
// only calls `mapper` for the last part and concatenates the string back together.
// If no separators are found, `mapper` is called for the entire string.


function mapLastPart(mapper, separator) {
  return function (str) {
    var idx = str.lastIndexOf(separator);
    var mapped = mapper(str.slice(idx + separator.length));
    return str.slice(0, idx + separator.length) + mapped;
  };
} // Returns a function that takes an object as an input and maps the object's keys
// using `mapper`. If the input is not an object, the input is returned unchanged.


function keyMapper(mapper) {
  return function (obj) {
    if (!isObject(obj) || Array.isArray(obj)) {
      return obj;
    }

    var keys = Object.keys(obj);
    var out = {};

    for (var i = 0, l = keys.length; i < l; ++i) {
      var key = keys[i];
      out[mapper(key)] = obj[key];
    }

    return out;
  };
}

function snakeCaseMappers() {
  var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return {
    parse: keyMapper(memoize(function (str) {
      return camelCase(str, opt);
    })),
    format: keyMapper(memoize(function (str) {
      return snakeCase(str, opt);
    }))
  };
}

function knexIdentifierMappers() {
  var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      parse = _ref3.parse,
      format = _ref3.format,
      _ref3$idSeparator = _ref3.idSeparator,
      idSeparator = _ref3$idSeparator === void 0 ? ':' : _ref3$idSeparator;

  var formatId = memoize(mapLastPart(format, idSeparator));
  var parseId = memoize(mapLastPart(parse, idSeparator));
  var parseKeys = keyMapper(parseId);
  return {
    wrapIdentifier: function wrapIdentifier(identifier, origWrap) {
      return origWrap(formatId(identifier));
    },
    postProcessResponse: function postProcessResponse(result) {
      if (Array.isArray(result)) {
        var output = new Array(result.length);

        for (var i = 0, l = result.length; i < l; ++i) {
          output[i] = parseKeys(result[i]);
        }

        return output;
      } else {
        return parseKeys(result);
      }
    }
  };
}

function knexSnakeCaseMappers() {
  var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return knexIdentifierMappers({
    parse: function parse(str) {
      return camelCase(str, opt);
    },
    format: function format(str) {
      return snakeCase(str, opt);
    }
  });
}

function knexIdentifierMapping(colToProp) {
  var propToCol = Object.keys(colToProp).reduce(function (propToCol, column) {
    propToCol[colToProp[column]] = column;
    return propToCol;
  }, {});
  return knexIdentifierMappers({
    parse: function parse(column) {
      return colToProp[column] || column;
    },
    format: function format(prop) {
      return propToCol[prop] || prop;
    }
  });
}

module.exports = {
  snakeCase: snakeCase,
  camelCase: camelCase,
  snakeCaseMappers: snakeCaseMappers,
  knexSnakeCaseMappers: knexSnakeCaseMappers,
  knexIdentifierMappers: knexIdentifierMappers,
  knexIdentifierMapping: knexIdentifierMapping,
  camelCaseKeys: keyMapper(memoize(camelCase)),
  snakeCaseKeys: keyMapper(memoize(snakeCase))
};