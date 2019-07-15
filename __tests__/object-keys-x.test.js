import objectKeys from '../src/object-keys-x';

const has = Object.prototype.hasOwnProperty;
const supportsDescriptors =
  Object.defineProperty &&
  (function() {
    try {
      const obj = {};
      Object.defineProperty(obj, 'x', {enumerable: false, value: obj});
      /* eslint-disable-next-line no-restricted-syntax,guard-for-in */
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
    /* eslint-disable-next-line no-void */
    undefined: void 0,
  };

  const loopedValues = [];
  /* eslint-disable-next-line no-restricted-syntax,guard-for-in */
  for (const key in obj) {
    loopedValues.push(key);
  }

  const keys = objectKeys(obj);
  it('should throw for null or undefined', function() {
    expect.assertions(3);
    expect(function() {
      objectKeys();
    }).toThrowErrorMatchingSnapshot();

    expect(function() {
      /* eslint-disable-next-line no-void */
      objectKeys(void 0);
    }).toThrowErrorMatchingSnapshot();

    expect(function() {
      objectKeys(null);
    }).toThrowErrorMatchingSnapshot();
  });

  it('should not throw for non-objects', function() {
    expect.assertions(3);
    expect(objectKeys(1)).toStrictEqual([]);
    expect(objectKeys(true)).toStrictEqual([]);
    expect(objectKeys('')).toStrictEqual([]);
  });

  it('should have correct length', function() {
    expect.assertions(1);
    expect(keys).toHaveLength(7);
  });

  describe('arguments objects', function() {
    it('works with an arguments object', function() {
      expect.assertions(3);
      (function() {
        /* eslint-disable-next-line prefer-rest-params */
        expect(arguments).toHaveLength(3);
        /* eslint-disable-next-line prefer-rest-params */
        expect(objectKeys(arguments)).toHaveLength(arguments.length);
        /* eslint-disable-next-line prefer-rest-params */
        expect(objectKeys(arguments)).toStrictEqual(['0', '1', '2']);
      })(1, 2, 3);
    });

    it('works with a legacy arguments object', function() {
      expect.assertions(1);
      const FakeArguments = function(args) {
        args.forEach(
          function(arg, i) {
            this[i] = arg;
          }.bind(this),
        );
      };

      FakeArguments.prototype.length = 3;
      /* eslint-disable-next-line lodash/prefer-noop */
      FakeArguments.prototype.callee = function() {};

      const fakeOldArguments = new FakeArguments(['a', 'b', 'c']);
      expect(objectKeys(fakeOldArguments)).toStrictEqual(['0', '1', '2']);
    });
  });

  it('should return an Array', function() {
    expect.assertions(1);
    expect(Array.isArray(keys)).toBe(true);
  });

  it('should return names which are own properties', function() {
    expect.assertions(7);
    keys.forEach(function(name) {
      expect(has.call(obj, name)).toBe(true);
    });
  });

  it('should return names which are enumerable', function() {
    expect.assertions(7);
    keys.forEach(function(name) {
      expect(loopedValues.indexOf(name)).not.toBe(-1);
    });
  });

  describe('enumerating over non-enumerable properties', function() {
    it('has no enumerable keys on a Function', function() {
      expect.assertions(1);
      /* eslint-disable-next-line lodash/prefer-noop */
      const Foo = function() {};

      expect(objectKeys(Foo.prototype)).toStrictEqual([]);
    });

    it('has no enumerable keys on a boolean', function() {
      expect.assertions(1);
      expect(objectKeys(Boolean.prototype)).toStrictEqual([]);
    });

    it('has no enumerable keys on an object', function() {
      expect.assertions(1);
      expect(objectKeys(Object.prototype)).toStrictEqual([]);
    });
  });

  it('works with boxed primitives', function() {
    expect.assertions(1);
    expect(objectKeys(Object('hello'))).toStrictEqual(['0', '1', '2', '3', '4']);
  });

  it('works with boxed primitives with extra properties', function() {
    expect.assertions(1);
    const x = Object('x');
    x.y = 1;
    const actual = objectKeys(x);
    const expected = ['0', 'y'];
    actual.sort();
    expected.sort();
    expect(actual).toStrictEqual(expected);
  });

  it('works with regexs', function() {
    expect.assertions(1);
    const x = /a/g;
    const actual = objectKeys(x).sort();
    expect(actual).toStrictEqual([]);
  });

  ifWindowIt('can serialize all objects on the `window`', function() {
    expect.assertions(62);
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

    /* eslint-disable-next-line guard-for-in,no-restricted-syntax */
    for (const k in window) {
      /* eslint-disable-next-line no-void */
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
