import { Connection } from './Connection';
import type {
  CTTConnectionDefinitionType,
  CTTConnectionOptionsType,
  CTTElementTargetType,
  CTTOptionsType,
  CTTRectInterface,
  CTTSideType
} from './types';
import { center, isHorizontalSide } from './utils/geometry';
import { uniqueID } from './utils/id';
import { getLocalRect, getOrigin, isRendered } from './utils/measure';
import { resolveElement } from './utils/resolve-element';
import { getAnchorPoint, resolveSides } from './utils/sides';
import { createSVGElement } from './utils/svg';

type CTTLayoutItemType = {
  connection: Connection;
  startRect: CTTRectInterface;
  stopRect: CTTRectInterface;
  startSide: CTTSideType;
  stopSide: CTTSideType;
  startSlot: { index: number; count: number };
  stopSlot: { index: number; count: number };
};

type CTTSlotEntryType = {
  slot: { index: number; count: number };
  // Position of the other end along the side, used to avoid crossing lines
  key: number;
};

const nextFrame = (callback: () => void): number =>
  typeof requestAnimationFrame === 'function'
    ? requestAnimationFrame(callback)
    : (setTimeout(callback, 16) as unknown as number);
const cancelFrame = (handle: number): void => {
  if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(handle);
  else clearTimeout(handle);
};

/**
 * Draws and maintains SVG lines between DOM elements.
 *
 * An instance adds one `<svg class="ctt-svg">` overlay to its container and
 * draws every connection into it.
 *
 * @example
 * ```ts
 * import { ConnectTheThings } from '@phun-ky/connect-the-things';
 *
 * const ctt = new ConnectTheThings({ container: '#diagram' });
 *
 * ctt.connect('#a', '#b', { arrow: 'end', label: 'depends on' });
 * ```
 */
export class ConnectTheThings {
  /**
   * The element the overlay was added to.
   */
  readonly container: HTMLElement;

  /**
   * The SVG overlay all lines are drawn in.
   */
  readonly svg: SVGSVGElement;

  #options: CTTOptionsType;
  #connections = new Map<string, Connection>();
  #frame = 0;
  #loop = 0;
  #destroyed = false;
  #resizeObserver: ResizeObserver | null = null;
  #mutationObserver: MutationObserver | null = null;
  #originalPosition: string | null = null;

