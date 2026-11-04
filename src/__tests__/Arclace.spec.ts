import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { Connection } from '../Connection';
import { Arclace, createConnections } from '../Arclace';

import { box, place } from './helpers';

const setup = () => {
  const a = box('a', { left: 0, top: 0, width: 100, height: 50 });
  const b = box('b', { left: 300, top: 0, width: 100, height: 50 });
  const c = box('c', { left: 300, top: 200, width: 100, height: 50 });

  return { a, b, c };
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Arclace', () => {
  it('adds an overlay to the container', () => {
    const arclace = new Arclace({ autoUpdate: false, className: 'mine' });

    assert.equal(document.body.firstElementChild, arclace.svg);
    assert.equal(arclace.svg.getAttribute('class'), 'arc-svg mine');
    assert.equal(arclace.svg.style.position, 'absolute');
  });

  it('makes a static container relative and restores it on destroy', () => {
    const container = document.createElement('div');

    document.body.appendChild(container);

    const arclace = new Arclace({ container, autoUpdate: false });

    assert.equal(container.style.position, 'relative');
    assert.equal(arclace.svg.parentElement, container);

    arclace.destroy();

    assert.equal(container.style.position, '');
    assert.equal(container.querySelector('svg'), null);
  });

  it('draws a line between facing sides', () => {
    const { a, b } = setup();
    const arclace = new Arclace({ autoUpdate: false });
    const connection = arclace.connect(a, b, { type: 'straight' });

    assert.ok(connection instanceof Connection);
    assert.equal(connection.path.getAttribute('d'), 'M 100 25 L 300 25');
    assert.equal(connection.geometry?.startSide, 'right');
    assert.equal(connection.geometry?.stopSide, 'left');
    assert.equal(connection.element.getAttribute('data-start-side'), 'right');
  });

  it('accepts selectors', () => {
    setup();

    const arclace = new Arclace({ autoUpdate: false });
    const connection = arclace.connect('#a', '#b');

    assert.equal(connection.startElement.id, 'a');
    assert.equal(connection.stopElement.id, 'b');
    assert.throws(
      () => arclace.connect('#a', '#missing'),
      /no stopElement matches/
    );
  });

  it('measures relative to the overlay and undoes scaling', () => {
    const { a, b } = setup();
    const arclace = new Arclace({ autoUpdate: false });

    // The overlay is 500px wide in CSS but drawn at 1000px, offset by 10px
    place(arclace.svg, { left: 10, top: 10, width: 1000, height: 1000 });
    Object.defineProperty(arclace.svg, 'clientWidth', { value: 500 });
    Object.defineProperty(arclace.svg, 'clientHeight', { value: 500 });

    const connection = arclace.connect(a, b, { type: 'straight' });

    assert.equal(connection.path.getAttribute('d'), 'M 45 7.5 L 145 7.5');
  });

  it('spreads connections that share a side', () => {
    const { a, b, c } = setup();
    const arclace = new Arclace({ autoUpdate: false });
    const [toC, toB] = arclace.connectAll([
      { startElement: a, stopElement: c, startSide: 'right', spacing: 10 },
      { startElement: a, stopElement: b, startSide: 'right', spacing: 10 }
    ]);

    // Sorted by the other end so the lines don't cross: b is above c
    assert.deepEqual(toB.geometry?.start, { x: 100, y: 20 });
    assert.deepEqual(toC.geometry?.start, { x: 100, y: 30 });
  });

  it('does not spread when spread is off', () => {
    const { a, b, c } = setup();
    const arclace = new Arclace({
      autoUpdate: false,
      defaults: { spread: false, startSide: 'right' }
    });
    const [one, two] = arclace.connectAll([
      { startElement: a, stopElement: b },
      { startElement: a, stopElement: c }
    ]);

    assert.deepEqual(one.geometry?.start, { x: 100, y: 25 });
    assert.deepEqual(two.geometry?.start, { x: 100, y: 25 });
  });

  it('applies gap', () => {
    const { a, b } = setup();
    const arclace = new Arclace({ autoUpdate: false });
    const connection = arclace.connect(a, b, { type: 'straight', gap: 4 });

    assert.equal(connection.path.getAttribute('d'), 'M 104 25 L 296 25');
  });

  it('merges defaults with connection options', () => {
    const { a, b } = setup();
    const arclace = new Arclace({
      autoUpdate: false,
      defaults: { type: 'orthogonal', strokeWidth: 3 }
    });
    const connection = arclace.connect(a, b, { strokeWidth: 1 });

    assert.equal(connection.options.type, 'orthogonal');
    assert.equal(connection.options.strokeWidth, 1);
    assert.equal(connection.path.getAttribute('stroke-width'), '1');
    assert.ok(connection.element.classList.contains('arc-orthogonal'));
  });

  it('draws arrows that end at the element edge', () => {
    const { a, b } = setup();
    const arclace = new Arclace({ autoUpdate: false });
    const connection = arclace.connect(a, b, {
      type: 'straight',
      arrow: 'end'
    });
    const marker = connection.element.querySelector('marker')!;

    assert.ok(marker);
    assert.equal(
      connection.path.getAttribute('marker-end'),
      `url(#${marker.id})`
    );
    assert.equal(connection.path.getAttribute('marker-start'), null);
    // The line stops one arrow length (4 × stroke width) short of the edge
    assert.equal(connection.path.getAttribute('d'), 'M 100 25 L 292 25');
    assert.deepEqual(connection.geometry?.stop, { x: 300, y: 25 });

    connection.setOptions({ arrow: 'none' });

    assert.equal(connection.element.querySelector('marker'), null);
    assert.equal(connection.path.getAttribute('marker-end'), null);
  });

  it('adds and removes labels, anchors and styles', () => {
    const { a, b } = setup();
    const arclace = new Arclace({ autoUpdate: false });
    const connection = arclace.connect(a, b, {
      type: 'straight',
      label: 'hello',
      anchors: true,
      animated: true,
      color: 'red',
      className: 'one two'
    });
    const label = connection.element.querySelector('.arc-label')!;
    const anchors = connection.element.querySelectorAll('.arc-anchor');

    assert.equal(label.textContent, 'hello');
    assert.equal(label.getAttribute('x'), '200');
    assert.equal(anchors.length, 2);
    assert.equal(anchors[1].getAttribute('cx'), '300');
    assert.equal(connection.element.style.color, 'red');
    assert.equal(connection.path.getAttribute('stroke-dasharray'), '6 6');

    for (const name of ['arc-animated', 'arc-dashed', 'one', 'two']) {
      assert.ok(connection.element.classList.contains(name), name);
    }

    connection.setOptions({
      label: undefined,
      anchors: false,
      animated: false,
      color: undefined
    });

    assert.equal(connection.element.querySelector('.arc-label'), null);
    assert.equal(connection.element.querySelector('.arc-anchor'), null);
    assert.equal(connection.element.style.color, '');
    assert.equal(connection.path.getAttribute('stroke-dasharray'), null);
  });

  it('hides connections to elements that are not rendered', () => {
    const { a, b } = setup();
    const arclace = new Arclace({ autoUpdate: false });
    const connection = arclace.connect(a, b);

    b.getClientRects = () => [] as unknown as DOMRectList;
    arclace.update();

    assert.equal(connection.element.getAttribute('display'), 'none');
    assert.equal(connection.geometry, null);

    place(b, { left: 300, top: 0, width: 100, height: 50 });
    arclace.update();

    assert.equal(connection.element.getAttribute('display'), null);
  });

  it('finds, gets and disconnects connections', () => {
    const { a, b, c } = setup();
    const arclace = new Arclace({ autoUpdate: false });
    const ab = arclace.connect(a, b, { id: 'ab' });
    const ac = arclace.connect(a, c);
    const bc = arclace.connect(b, c);

    assert.equal(arclace.get('ab'), ab);
    assert.deepEqual(arclace.find('#c'), [ac, bc]);
    assert.throws(() => arclace.connect(a, b, { id: 'ab' }), /exists/);

    arclace.disconnect('ab');
    assert.deepEqual(arclace.connections, [ac, bc]);
    assert.equal(ab.element.isConnected, false);

    bc.remove();
    assert.deepEqual(arclace.connections, [ac]);

    arclace.disconnect('#nothing-here');
    arclace.disconnect(c);
    assert.deepEqual(arclace.connections, []);

    // A connection that is already gone is ignored
    arclace.disconnect(ab);
    assert.deepEqual(arclace.connections, []);
  });

  it('rejects targets that are not elements', () => {
    const { a } = setup();
    const arclace = new Arclace({ autoUpdate: false });

    assert.throws(
      () => arclace.connect(a, {} as Element),
      /stopElement must be an Element or a selector string/
    );
    assert.throws(() => arclace.connect('#nothing-here', a), /no startElement/);
  });

  it('clears and destroys', () => {
    const { a, b } = setup();
    const arclace = new Arclace({ autoUpdate: false });

    arclace.connect(a, b);
    arclace.clear();

    assert.equal(arclace.connections.length, 0);
    assert.equal(arclace.svg.querySelector('path'), null);

    arclace.destroy();

    assert.equal(arclace.svg.isConnected, false);
    assert.throws(() => arclace.connect(a, b), /destroyed/);

    // Destroying again does nothing
    arclace.destroy();
    arclace.update();
  });

  it('refuses to run without a DOM', () => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');

    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: undefined
    });

    try {
      assert.throws(() => new Arclace(), /a DOM is required/);
    } finally {
      // Restore it before afterEach empties the body
      Object.defineProperty(globalThis, 'document', descriptor!);
    }
  });

  it('redraws every connection from a connection', () => {
    const { a, b } = setup();
    const arclace = new Arclace({ autoUpdate: false });
    const connection = arclace.connect(a, b, { type: 'straight' });

    place(b, { left: 500, top: 0, width: 100, height: 50 });
    connection.update();

    assert.equal(connection.path.getAttribute('d'), 'M 100 25 L 500 25');
  });
});

