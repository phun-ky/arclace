import type { Arclace } from './Arclace';
import type {
  ArcConnectionOptionsType,
  ArcGeometryType,
  ArcPointInterface,
  ArcSideType
} from './types';
import { add, distance, NORMALS } from './utils/geometry';
import { uniqueID } from './utils/id';
import {
  bezierPath,
  type ArcPathResultType,
  orthogonalPath,
  straightPath
} from './utils/paths';
import { createSVGElement, setAttributes } from './utils/svg';

/**
 * Connection options that have no default.
 */
export type ArcOptionalKeysType = 'id' | 'label' | 'color' | 'className';

/**
 * Connection options with every default filled in.
 */
export type ArcResolvedConnectionOptionsType = Required<
  Omit<ArcConnectionOptionsType, ArcOptionalKeysType>
> &
  Pick<ArcConnectionOptionsType, ArcOptionalKeysType> & { id: string };

/**
 * Options every connection falls back to.
 */
export const DEFAULT_CONNECTION_OPTIONS: Required<
  Omit<ArcConnectionOptionsType, ArcOptionalKeysType>
> = {
  type: 'bezier',
  startSide: 'auto',
  stopSide: 'auto',
  arrow: 'none',
  strokeWidth: 2,
  dashed: false,
  animated: false,
  anchors: false,
  gap: 0,
  spread: true,
  spacing: 16,
  curvature: 1,
  radius: 8,
  offset: 20
};

// Arrow length in multiples of the stroke width
const ARROW_SIZE = 4;

export type ArcConnectionParamsType = {
  id: string;
  startElement: Element;
  stopElement: Element;
  options: ArcConnectionOptionsType;
  defaults?: ArcConnectionOptionsType;
  owner: Arclace;
};

/**
 * A line between two elements. Created with {@link Arclace.connect}.
 *
 * Each connection renders as:
 *
 * ```html
 * <g class="arc-connection arc-bezier">
 *   <marker class="arc-marker">…</marker>  <!-- when `arrow` is set -->
 *   <path class="arc-path" />
 *   <text class="arc-label">…</text>       <!-- when `label` is set -->
 *   <circle class="arc-anchor arc-anchor-start" />  <!-- when `anchors` is set -->
 *   <circle class="arc-anchor arc-anchor-stop" />
 * </g>
 * ```
 *
 * The line, arrows and anchors use `currentColor`, so setting `color` on
 * `.arc-connection` colors all of them.
 */
export class Connection {
  readonly id: string;
  readonly startElement: Element;
  readonly stopElement: Element;

  /**
   * The `<g>` element holding everything this connection draws.
   */
  readonly element: SVGGElement;

  /**
   * The `<path>` element of the line.
   */
  readonly path: SVGPathElement;

  /**
   * The geometry from the last update, or `null` when the connection is
   * hidden because one of its elements is not rendered.
   */
  geometry: ArcGeometryType | null = null;

  #owner: Arclace;
  #options: ArcConnectionOptionsType;
  #defaults: ArcConnectionOptionsType;
  #marker: SVGMarkerElement | null = null;
  #label: SVGTextElement | null = null;
  #anchors: [SVGCircleElement, SVGCircleElement] | null = null;

  constructor(params: ArcConnectionParamsType) {
    const {
      id,
      startElement,
      stopElement,
      options,
      defaults = {},
      owner
    } = params;

    this.id = id;
    this.startElement = startElement;
    this.stopElement = stopElement;
    this.#owner = owner;
    this.#options = { ...options };
    this.#defaults = defaults;
    this.element = createSVGElement('g', { 'data-arc-id': id });
    this.path = createSVGElement('path', {
      class: 'arc-path',
      fill: 'none',
      stroke: 'currentColor'
    });
    this.element.appendChild(this.path);
    this.#applyOptions();
  }

  /**
   * The connection's options merged with the instance defaults.
   */
  get options(): Readonly<ArcResolvedConnectionOptionsType> {
    return {
      ...DEFAULT_CONNECTION_OPTIONS,
      ...this.#defaults,
      ...this.#options,
      id: this.id
    };
  }

  /**
   * Changes options and redraws.
   *
   * @example
   * ```ts
   * connection.setOptions({ type: 'orthogonal', arrow: 'end' });
   * ```
   */
  setOptions(options: Omit<ArcConnectionOptionsType, 'id'>): this {
    this.#options = { ...this.#options, ...options };
    this.#applyOptions();
    this.#owner.update();

    return this;
  }

  /**
   * Redraws every connection of the owning instance.
   */
  update(): void {
    this.#owner.update();
  }

  /**
   * Removes this connection.
   */
  remove(): void {
    this.#owner.disconnect(this);
  }

  /**
   * Draws the connection between two attachment points.
   *
   * @internal
   */
  _draw(
    start: ArcPointInterface,
    startSide: ArcSideType,
    stop: ArcPointInterface,
    stopSide: ArcSideType
  ): void {
    const { arrow, strokeWidth } = this.options;
    const arrowLength = ARROW_SIZE * strokeWidth;
    // Shorten the line so arrow tips, not the line's end caps, touch the
    // elements
    const pathStart =
      arrow === 'start' || arrow === 'both'
        ? this.#pullBack(start, startSide, stop, arrowLength)
        : start;
    const pathStop =
      arrow === 'end' || arrow === 'both'
        ? this.#pullBack(stop, stopSide, start, arrowLength)
        : stop;
    const { d, labelPoint } = this.#buildPath(
      pathStart,
      startSide,
      pathStop,
      stopSide
    );