  constructor(options: CTTOptionsType = {}) {
    if (typeof document === 'undefined') {
      throw Error('connect-the-things: a DOM is required');
    }

    this.#options = options;
    this.container = (
      options.container
        ? resolveElement(options.container, 'container')
        : document.body
    ) as HTMLElement;

    // The overlay is positioned absolutely, so the container has to be its
    // containing block for it to scroll and clip with the container
    if (
      this.container !== document.body &&
      getComputedStyle(this.container).position === 'static'
    ) {
      this.#originalPosition = this.container.style.position;
      this.container.style.position = 'relative';
    }

    this.svg = createSVGElement('svg', {
      class: ['ctt-svg', options.className].filter(Boolean).join(' '),
      'aria-hidden': 'true'
    });
    Object.assign(this.svg.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      overflow: 'visible',
      pointerEvents: 'none'
    });
    this.container.prepend(this.svg);
    this.#startAutoUpdate();
  }

  /**
   * All current connections, in the order they were made.
   */
  get connections(): Connection[] {
    return [...this.#connections.values()];
  }

  /**
   * Connects two elements and draws the line right away.
   *
   * @param startElement - The element (or selector) the line starts at.
   * @param stopElement - The element (or selector) the line stops at.
   * @param options - Options for this connection, merged over the instance defaults.
   * @throws {Error} When an element can't be found or the id is taken.
   * @example
   * ```ts
   * const connection = ctt.connect(a, b, { type: 'orthogonal', arrow: 'end' });
   * ```
   */
  connect(
    startElement: CTTElementTargetType,
    stopElement: CTTElementTargetType,
    options: CTTConnectionOptionsType = {}
  ): Connection {
    const connection = this.#add(startElement, stopElement, options);

    this.update();

    return connection;
  }

  /**
   * Connects many pairs of elements and draws them in one go.
   *
   * @example
   * ```ts
   * ctt.connectAll([
   *   { startElement: '#a', stopElement: '#b' },
   *   { startElement: '#a', stopElement: '#c', dashed: true }
   * ]);
   * ```
   */
  connectAll(definitions: CTTConnectionDefinitionType[]): Connection[] {
    const connections = definitions.map(
      ({ startElement, stopElement, ...options }) =>
        this.#add(startElement, stopElement, options)
    );

    this.update();

    return connections;
  }

  /**
   * Returns the connection with the given id.
   */
  get(id: string): Connection | undefined {
    return this.#connections.get(id);
  }

  /**
   * Returns every connection that starts or stops at an element.
   */
  find(target: CTTElementTargetType): Connection[] {
    const el = resolveElement(target);

    return this.connections.filter(
      (connection) =>
        connection.startElement === el || connection.stopElement === el
    );
  }

  /**
   * Removes connections.
   *
   * @param target - A connection, a connection id, or an element (or
   *   selector) whose connections should all be removed. Targets that match
   *   nothing are ignored.
   * @example
   * ```ts
   * ctt.disconnect(connection);
   * ctt.disconnect('my-connection-id');
   * ctt.disconnect(document.querySelector('#a'));
   * ```
   */
  disconnect(target: Connection | string | Element): void {
    let removed: Connection[] = [];

    if (target instanceof Connection) {
      removed = [target];
    } else if (typeof target === 'string' && this.#connections.has(target)) {
      removed = [this.#connections.get(target)!];
    } else if (target instanceof Element) {
      removed = this.find(target);
    } else {
      const el = document.querySelector(target);

      if (el) removed = this.find(el);
    }

    for (const connection of removed) {
      if (this.#connections.get(connection.id) !== connection) continue;

      this.#connections.delete(connection.id);
      connection._dispose();
      this.#unobserve(connection.startElement);
      this.#unobserve(connection.stopElement);
    }

    if (removed.length > 0) this.update();
  }

  /**
   * Removes every connection.
   */
  clear(): void {
    for (const connection of this.#connections.values()) {
      connection._dispose();
    }

    this.#connections.clear();
    this.#resizeObserver?.disconnect();

    if (this.#resizeObserver) this.#resizeObserver.observe(this.container);
  }

  /**
   * Remeasures every element and redraws every connection. Called
   * automatically when `autoUpdate` is on; call it yourself after moving
   * elements in ways the page can't observe.
   */
  update(): void {
    if (this.#destroyed) return;

    if (this.#frame) {
      cancelFrame(this.#frame);
      this.#frame = 0;
    }

    // Measure everything first, then write, so the browser only lays out once
    const origin = getOrigin(this.svg);
    const items: CTTLayoutItemType[] = [];
    const slots = new Map<Element, Record<CTTSideType, CTTSlotEntryType[]>>();
    const addToSlot = (
      el: Element,
      side: CTTSideType,
      otherRect: CTTRectInterface
    ): { index: number; count: number } => {
      const slot = { index: 0, count: 1 };
      const other = center(otherRect);

      if (!slots.has(el)) {
        slots.set(el, { top: [], right: [], bottom: [], left: [] });
      }

      slots.get(el)![side].push({
        slot,
        key: isHorizontalSide(side) ? other.y : other.x
      });

      return slot;
    };

    for (const connection of this.#connections.values()) {
      const { startElement, stopElement } = connection;

      if (!isRendered(startElement) || !isRendered(stopElement)) {
        connection._hide();
        continue;
      }

      const { spread, startSide, stopSide } = connection.options;
      const startRect = getLocalRect(startElement, origin);
      const stopRect = getLocalRect(stopElement, origin);
      const sides = resolveSides(startRect, stopRect, startSide, stopSide);
      const solo = { index: 0, count: 1 };

      items.push({
        connection,
        startRect,
        stopRect,
        ...sides,
        startSlot: spread
          ? addToSlot(startElement, sides.startSide, stopRect)
          : solo,
        stopSlot: spread
          ? addToSlot(stopElement, sides.stopSide, startRect)
          : { ...solo }
      });
    }

    for (const sides of slots.values()) {
      for (const entries of Object.values(sides)) {
        entries
          .sort((a, b) => a.key - b.key)
          .forEach((entry, index) => {
            entry.slot.index = index;
            entry.slot.count = entries.length;
          });
      }
    }

    for (const item of items) {
      const { connection, startRect, stopRect, startSide, stopSide } = item;
      const { spacing, gap } = connection.options;

      connection._draw(
        getAnchorPoint(startRect, startSide, {
          ...item.startSlot,
          spacing,
          gap
        }),
        startSide,
        getAnchorPoint(stopRect, stopSide, { ...item.stopSlot, spacing, gap }),
        stopSide
      );
    }
  }

  /**
   * Removes every connection and the overlay, and stops listening for
   * changes. The instance can't be used afterwards.
   */
  destroy(): void {
    if (this.#destroyed) return;

    this.clear();
    this.#destroyed = true;

    if (this.#frame) cancelFrame(this.#frame);

    if (this.#loop) cancelFrame(this.#loop);

    window.removeEventListener('resize', this.#scheduleUpdate);
    document.removeEventListener('scroll', this.#scheduleUpdate, {
      capture: true
    });
    this.#resizeObserver?.disconnect();
    this.#mutationObserver?.disconnect();
    this.svg.remove();

    if (this.#originalPosition !== null) {
      this.container.style.position = this.#originalPosition;
    }
  }

  #add(
    startTarget: CTTElementTargetType,
    stopTarget: CTTElementTargetType,
    options: CTTConnectionOptionsType
  ): Connection {
    if (this.#destroyed) {
      throw Error('connect-the-things: this instance has been destroyed');
    }

    const startElement = resolveElement(startTarget, 'startElement');
    const stopElement = resolveElement(stopTarget, 'stopElement');
    const id = options.id ?? `ctt-${uniqueID()}`;

    if (this.#connections.has(id)) {
      throw Error(`connect-the-things: a connection with id "${id}" exists`);
    }

    const connection = new Connection({
      id,
      startElement,
      stopElement,
      options,
      defaults: this.#options.defaults,
      owner: this
    });

    this.#connections.set(id, connection);
    this.svg.appendChild(connection.element);
    this.#resizeObserver?.observe(startElement);
    this.#resizeObserver?.observe(stopElement);

    return connection;
  }

  #unobserve(el: Element): void {
    if (!this.#resizeObserver || el === this.container) return;

    const inUse = this.connections.some(
      (connection) =>
        connection.startElement === el || connection.stopElement === el
    );

    if (!inUse) this.#resizeObserver.unobserve(el);
  }

  #scheduleUpdate = (): void => {
    if (this.#frame || this.#destroyed) return;

    this.#frame = nextFrame(() => {
      this.#frame = 0;
      this.update();
    });
  };

  #startAutoUpdate(): void {
    const { autoUpdate = true } = this.#options;

    if (autoUpdate === false) return;

    if (autoUpdate === 'frame') {
      const loop = (): void => {
        this.update();
        this.#loop = nextFrame(loop);
      };

      this.#loop = nextFrame(loop);

      return;
    }

    window.addEventListener('resize', this.#scheduleUpdate);
    // Capture scroll events from any scrolling element, not just the page
    document.addEventListener('scroll', this.#scheduleUpdate, {
      capture: true,
      passive: true
    });

    if (typeof ResizeObserver !== 'undefined') {
      this.#resizeObserver = new ResizeObserver(this.#scheduleUpdate);
      this.#resizeObserver.observe(this.container);
    }

    if (typeof MutationObserver !== 'undefined') {
      this.#mutationObserver = new MutationObserver((records) => {
        // Ignore the changes we make to the overlay ourselves
        if (records.some((record) => !this.svg.contains(record.target))) {
          this.#scheduleUpdate();
        }
      });
      this.#mutationObserver.observe(this.container, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['style', 'class', 'hidden']
      });
    }

    document.fonts?.ready.then(this.#scheduleUpdate);
  }
}

/**
 * Creates a {@link ConnectTheThings} instance and connects the given pairs.
 *
 * @example
 * ```ts
 * import { createConnections } from '@phun-ky/connect-the-things';
 *
 * const ctt = createConnections(
 *   [
 *     { startElement: '#a', stopElement: '#b' },
 *     { startElement: '#b', stopElement: '#c', arrow: 'end' }
 *   ],
 *   { defaults: { type: 'orthogonal' } }
 * );
 * ```
 */
export const createConnections = (
  definitions: CTTConnectionDefinitionType[],
  options?: CTTOptionsType
): ConnectTheThings => {
  const ctt = new ConnectTheThings(options);

  ctt.connectAll(definitions);

  return ctt;
};
