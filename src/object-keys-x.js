/**
 * @file An ES6 Object.keys shim.
 * @version 2.5.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module object-keys-x
 */

const toObject = require('to-object-x');

const nativeKeys = typeof Object.keys === 'function' && Object.keys;

let isWorking;
let throwsWithNull;
let worksWithPrim;
let worksWithRegex;
let worksWithArgs;
let worksWithStr;

if (nativeKeys) {
  const attempt = require('attempt-x');
  const isArray = require('is-array-x');
  const isCorrectRes = function _isCorrectRes(r, length) {
    return r.threw === false && isArray(r.value) && r.value.length === length;
  };

  const either = function _either(r, a, b) {
    const x = r.value[0];
    const y = r.value[1];

    return (x === a && y === b) || (x === b && y === a);
  };

  let testObj = {a: 1, b: 2};
  let res = attempt(nativeKeys, testObj);
  isWorking = isCorrectRes(res, 2) && either(res, 'a', 'b');

  if (isWorking) {
    testObj = Object('a');
    testObj.y = 1;
    res = attempt(nativeKeys, testObj);
    isWorking = isCorrectRes(res, 2) && either(res, '0', 'y');
  }

  if (isWorking) {
    throwsWithNull = attempt(nativeKeys, null).threw;
    worksWithPrim = isCorrectRes(attempt(nativeKeys, 42), 0);
    worksWithRegex = attempt(nativeKeys, /a/g).threw === false;

    res = attempt(
      nativeKeys,
      (function() {
        return arguments;
      })(1, 2),
    );

    worksWithArgs = isCorrectRes(res, 2) && either(res, '0', '1');

    res = attempt(nativeKeys, Object('ab'));
    worksWithStr = isCorrectRes(res, 2) && either(res, '0', '1');
  }
}

let objectKeys;

if (isWorking) {
  if (throwsWithNull && worksWithPrim && worksWithRegex && worksWithArgs && worksWithStr) {
    objectKeys = nativeKeys;
  } else {
    const isArguments = worksWithArgs !== true && require('is-arguments');
    const arraySlice = isArguments && require('array-like-slice-x');
    const splitIfBoxed = worksWithStr !== true && require('split-if-boxed-bug-x');
    const isString = splitIfBoxed && require('is-string');
    const isRegexp = worksWithRegex !== true && require('is-regexp-x');
    const has = isRegexp && require('has-own-property-x');

    objectKeys = function keys(object) {
      let obj = toObject ? toObject(object) : object;

      if (isArguments && isArguments(obj)) {
        obj = arraySlice(obj);
      } else if (isString && isString(obj)) {
        obj = splitIfBoxed(obj);
      } else if (isRegexp && isRegexp(obj)) {
        const regexKeys = [];
        // eslint-disable-next-line no-restricted-syntax
        for (const k in obj) {
          if (has(obj, k)) {
            regexKeys[regexKeys.length] = k;
          }
        }

        return regexKeys;
      }

      return nativeKeys(obj);
    };
  }
} else {
  const objKeys = require('object-keys');
  objectKeys = function keys(object) {
    return objKeys(toObject(object));
  };
}

/**
 * This method returns an array of a given object's own enumerable properties,
 * in the same order as that provided by a for...in loop (the difference being
 * that a for-in loop enumerates properties in the prototype chain as well).
 *
 * @param {*} obj - The object of which the enumerable own properties are to be returned.
 * @returns {Array} An array of strings that represent all the enumerable properties of the given object.
 * @example
 * var objectKeys = require('object-keys-x');
 *
 * var obj = {
 *   arr: [],
 *   bool: true,
 *   'null': null,
 *   num: 42,
 *   obj: { },
 *   str: 'boz',
 *   undefined: void 0
 * };
 *
 * objectKeys(obj); // ['arr', 'bool', 'null', 'num', 'obj', 'str', 'undefined']
 */
module.exports = objectKeys;