describe('autoUpdate', () => {
  const nextFrame = () =>
    new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));

  it('redraws after DOM changes', async (t) => {
    const { a, b } = setup();
    const arclace = new Arclace();
    const connection = arclace.connect(a, b, { type: 'straight' });

    t.after(() => arclace.destroy());
    place(b, { left: 500, top: 0, width: 100, height: 50 });
    b.style.left = '500px';

    await new Promise((resolve) => setTimeout(resolve, 50));

    assert.equal(connection.path.getAttribute('d'), 'M 100 25 L 500 25');
  });

  it('drops a scheduled redraw when update() runs first', (t) => {
    const { a, b } = setup();
    const arclace = new Arclace();
    const connection = arclace.connect(a, b, { type: 'straight' });
    const cancelled: number[] = [];
    const cancel = globalThis.cancelAnimationFrame;

    t.after(() => {
      globalThis.cancelAnimationFrame = cancel;
      arclace.destroy();
    });
    globalThis.cancelAnimationFrame = (handle) => {
      cancelled.push(handle);
      cancel(handle);
    };
    window.dispatchEvent(new window.Event('resize'));
    place(b, { left: 500, top: 0, width: 100, height: 50 });
    arclace.update();

    assert.equal(cancelled.length, 1);
    assert.equal(connection.path.getAttribute('d'), 'M 100 25 L 500 25');
  });

  it("redraws on every frame with 'frame' and stops on destroy", async (t) => {
    const { a, b } = setup();
    const arclace = new Arclace({ autoUpdate: 'frame' });
    const connection = arclace.connect(a, b, { type: 'straight' });

    t.after(() => arclace.destroy());
    place(b, { left: 500, top: 0, width: 100, height: 50 });
    await nextFrame();
    await nextFrame();

    assert.equal(connection.path.getAttribute('d'), 'M 100 25 L 500 25');

    arclace.destroy();
    place(b, { left: 700, top: 0, width: 100, height: 50 });
    await nextFrame();
    await nextFrame();

    assert.equal(connection.path.getAttribute('d'), 'M 100 25 L 500 25');
  });

  it('observes connected elements while they are in use', (t) => {
    const observed = new Set<Element>();
    let disconnected = false;

    class FakeResizeObserver {
      observe(el: Element) {
        observed.add(el);
      }
      unobserve(el: Element) {
        observed.delete(el);
      }
      disconnect() {
        disconnected = true;
      }
    }

    globalThis.ResizeObserver =
      FakeResizeObserver as unknown as typeof ResizeObserver;
    t.after(() => {
      delete (globalThis as { ResizeObserver?: unknown }).ResizeObserver;
    });

    const { a, b, c } = setup();
    const arclace = new Arclace();

    t.after(() => arclace.destroy());
    arclace.connect(a, b, { id: 'ab' });
    arclace.connect(a, c, { id: 'ac' });

    assert.deepEqual(observed, new Set([document.body, a, b, c]));

    arclace.disconnect('ab');
    assert.deepEqual(observed, new Set([document.body, a, c]));

    arclace.destroy();
    assert.equal(disconnected, true);
  });
});

describe('createConnections', () => {
  it('creates an instance with the given connections', () => {
    setup();

    const arclace = createConnections(
      [
        { startElement: '#a', stopElement: '#b' },
        { startElement: '#b', stopElement: '#c', arrow: 'both' }
      ],
      { autoUpdate: false }
    );

    assert.equal(arclace.connections.length, 2);
    assert.equal(arclace.connections[1].options.arrow, 'both');
  });
});