    this.geometry = { start, stop, startSide, stopSide, labelPoint, d };

    this.element.removeAttribute('display');
    setAttributes(this.element, {
      'data-start-side': startSide,
      'data-stop-side': stopSide
    });
    this.path.setAttribute('d', d);

    if (this.#label) setAttributes(this.#label, { ...labelPoint });

    if (this.#anchors) {
      setAttributes(this.#anchors[0], { cx: start.x, cy: start.y });
      setAttributes(this.#anchors[1], { cx: stop.x, cy: stop.y });
    }
  }

  /**
   * Hides the connection.
   *
   * @internal
   */
  _hide(): void {
    this.geometry = null;
    this.element.setAttribute('display', 'none');
  }

  /**
   * Removes the connection's elements from the overlay.
   *
   * @internal
   */
  _dispose(): void {
    this.element.remove();
  }

  #buildPath(
    start: ArcPointInterface,
    startSide: ArcSideType,
    stop: ArcPointInterface,
    stopSide: ArcSideType
  ): ArcPathResultType {
    const { type, curvature, radius, offset } = this.options;

    if (type === 'straight') return straightPath(start, stop);

    if (type === 'orthogonal') {
      return orthogonalPath(start, startSide, stop, stopSide, {
        radius,
        offset
      });
    }

    return bezierPath(start, startSide, stop, stopSide, curvature);
  }

  #pullBack(
    point: ArcPointInterface,
    side: ArcSideType,
    other: ArcPointInterface,
    length: number
  ): ArcPointInterface {
    const total = distance(point, other);
    const amount = Math.min(length, total / 3);

    if (this.options.type !== 'straight') {
      return add(point, NORMALS[side], amount);
    }

    if (total === 0) return point;

    return {
      x: point.x + ((other.x - point.x) / total) * amount,
      y: point.y + ((other.y - point.y) / total) * amount
    };
  }

  #applyOptions(): void {
    const {
      type,
      arrow,
      label,
      color,
      strokeWidth,
      dashed,
      animated,
      anchors,
      className
    } = this.options;
    const classes = ['arc-connection', `arc-${type}`];

    if (dashed || animated) classes.push('arc-dashed');

    if (animated) classes.push('arc-animated');

    if (className) classes.push(...className.split(/\s+/).filter(Boolean));

    setAttributes(this.element, {
      class: classes.join(' '),
      'data-type': type
    });
    // Inline so it wins over the stylesheet's --arc-color
    this.element.style.color = color ?? '';

    setAttributes(this.path, {
      'stroke-width': strokeWidth,
      'stroke-dasharray': dashed || animated ? '6 6' : null
    });

    this.#applyArrow(arrow);
    this.#applyLabel(label);
    this.#applyAnchors(anchors, strokeWidth);
  }

  #applyArrow(arrow: ArcResolvedConnectionOptionsType['arrow']): void {
    if (arrow === 'none') {
      this.#marker?.remove();
      this.#marker = null;
      setAttributes(this.path, { 'marker-start': null, 'marker-end': null });

      return;
    }

    if (!this.#marker) {
      // The marker lives inside the connection's group so it inherits the
      // group's color
      this.#marker = createSVGElement('marker', {
        id: `arc-arrow-${uniqueID()}`,
        class: 'arc-marker',
        viewBox: '0 0 10 10',
        refX: 0,
        refY: 5,
        markerWidth: ARROW_SIZE,
        markerHeight: ARROW_SIZE,
        markerUnits: 'strokeWidth',
        orient: 'auto-start-reverse'
      });
      this.#marker.appendChild(
        createSVGElement('path', {
          d: 'M 0 0 L 10 5 L 0 10 z',
          fill: 'currentColor'
        })
      );
      this.element.insertBefore(this.#marker, this.path);
    }

    const url = `url(#${this.#marker.id})`;

    setAttributes(this.path, {
      'marker-start': arrow === 'start' || arrow === 'both' ? url : null,
      'marker-end': arrow === 'end' || arrow === 'both' ? url : null
    });
  }

  #applyLabel(label: string | undefined): void {
    if (!label) {
      this.#label?.remove();
      this.#label = null;

      return;
    }

    if (!this.#label) {
      this.#label = createSVGElement('text', {
        class: 'arc-label',
        fill: 'currentColor',
        'text-anchor': 'middle',
        'dominant-baseline': 'central'
      });
      this.path.after(this.#label);

      if (this.geometry)
        setAttributes(this.#label, { ...this.geometry.labelPoint });
    }

    this.#label.textContent = label;
  }

  #applyAnchors(anchors: boolean, strokeWidth: number): void {
    if (!anchors) {
      this.#anchors?.forEach((anchor) => anchor.remove());
      this.#anchors = null;

      return;
    }

    if (!this.#anchors) {
      this.#anchors = [
        createSVGElement('circle', { class: 'arc-anchor arc-anchor-start' }),
        createSVGElement('circle', { class: 'arc-anchor arc-anchor-stop' })
      ];
      this.element.append(...this.#anchors);
    }

    this.#anchors.forEach((anchor) =>
      setAttributes(anchor, { r: strokeWidth + 2, fill: 'currentColor' })
    );
  }
}
