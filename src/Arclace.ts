import { Connection } from './Connection';
import { ArclaceError } from './errors';
import type {
  ArcConnectionDefinitionType,
  ArcConnectionOptionsType,
  ArcElementTargetType,
  ArcOptionsType,
  ArcRectInterface,
  ArcSideType
} from './types';
import { center, isHorizontalSide } from './utils/geometry';
import { uniqueID } from './utils/id';
import { getLocalRect, getOrigin, isRendered } from './utils/measure';
import { querySelector, resolveElement } from './utils/resolve-element';
import { getAnchorPoint, resolveSides } from './utils/sides';
import { createSVGElement } from './utils/svg';
import {
  assertObject,
  validateConnectionOptions,
  validateOptions
} from './utils/validate';

type ArcLayoutItemType = {
  connection: Connection;
  startRect: ArcRectInterface;
  endRect: ArcRectInterface;
  startSide: ArcSideType;
  endSide: ArcSideType;
  startSlot: { index: number; count: number };
  endSlot: { index: number; count: number };
};

// A connection that has been checked and can be added
type ArcPreparedConnectionType = {
  id: string;
  startElement: Element;
  endElement: Element;
  options: ArcConnectionOptionsType;
};

type ArcSlotEntryType = {
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
 * An instance adds one `<svg class="arc-svg">` overlay to its container and
 * draws every connection into it.
 *
 * @example
 * ```ts
 * import { Arclace } from '@phun-ky/arclace';
 *
 * const arclace = new Arclace({ container: '#diagram' });
 *
 * arclace.connect('#a', '#b', { arrow: 'end', label: 'depends on' });
 * ```
 */
export class Arclace {
  /**
   * The element the overlay was added to.
   */
  readonly container: HTMLElement;

  /**
   * The SVG overlay all lines are drawn in.
   */
  readonly svg: SVGSVGElement;

  #options: ArcOptionsType;
  #connections = new Map<string, Connection>();
  #frame = 0;
  #loop = 0;
  #destroyed = false;
  #resizeObserver: ResizeObserver | null = null;
  #mutationObserver: MutationObserver | null = null;
  #originalPosition: string | null = null;

  /**
   * @throws {TypeError} When an option has the wrong type.
   * @throws {RangeError} When an option is out of range.
   * @throws {ArclaceError} When there is no DOM, or the container can't be
   *   found.
   */
  constructor(options: ArcOptionsType = {}) {
    if (typeof document === 'undefined') {
      throw new ArclaceError('a DOM is required');
    }

    this.#options = validateOptions(options);
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
      class: ['arc-svg', options.className].filter(Boolean).join(' '),
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
   * @param endElement - The element (or selector) the line ends at.
   * @param options - Options for this connection, merged over the instance defaults.
   * @throws {TypeError} When an element or an option has the wrong type.
   * @throws {RangeError} When an option is out of range.
   * @throws {ArclaceError} When an element can't be found, the id is taken
   *   or the instance has been destroyed. Nothing is added.
   * @example
   * ```ts
   * const connection = arclace.connect(a, b, { type: 'orthogonal', arrow: 'end' });
   * ```
   */
  connect(
    startElement: ArcElementTargetType,
    endElement: ArcElementTargetType,
    options: ArcConnectionOptionsType = {}
  ): Connection {
    const connection = this.#add(
      this.#prepare(startElement, endElement, options, 'options')
    );

    this.update();

    return connection;
  }

  /**
   * Connects many pairs of elements and draws them in one go. Every
   * definition is checked first, so either all of them are added or none.
   *
   * @throws {TypeError} When `definitions` isn't an array, or an element or
   *   an option has the wrong type.
   * @throws {RangeError} When an option is out of range.
   * @throws {ArclaceError} When an element can't be found, an id is taken or
   *   repeated, or the instance has been destroyed.
   * @example
   * ```ts
   * arclace.connectAll([
   *   { startElement: '#a', endElement: '#b' },
   *   { startElement: '#a', endElement: '#c', dashed: true }
   * ]);
   * ```
   */
  connectAll(definitions: ArcConnectionDefinitionType[]): Connection[] {
    if (!Array.isArray(definitions)) {
      throw new TypeError(
        'arclace: connectAll() needs an array of definitions'
      );
    }

    const ids = new Set<string>();
    const prepared = definitions.map((definition, index) => {
      const name = `definitions[${index}]`;

      assertObject(definition, name);

      const { startElement, endElement, ...options } = definition;
      const connection = this.#prepare(startElement, endElement, options, name);

      if (ids.has(connection.id)) {
        throw new ArclaceError(
          `${name}.id "${connection.id}" is used more than once`
        );
      }

      ids.add(connection.id);

      return connection;
    });
    const connections = prepared.map((connection) => this.#add(connection));

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
   * Returns every connection that starts or ends at an element. A selector
   * that matches nothing returns an empty array.
   *
   * @throws {TypeError} When the target is neither an element nor a string.
   * @throws {ArclaceError} When the selector is invalid.
   */
  find(target: ArcElementTargetType): Connection[] {
    const el =
      typeof target === 'string'
        ? querySelector(target)
        : resolveElement(target);

    if (!el) return [];

    return this.connections.filter(
      (connection) =>
        connection.startElement === el || connection.endElement === el
    );
  }

  /**
   * Removes connections.
   *
   * @param target - A connection, a connection id, or an element (or
   *   selector) whose connections should all be removed. Targets that match
   *   nothing, and `null` or `undefined`, are ignored.
   * @throws {TypeError} When the target is another kind of value.
   * @throws {ArclaceError} When a string is neither an id nor a valid
   *   selector.
   * @example
   * ```ts
   * arclace.disconnect(connection);
   * arclace.disconnect('my-connection-id');
   * arclace.disconnect(document.querySelector('#a'));
   * ```
   */
  disconnect(target: Connection | string | Element): void {
    let removed: Connection[];

    if (target === null || target === undefined) return;

    if (target instanceof Connection) {
      removed = [target];
    } else if (typeof target === 'string' && this.#connections.has(target)) {
      removed = [this.#connections.get(target)!];
    } else if (typeof target === 'string' || target instanceof Element) {
      removed = this.find(target);
    } else {
      throw new TypeError(
        'arclace: disconnect() needs a connection, an id, an element or a selector'
      );
    }

    for (const connection of removed) {
      if (this.#connections.get(connection.id) !== connection) continue;

      this.#connections.delete(connection.id);
      connection._dispose();
      this.#unobserve(connection.startElement);
      this.#unobserve(connection.endElement);
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
    const items: ArcLayoutItemType[] = [];
    const slots = new Map<Element, Record<ArcSideType, ArcSlotEntryType[]>>();
    const addToSlot = (
      el: Element,
      side: ArcSideType,
      otherRect: ArcRectInterface
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
      const { startElement, endElement } = connection;

      if (!isRendered(startElement) || !isRendered(endElement)) {
        connection._hide();
        continue;
      }

      const { spread, startSide, endSide } = connection.options;
      const startRect = getLocalRect(startElement, origin);
      const endRect = getLocalRect(endElement, origin);
      const sides = resolveSides(startRect, endRect, startSide, endSide);
      const solo = { index: 0, count: 1 };

      items.push({
        connection,
        startRect,
        endRect,
        ...sides,
        startSlot: spread
          ? addToSlot(startElement, sides.startSide, endRect)
          : solo,
        endSlot: spread
          ? addToSlot(endElement, sides.endSide, startRect)
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
      const { connection, startRect, endRect, startSide, endSide } = item;
      const { spacing, gap } = connection.options;

      connection._draw(
        getAnchorPoint(startRect, startSide, {
          ...item.startSlot,
          spacing,
          gap
        }),
        startSide,
        getAnchorPoint(endRect, endSide, { ...item.endSlot, spacing, gap }),
        endSide
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

  /**
   * Checks a connection without adding anything, so a bad option can't leave
   * a connection behind that breaks every later update.
   */
  #prepare(
    startTarget: unknown,
    endTarget: unknown,
    options: unknown,
    name: string
  ): ArcPreparedConnectionType {
    if (this.#destroyed) {
      throw new ArclaceError('this instance has been destroyed');
    }

    validateConnectionOptions(options, name);

    const startElement = resolveElement(startTarget, 'startElement');
    const endElement = resolveElement(endTarget, 'endElement');
    const valid = options as ArcConnectionOptionsType;
    const id = valid.id ?? `arc-${uniqueID()}`;

    if (this.#connections.has(id)) {
      throw new ArclaceError(`a connection with id "${id}" exists`);
    }

    return { id, startElement, endElement, options: valid };
  }

  #add({
    id,
    startElement,
    endElement,
    options
  }: ArcPreparedConnectionType): Connection {
    const connection = Connection._create({
      id,
      startElement,
      endElement,
      options,
      defaults: this.#options.defaults,
      owner: this
    });

    this.#connections.set(id, connection);
    this.svg.appendChild(connection.element);
    this.#resizeObserver?.observe(startElement);
    this.#resizeObserver?.observe(endElement);

    return connection;
  }

  #unobserve(el: Element): void {
    if (!this.#resizeObserver || el === this.container) return;

    const inUse = this.connections.some(
      (connection) =>
        connection.startElement === el || connection.endElement === el
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
 * Creates a {@link Arclace} instance and connects the given pairs.
 *
 * @example
 * ```ts
 * import { createConnections } from '@phun-ky/arclace';
 *
 * const arclace = createConnections(
 *   [
 *     { startElement: '#a', endElement: '#b' },
 *     { startElement: '#b', endElement: '#c', arrow: 'end' }
 *   ],
 *   { defaults: { type: 'orthogonal' } }
 * );
 * ```
 */
export const createConnections = (
  definitions: ArcConnectionDefinitionType[],
  options?: ArcOptionsType
): Arclace => {
  const arclace = new Arclace(options);

  try {
    arclace.connectAll(definitions);
  } catch (error) {
    // Don't leave an overlay and its listeners behind
    arclace.destroy();
    throw error;
  }

  return arclace;
};
