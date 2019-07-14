let objectKeys;

if (typeof module === 'object' && module.exports) {
  require('es5-shim');
  require('es5-shim/es5-sham');

  if (typeof JSON === 'undefined') {
    JSON = {};
  }

  require('json3').runInContext(null, JSON);
  require('es6-shim');
  const es7 = require('es7-shim');
  Object.keys(es7).forEach(function(key) {
    const obj = es7[key];

    if (typeof obj.shim === 'function') {
      obj.shim();
    }
  });
  objectKeys = require('../../index.js');
} else {
  objectKeys = returnExports;
}

const has = Object.prototype.hasOwnProperty;
const supportsDescriptors =
  Object.defineProperty &&
  (function() {
    try {
      const obj = {};
      Object.defineProperty(obj, 'x', {enumerable: false, value: obj});
      // eslint-disable-next-line no-restricted-syntax
      for (const _ in obj) {
        return false;
      }

      return obj.x === obj;
    } catch (e) {
      /* this is ES3 */
      return false;
    }
  })();

const ifWindowIt = typeof window === 'undefined' ? xit : it;

describe('objectKeys', function() {
  const obj = {
    arr: [],
    bool: true,
    null: null,
    num: 42,
    obj: {},
    str: 'boz',
    undefined: void 0,
  };

  const loopedValues = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const key in obj) {
    loopedValues.push(key);
  }

  const keys = objectKeys(obj);
  it('should throw for null or undefined', function() {
    expect(function() {
      objectKeys();
    }).toThrow();

    expect(function() {
      objectKeys(void 0);
    }).toThrow();

    expect(function() {
      objectKeys(null);
    }).toThrow();
  });

  it('should not throw for non-objects', function() {
    expect(objectKeys(1)).toStrictEqual([]);
    expect(objectKeys(true)).toStrictEqual([]);
    expect(objectKeys('')).toStrictEqual([]);
  });

  it('should have correct length', function() {
    expect(keys).toHaveLength(7);
  });

  describe('arguments objects', function() {
    it('works with an arguments object', function() {
      (function() {
        expect(arguments).toHaveLength(3);
        expect(objectKeys(arguments)).toHaveLength(arguments.length);
        expect(objectKeys(arguments)).toStrictEqual(['0', '1', '2']);
      })(1, 2, 3);
    });

    it('works with a legacy arguments object', function() {
      const FakeArguments = function(args) {
        args.forEach(
          function(arg, i) {
            this[i] = arg;
          }.bind(this),
        );
      };

      FakeArguments.prototype.length = 3;
      FakeArguments.prototype.callee = function() {};

      const fakeOldArguments = new FakeArguments(['a', 'b', 'c']);
      expect(objectKeys(fakeOldArguments)).toStrictEqual(['0', '1', '2']);
    });
  });

  it('should return an Array', function() {
    expect(Array.isArray(keys)).toBe(true);
  });

  it('should return names which are own properties', function() {
    keys.forEach(function(name) {
      expect(has.call(obj, name)).toBe(true);
    });
  });

  it('should return names which are enumerable', function() {
    keys.forEach(function(name) {
      expect(loopedValues.indexOf(name)).toNotBe(-1);
    });
  });

  describe('enumerating over non-enumerable properties', function() {
    it('has no enumerable keys on a Function', function() {
      const Foo = function() {};

      expect(objectKeys(Foo.prototype)).toStrictEqual([]);
    });

    it('has no enumerable keys on a boolean', function() {
      expect(objectKeys(Boolean.prototype)).toStrictEqual([]);
    });

    it('has no enumerable keys on an object', function() {
      expect(objectKeys(Object.prototype)).toStrictEqual([]);
    });
  });

  it('works with boxed primitives', function() {
    expect(objectKeys(Object('hello'))).toStrictEqual(['0', '1', '2', '3', '4']);
  });

  it('works with boxed primitives with extra properties', function() {
    const x = Object('x');
    x.y = 1;
    const actual = objectKeys(x);
    const expected = ['0', 'y'];
    actual.sort();
    expected.sort();
    expect(actual).toStrictEqual(expected);
  });

  it('works with regexs', function() {
    const x = /a/g;
    const actual = objectKeys(x).sort();
    expect(actual).toStrictEqual([]);
  });

  ifWindowIt('can serialize all objects on the `window`', function() {
    let windowItemKeys;
    let exception;
    const excludedKeys = [
      'window',
      'console',
      'parent',
      'self',
      'frame',
      'frames',
      'frameElement',
      'external',
      'height',
      'width',
    ];

    if (supportsDescriptors) {
      Object.defineProperty(window, 'thrower', {
        configurable: true,
        get() {
          throw new RangeError('thrower!');
        },
      });
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const k in window) {
      exception = void 0;
      windowItemKeys = exception;

      if (excludedKeys.indexOf(k) === -1 && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
        try {
          windowItemKeys = objectKeys(window[k]);
        } catch (e) {
          exception = e;
        }

        expect(Array.isArray(windowItemKeys)).toBe(true);
        expect(exception).toBeUndefined();
      }
    }

    if (supportsDescriptors) {
      delete window.thrower;
    }
  });
});
