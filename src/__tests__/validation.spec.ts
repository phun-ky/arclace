import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { Arclace, createConnections } from '../Arclace';
import { DEFAULT_CONNECTION_OPTIONS } from '../Connection';
import { ArclaceError } from '../errors';
import type { ArcOptionsType } from '../types';
import { bezierPath, orthogonalPath, straightPath } from '../utils/paths';

import { box } from './helpers';

const setup = () => {
  const a = box('a', { left: 0, top: 0, width: 100, height: 50 });
  const b = box('b', { left: 300, top: 200, width: 100, height: 50 });

  return { a, b, arclace: new Arclace({ autoUpdate: false }) };
};
// Bad input on purpose: the types would reject it, JavaScript doesn't
const loose = <T>(value: unknown): T => value as T;

afterEach(() => {
  document.body.innerHTML = '';
});

describe('connection options', () => {
  const rejected: [
    string,
    Record<string, unknown>,
    'TypeError' | 'RangeError'
  ][] = [
    ['an unknown type', { type: 'wavy' }, 'RangeError'],
    ['a type that is not a string', { type: 42 }, 'TypeError'],
    ['an unknown side', { startSide: 'middle' }, 'RangeError'],
    [
      'a side named after a prototype key',
      { startSide: 'constructor' },
      'RangeError'
    ],
    ['__proto__ as a side', { endSide: '__proto__' }, 'RangeError'],
    ['an unknown arrow', { arrow: 'yes' }, 'RangeError'],
    ['a negative strokeWidth', { strokeWidth: -2 }, 'RangeError'],
    ['a NaN strokeWidth', { strokeWidth: NaN }, 'TypeError'],
    ['a strokeWidth string', { strokeWidth: '3' }, 'TypeError'],
    ['an infinite curvature', { curvature: Infinity }, 'TypeError'],
    ['a NaN offset', { offset: NaN }, 'TypeError'],
    ['a negative radius', { radius: -5 }, 'RangeError'],
    ['a negative offset', { offset: -20 }, 'RangeError'],
    ['a negative spacing', { spacing: -16 }, 'RangeError'],
    ['a dashed string', { dashed: 'no' }, 'TypeError'],
    ['an animated number', { animated: 1 }, 'TypeError'],
    ['an anchors string', { anchors: 'yes' }, 'TypeError'],
    ['a spread number', { spread: 0 }, 'TypeError'],
    ['a label number', { label: 0 }, 'TypeError'],
    ['a label object', { label: {} }, 'TypeError'],
    ['a className number', { className: 42 }, 'TypeError'],
    ['a color number', { color: 42 }, 'TypeError'],
    ['an id number', { id: 42 }, 'TypeError'],
    ['an empty id', { id: '' }, 'TypeError']
  ];

  for (const [what, options, name] of rejected) {
    it(`rejects ${what} and adds nothing`, () => {
      const { a, b, arclace } = setup();
      const key = Object.keys(options)[0];

      assert.throws(
        () => arclace.connect(a, b, loose(options)),
        (error: Error) =>
          error.name === name &&
          error.message.startsWith(`arclace: options.${key} must`)
      );
      assert.equal(arclace.connections.length, 0);
      assert.equal(arclace.svg.children.length, 0);

      // The instance keeps working
      arclace.update();
      assert.ok(arclace.connect(a, b).geometry);
    });
  }

  it('accepts negative gaps and curvature, a zero strokeWidth and an empty label', () => {
    const { a, b, arclace } = setup();
    const connection = arclace.connect(a, b, {
      gap: -10,
      curvature: -1,
      strokeWidth: 0,
      label: ''
    });

    assert.ok(connection.geometry);
    assert.equal(connection.element.querySelector('.arc-label'), null);
  });

  it('ignores unknown keys and treats undefined as the default', () => {
    const { a, b, arclace } = setup();
    const connection = arclace.connect(
      a,
      b,
      loose({ colour: 'red', type: undefined })
    );

    assert.equal(connection.options.type, 'bezier');
    assert.equal(connection.element.getAttribute('data-type'), 'bezier');

    // Undefined falls back to the instance defaults too
    const withDefaults = new Arclace({
      autoUpdate: false,
      defaults: { type: 'straight', strokeWidth: 3 }
    });
    const fallback = withDefaults.connect(a, b, { type: undefined });

    fallback.setOptions({ strokeWidth: undefined });
    assert.equal(fallback.options.type, 'straight');
    assert.equal(fallback.options.strokeWidth, 3);
  });

  it('rejects options that are not an object', () => {
    const { a, b, arclace } = setup();

    assert.throws(() => arclace.connect(a, b, loose(null)), {
      name: 'TypeError',
      message: 'arclace: options must be an object, not null'
    });
    assert.throws(() => arclace.connect(a, b, loose([])), {
      name: 'TypeError',
      message: 'arclace: options must be an object, not an array'
    });
    assert.throws(() => arclace.connect(a, b, loose({ label: {} })), {
      name: 'TypeError',
      message: 'arclace: options.label must be a string, not an object'
    });
    assert.throws(() => arclace.connect(a, b, loose({ label: () => '' })), {
      name: 'TypeError',
      message: 'arclace: options.label must be a string, not a function'
    });
  });

  it('checks setOptions and keeps the old options when it throws', () => {
    const { a, b, arclace } = setup();
    const connection = arclace.connect(a, b);

    assert.throws(
      () => connection.setOptions(loose({ type: 'wavy' })),
      RangeError
    );
    assert.equal(connection.options.type, 'bezier');
    assert.throws(() => connection.setOptions(loose({ id: 'new' })), {
      name: 'TypeError',
      message: 'arclace: setOptions() cannot change the id'
    });
    assert.equal(connection.id, arclace.connections[0].id);
  });

  it('refuses setOptions on a removed connection', () => {
    const { a, b, arclace } = setup();
    const removed = arclace.connect(a, b, { id: 'gone' });
    const destroyed = arclace.connect(a, b);

    removed.remove();
    assert.throws(() => removed.setOptions({ type: 'straight' }), {
      name: 'ArclaceError',
      message: 'arclace: connection "gone" has been removed'
    });

    arclace.destroy();
    assert.throws(
      () => destroyed.setOptions({ type: 'straight' }),
      ArclaceError
    );
  });
});

