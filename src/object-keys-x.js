import toObject from 'to-object-x';
import attempt from 'attempt-x';
import isArray from 'is-array-x';
import isArguments from 'is-arguments';
import arraySlice from 'array-like-slice-x';
import splitIfBoxed from 'split-if-boxed-bug-x';
import isString from 'is-string';
import isRegexp from 'is-regexp-x';
import has from 'has-own-property-x';
import objKeys from 'object-keys';

const ObjectCtr = {}.constructor;
const nativeKeys = typeof ObjectCtr.keys === 'function' && ObjectCtr.keys;

let isWorking;
let throwsWithNull;
let worksWithPrim;
let worksWithRegex;
let worksWithArgs;
let worksWithStr;

if (nativeKeys) {
  const isCorrectRes = function isCorrectRes(r, length) {
    return r.threw === false && isArray(r.value) && r.value.length === length;
  };

  const either = function either(r, a, b) {
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
      (function getArgs() {
        /* eslint-disable-next-line prefer-rest-params */
        return arguments;
      })(1, 2),
    );

    worksWithArgs = isCorrectRes(res, 2) && either(res, '0', '1');

    res = attempt(nativeKeys, Object('ab'));
    worksWithStr = isCorrectRes(res, 2) && either(res, '0', '1');
  }
}

export const patched = function keys(object) {
  let obj = toObject ? toObject(object) : object;

  if (worksWithArgs !== true && isArguments(obj)) {
    obj = arraySlice(obj);
  } else if (worksWithStr !== true && isString(obj)) {
    obj = splitIfBoxed(obj);
  } else if (worksWithRegex !== true && isRegexp(obj)) {
    const regexKeys = [];
    /* eslint-disable-next-line no-restricted-syntax */
    for (const key in obj) {
      // noinspection JSUnfilteredForInLoop
      if (has(obj, key)) {
        regexKeys[regexKeys.length] = key;
      }
    }

    return regexKeys;
  }

  return nativeKeys(obj);
};

export const implementation = function keys(object) {
  return objKeys(toObject(object));
};

let objectKeys;

if (isWorking) {
  if (throwsWithNull && worksWithPrim && worksWithRegex && worksWithArgs && worksWithStr) {
    objectKeys = nativeKeys;
  } else {
    objectKeys = patched;
  }
}

/**
 * This method returns an array of a given object's own enumerable properties,
 * in the same order as that provided by a for...in loop (the difference being
 * that a for-in loop enumerates properties in the prototype chain as well).
 *
 * @param {*} obj - The object of which the enumerable own properties are to be returned.
 * @returns {Array} An array of strings that represent all the enumerable properties of the given object.
 */
const $objectKeys = isWorking ? objectKeys : implementation;

export default $objectKeys;
