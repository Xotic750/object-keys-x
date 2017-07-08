/**
 * @file
 * <a href="https://travis-ci.org/Xotic750/object-keys-x"
 * title="Travis status">
 * <img
 * src="https://travis-ci.org/Xotic750/object-keys-x.svg?branch=master"
 * alt="Travis status" height="18">
 * </a>
 * <a href="https://david-dm.org/Xotic750/object-keys-x"
 * title="Dependency status">
 * <img src="https://david-dm.org/Xotic750/object-keys-x.svg"
 * alt="Dependency status" height="18"/>
 * </a>
 * <a
 * href="https://david-dm.org/Xotic750/object-keys-x#info=devDependencies"
 * title="devDependency status">
 * <img src="https://david-dm.org/Xotic750/object-keys-x/dev-status.svg"
 * alt="devDependency status" height="18"/>
 * </a>
 * <a href="https://badge.fury.io/js/object-keys-x" title="npm version">
 * <img src="https://badge.fury.io/js/object-keys-x.svg"
 * alt="npm version" height="18">
 * </a>
 *
 * An Object.keys shim.
 *
 * Requires ES3 or above.
 *
 * @version 1.0.0
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module object-keys-x
 */

'use strict';

var originalKeys = Object.keys;
var objectKeys;
var keysWorksWithArguments;
var keysHasArgumentsLengthBug;
var worksWithPrimitives;
var toObject;

if (originalKeys) {
  try {
    keysWorksWithArguments = (function () {
      // Safari 5.0 bug
      return originalKeys(arguments).length === 2;
    }(1, 2));

    keysHasArgumentsLengthBug = (function () {
      var argKeys = originalKeys(arguments);
      return arguments.length !== 1 || argKeys.length !== 1 || argKeys[0] !== 1;
    }(1));

    worksWithPrimitives = (function () {
      return originalKeys(1).length === 0;
    }(1));

    if (keysWorksWithArguments === false || keysHasArgumentsLengthBug || worksWithPrimitives === false) {
      var slice = require('array-slice-x');
      var isArguments = require('is-arguments');
      toObject = require('to-object-x');
      objectKeys = function keys(object) {
        return originalKeys(isArguments(object) ? slice(object) : toObject(object));
      };
    }
  } catch (e) {}
}

objectKeys = objectKeys || originalKeys;
if (!objectKeys) {
  var shim = require('object-keys');
  toObject = require('to-object-x');
  objectKeys = function keys(object) {
    return shim(toObject(object));
  };
}

/**
 * This method returns an array of a given object's own enumerable properties,
 * in the same order as that provided by a for...in loop (the difference being
 * that a for-in loop enumerates properties in the prototype chain as well).
 *
 * @param {*} obj The object of which the enumerable own properties are to be returned.
 * @return {Array} An array of strings that represent all the enumerable properties of the given object.
 * @example
 * var placeHolder = require('object-keys-x');
 */
module.exports = objectKeys;