describe('instance options', () => {
  const rejected: [
    string,
    Record<string, unknown> | null,
    'TypeError' | 'RangeError'
  ][] = [
    ['options that are not an object', null, 'TypeError'],
    ['an unknown autoUpdate', { autoUpdate: 'yes' }, 'RangeError'],
    ['a className number', { className: 42 }, 'TypeError'],
    ['a container that is not an element', { container: 42 }, 'TypeError'],
    ['bad defaults', { defaults: { type: 'wavy' } }, 'RangeError'],
    ['an id in the defaults', { defaults: { id: 'x' } }, 'TypeError']
  ];

  for (const [what, options, name] of rejected) {
    it(`rejects ${what} and adds no overlay`, () => {
      assert.throws(
        () => new Arclace(loose<ArcOptionsType>(options)),
        (error: Error) => error.name === name
      );
      assert.equal(document.querySelector('.arc-svg'), null);
    });
  }

  it('names the defaults in the message', () => {
    assert.throws(() => new Arclace({ defaults: loose({ arrow: 'yes' }) }), {
      name: 'RangeError',
      message:
        'arclace: options.defaults.arrow must be one of ' +
        '"none", "start", "end", "both", not "yes"'
    });
  });
});

describe('connectAll', () => {
  it('adds all definitions or none', () => {
    const { a, b, arclace } = setup();

    assert.throws(
      () =>
        arclace.connectAll([
          { startElement: a, endElement: b },
          { startElement: '#missing', endElement: b }
        ]),
      ArclaceError
    );
    assert.equal(arclace.connections.length, 0);

    assert.throws(
      () =>
        arclace.connectAll([
          { startElement: a, endElement: b },
          loose({ startElement: a, endElement: b, type: 'wavy' })
        ]),
      /arclace: definitions\[1\]\.type must be one of/
    );
    assert.equal(arclace.connections.length, 0);
  });

  it('rejects ids repeated in one call', () => {
    const { a, b, arclace } = setup();

    assert.throws(
      () =>
        arclace.connectAll([
          { startElement: a, endElement: b, id: 'x' },
          { startElement: b, endElement: a, id: 'x' }
        ]),
      {
        name: 'ArclaceError',
        message: 'arclace: definitions[1].id "x" is used more than once'
      }
    );
    assert.equal(arclace.connections.length, 0);
  });

  it('rejects a list that is not an array, and definitions that are not objects', () => {
    const { a, b, arclace } = setup();

    assert.throws(() => arclace.connectAll(loose({})), TypeError);
    assert.throws(
      () =>
        arclace.connectAll(loose([{ startElement: a, endElement: b }, null])),
      {
        name: 'TypeError',
        message: 'arclace: definitions[1] must be an object, not null'
      }
    );
    assert.equal(arclace.connections.length, 0);
  });

  it('cleans up after createConnections fails', () => {
    const { b } = setup();

    document.querySelector('.arc-svg')?.remove();

    assert.throws(
      () => createConnections([{ startElement: '#missing', endElement: b }]),
      ArclaceError
    );
    assert.equal(document.querySelector('.arc-svg'), null);
  });
});

