import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { Connection } from '../Connection';
import { ConnectTheThings, createConnections } from '../ConnectTheThings';

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

describe('ConnectTheThings', () => {
  it('adds an overlay to the container', () => {
    const ctt = new ConnectTheThings({ autoUpdate: false, className: 'mine' });

    assert.equal(document.body.firstElementChild, ctt.svg);
    assert.equal(ctt.svg.getAttribute('class'), 'ctt-svg mine');
    assert.equal(ctt.svg.style.position, 'absolute');
  });

  it('makes a static container relative and restores it on destroy', () => {
    const container = document.createElement('div');

    document.body.appendChild(container);

    const ctt = new ConnectTheThings({ container, autoUpdate: false });

    assert.equal(container.style.position, 'relative');
    assert.equal(ctt.svg.parentElement, container);

    ctt.destroy();

    assert.equal(container.style.position, '');
    assert.equal(container.querySelector('svg'), null);
  });

  it('draws a line between facing sides', () => {
    const { a, b } = setup();
    const ctt = new ConnectTheThings({ autoUpdate: false });
    const connection = ctt.connect(a, b, { type: 'straight' });

    assert.ok(connection instanceof Connection);
    assert.equal(connection.path.getAttribute('d'), 'M 100 25 L 300 25');
    assert.equal(connection.geometry?.startSide, 'right');
    assert.equal(connection.geometry?.stopSide, 'left');
    assert.equal(connection.element.getAttribute('data-start-side'), 'right');
  });

  it('accepts selectors', () => {
    setup();

    const ctt = new ConnectTheThings({ autoUpdate: false });
    const connection = ctt.connect('#a', '#b');

    assert.equal(connection.startElement.id, 'a');
    assert.equal(connection.stopElement.id, 'b');
    assert.throws(
      () => ctt.connect('#a', '#missing'),
      /no stopElement matches/
    );
  });

  it('measures relative to the overlay and undoes scaling', () => {
    const { a, b } = setup();
    const ctt = new ConnectTheThings({ autoUpdate: false });

    // The overlay is 500px wide in CSS but drawn at 1000px, offset by 10px
    place(ctt.svg, { left: 10, top: 10, width: 1000, height: 1000 });
    Object.defineProperty(ctt.svg, 'clientWidth', { value: 500 });
    Object.defineProperty(ctt.svg, 'clientHeight', { value: 500 });

    const connection = ctt.connect(a, b, { type: 'straight' });

    assert.equal(connection.path.getAttribute('d'), 'M 45 7.5 L 145 7.5');
  });

  it('spreads connections that share a side', () => {
    const { a, b, c } = setup();
    const ctt = new ConnectTheThings({ autoUpdate: false });
    const [toC, toB] = ctt.connectAll([
      { startElement: a, stopElement: c, startSide: 'right', spacing: 10 },
      { startElement: a, stopElement: b, startSide: 'right', spacing: 10 }
    ]);

    // Sorted by the other end so the lines don't cross: b is above c
    assert.deepEqual(toB.geometry?.start, { x: 100, y: 20 });
    assert.deepEqual(toC.geometry?.start, { x: 100, y: 30 });
  });

  it('does not spread when spread is off', () => {
    const { a, b, c } = setup();
    const ctt = new ConnectTheThings({
      autoUpdate: false,
      defaults: { spread: false, startSide: 'right' }
    });
    const [one, two] = ctt.connectAll([
      { startElement: a, stopElement: b },
      { startElement: a, stopElement: c }
    ]);

    assert.deepEqual(one.geometry?.start, { x: 100, y: 25 });
    assert.deepEqual(two.geometry?.start, { x: 100, y: 25 });
  });

  it('applies gap', () => {
    const { a, b } = setup();
    const ctt = new ConnectTheThings({ autoUpdate: false });
    const connection = ctt.connect(a, b, { type: 'straight', gap: 4 });

    assert.equal(connection.path.getAttribute('d'), 'M 104 25 L 296 25');
  });

  it('merges defaults with connection options', () => {
    const { a, b } = setup();
    const ctt = new ConnectTheThings({
      autoUpdate: false,
      defaults: { type: 'orthogonal', strokeWidth: 3 }
    });
    const connection = ctt.connect(a, b, { strokeWidth: 1 });

    assert.equal(connection.options.type, 'orthogonal');
    assert.equal(connection.options.strokeWidth, 1);
    assert.equal(connection.path.getAttribute('stroke-width'), '1');
    assert.ok(connection.element.classList.contains('ctt-orthogonal'));
  });

  it('draws arrows that end at the element edge', () => {
    const { a, b } = setup();
    const ctt = new ConnectTheThings({ autoUpdate: false });
    const connection = ctt.connect(a, b, { type: 'straight', arrow: 'end' });
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
    const ctt = new ConnectTheThings({ autoUpdate: false });
    const connection = ctt.connect(a, b, {
      type: 'straight',
      label: 'hello',
      anchors: true,
      animated: true,
      color: 'red',
      className: 'one two'
    });
    const label = connection.element.querySelector('.ctt-label')!;
    const anchors = connection.element.querySelectorAll('.ctt-anchor');

    assert.equal(label.textContent, 'hello');
    assert.equal(label.getAttribute('x'), '200');
    assert.equal(anchors.length, 2);
    assert.equal(anchors[1].getAttribute('cx'), '300');
    assert.equal(connection.element.style.color, 'red');
    assert.equal(connection.path.getAttribute('stroke-dasharray'), '6 6');

    for (const name of ['ctt-animated', 'ctt-dashed', 'one', 'two']) {
      assert.ok(connection.element.classList.contains(name), name);
    }

    connection.setOptions({
      label: undefined,
      anchors: false,
      animated: false,
      color: undefined
    });

    assert.equal(connection.element.querySelector('.ctt-label'), null);
    assert.equal(connection.element.querySelector('.ctt-anchor'), null);
    assert.equal(connection.element.style.color, '');
    assert.equal(connection.path.getAttribute('stroke-dasharray'), null);
  });

  it('hides connections to elements that are not rendered', () => {
    const { a, b } = setup();
    const ctt = new ConnectTheThings({ autoUpdate: false });
    const connection = ctt.connect(a, b);

    b.getClientRects = () => [] as unknown as DOMRectList;
    ctt.update();

    assert.equal(connection.element.getAttribute('display'), 'none');
    assert.equal(connection.geometry, null);

    place(b, { left: 300, top: 0, width: 100, height: 50 });
    ctt.update();

    assert.equal(connection.element.getAttribute('display'), null);
  });

  it('finds, gets and disconnects connections', () => {
    const { a, b, c } = setup();
    const ctt = new ConnectTheThings({ autoUpdate: false });
    const ab = ctt.connect(a, b, { id: 'ab' });
    const ac = ctt.connect(a, c);
    const bc = ctt.connect(b, c);

    assert.equal(ctt.get('ab'), ab);
    assert.deepEqual(ctt.find('#c'), [ac, bc]);
    assert.throws(() => ctt.connect(a, b, { id: 'ab' }), /exists/);

    ctt.disconnect('ab');
    assert.deepEqual(ctt.connections, [ac, bc]);
    assert.equal(ab.element.isConnected, false);

    bc.remove();
    assert.deepEqual(ctt.connections, [ac]);

    ctt.disconnect('#nothing-here');
    ctt.disconnect(c);
    assert.deepEqual(ctt.connections, []);

    // A connection that is already gone is ignored
    ctt.disconnect(ab);
    assert.deepEqual(ctt.connections, []);
  });

  it('rejects targets that are not elements', () => {
    const { a } = setup();
    const ctt = new ConnectTheThings({ autoUpdate: false });

    assert.throws(
      () => ctt.connect(a, {} as Element),
      /stopElement must be an Element or a selector string/
    );
    assert.throws(() => ctt.connect('#nothing-here', a), /no startElement/);
  });

  it('clears and destroys', () => {
    const { a, b } = setup();
    const ctt = new ConnectTheThings({ autoUpdate: false });

    ctt.connect(a, b);
    ctt.clear();

    assert.equal(ctt.connections.length, 0);
    assert.equal(ctt.svg.querySelector('path'), null);

    ctt.destroy();

    assert.equal(ctt.svg.isConnected, false);
    assert.throws(() => ctt.connect(a, b), /destroyed/);

    // Destroying again does nothing
    ctt.destroy();
    ctt.update();
  });

  it('refuses to run without a DOM', () => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');

    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: undefined
    });

    try {
      assert.throws(() => new ConnectTheThings(), /a DOM is required/);
    } finally {
      // Restore it before afterEach empties the body
      Object.defineProperty(globalThis, 'document', descriptor!);
    }
  });

  it('redraws every connection from a connection', () => {
    const { a, b } = setup();
    const ctt = new ConnectTheThings({ autoUpdate: false });
    const connection = ctt.connect(a, b, { type: 'straight' });

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
    const ctt = new ConnectTheThings();
    const connection = ctt.connect(a, b, { type: 'straight' });

    t.after(() => ctt.destroy());
    place(b, { left: 500, top: 0, width: 100, height: 50 });
    b.style.left = '500px';

    await new Promise((resolve) => setTimeout(resolve, 50));

    assert.equal(connection.path.getAttribute('d'), 'M 100 25 L 500 25');
  });

  it('drops a scheduled redraw when update() runs first', (t) => {
    const { a, b } = setup();
    const ctt = new ConnectTheThings();
    const connection = ctt.connect(a, b, { type: 'straight' });
    const cancelled: number[] = [];
    const cancel = globalThis.cancelAnimationFrame;

    t.after(() => {
      globalThis.cancelAnimationFrame = cancel;
      ctt.destroy();
    });
    globalThis.cancelAnimationFrame = (handle) => {
      cancelled.push(handle);
      cancel(handle);
    };
    window.dispatchEvent(new window.Event('resize'));
    place(b, { left: 500, top: 0, width: 100, height: 50 });
    ctt.update();

    assert.equal(cancelled.length, 1);
    assert.equal(connection.path.getAttribute('d'), 'M 100 25 L 500 25');
  });

  it("redraws on every frame with 'frame' and stops on destroy", async (t) => {
    const { a, b } = setup();
    const ctt = new ConnectTheThings({ autoUpdate: 'frame' });
    const connection = ctt.connect(a, b, { type: 'straight' });

    t.after(() => ctt.destroy());
    place(b, { left: 500, top: 0, width: 100, height: 50 });
    await nextFrame();
    await nextFrame();

    assert.equal(connection.path.getAttribute('d'), 'M 100 25 L 500 25');

    ctt.destroy();
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
    const ctt = new ConnectTheThings();

    t.after(() => ctt.destroy());
    ctt.connect(a, b, { id: 'ab' });
    ctt.connect(a, c, { id: 'ac' });

    assert.deepEqual(observed, new Set([document.body, a, b, c]));

    ctt.disconnect('ab');
    assert.deepEqual(observed, new Set([document.body, a, c]));

    ctt.destroy();
    assert.equal(disconnected, true);
  });
});

describe('createConnections', () => {
  it('creates an instance with the given connections', () => {
    setup();

    const ctt = createConnections(
      [
        { startElement: '#a', stopElement: '#b' },
        { startElement: '#b', stopElement: '#c', arrow: 'both' }
      ],
      { autoUpdate: false }
    );

    assert.equal(ctt.connections.length, 2);
    assert.equal(ctt.connections[1].options.arrow, 'both');
  });
});