describe('errors', () => {
  it('throws ArclaceError for failures', () => {
    const { a, b, arclace } = setup();

    arclace.connect(a, b, { id: 'x' });

    for (const fail of [
      () => arclace.connect('#missing', b),
      () => arclace.connect(a, b, { id: 'x' })
    ]) {
      assert.throws(fail, (error: Error) => {
        assert.ok(error instanceof ArclaceError);
        assert.ok(error instanceof Error);
        assert.equal(error.name, 'ArclaceError');
        assert.match(error.message, /^arclace: /);

        return true;
      });
    }

    arclace.destroy();
    assert.throws(() => arclace.connect(a, b), {
      name: 'ArclaceError',
      message: 'arclace: this instance has been destroyed'
    });
  });

  it('keeps the browser error as the cause of an invalid selector', () => {
    const { b, arclace } = setup();

    assert.throws(
      () => arclace.connect('###', b),
      (error: Error) => {
        assert.ok(error instanceof ArclaceError);
        assert.equal(
          error.message,
          'arclace: startElement "###" is not a valid selector'
        );
        assert.equal((error.cause as Error).name, 'SyntaxError');

        return true;
      }
    );
  });

  it('rejects targets that are neither elements nor strings with a TypeError', () => {
    const { b, arclace } = setup();

    assert.throws(() => arclace.connect(loose(null), b), TypeError);
    assert.throws(() => arclace.find(loose(42)), TypeError);
    assert.throws(() => arclace.disconnect(loose(42)), TypeError);
  });
});

describe('find and disconnect', () => {
  it('finds nothing for a selector that matches nothing', () => {
    const { a, b, arclace } = setup();

    arclace.connect(a, b);

    assert.deepEqual(arclace.find('#missing'), []);
    assert.equal(arclace.find('#a').length, 1);
  });

  it('throws for an invalid selector', () => {
    const { arclace } = setup();

    assert.throws(() => arclace.find('###'), ArclaceError);
    assert.throws(() => arclace.disconnect('1x'), {
      name: 'ArclaceError',
      message: 'arclace: element "1x" is not a valid selector'
    });
  });

  it('ignores null, undefined and targets that match nothing', () => {
    const { a, b, arclace } = setup();

    arclace.connect(a, b);
    arclace.disconnect(loose(null));
    arclace.disconnect(loose(undefined));
    arclace.disconnect('#missing');
    arclace.disconnect('no-such-id');

    assert.equal(arclace.connections.length, 1);
  });
});

describe('read-only state', () => {
  it('freezes the default options', () => {
    assert.ok(Object.isFrozen(DEFAULT_CONNECTION_OPTIONS));
    assert.throws(() => {
      loose<Record<string, unknown>>(DEFAULT_CONNECTION_OPTIONS).type =
        'straight';
    }, TypeError);
    assert.equal(DEFAULT_CONNECTION_OPTIONS.type, 'bezier');
  });

  it('makes the geometry read-only', () => {
    const { a, b, arclace } = setup();
    const connection = arclace.connect(a, b);

    assert.equal(Reflect.set(connection, 'geometry', null), false);
    assert.ok(Object.isFrozen(connection.geometry));
    assert.ok(connection.geometry);
  });
});

describe('path builders', () => {
  const p = { x: 0, y: 0 };
  const q = { x: 100, y: 100 };
  const side = loose<'left'>('middle');

  it('reject unknown sides', () => {
    assert.throws(() => bezierPath(p, side, q, 'left'), {
      name: 'RangeError',
      message:
        'arclace: startSide must be one of "top", "right", "bottom", "left", not "middle"'
    });
    // Used to recurse until the stack overflowed
    assert.throws(() => orthogonalPath(p, 'right', q, side), {
      name: 'RangeError',
      message:
        'arclace: endSide must be one of "top", "right", "bottom", "left", not "middle"'
    });
    assert.throws(
      () => orthogonalPath(p, loose('auto'), q, 'left'),
      RangeError
    );
  });

  it('reject points and numbers that are not finite', () => {
    assert.throws(() => straightPath({ x: NaN, y: 0 }, q), {
      name: 'TypeError',
      message: 'arclace: start.x must be a finite number, not NaN'
    });
    assert.throws(() => straightPath(p, loose(null)), TypeError);
    assert.throws(() => bezierPath(p, 'right', q, 'left', NaN), TypeError);
    assert.throws(
      () => orthogonalPath(p, 'right', q, 'left', { radius: -5 }),
      RangeError
    );
    assert.throws(
      () => orthogonalPath(p, 'right', q, 'left', { offset: Infinity }),
      TypeError
    );
  });
});
