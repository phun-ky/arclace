import type { Arclace } from './Arclace';
import { ArclaceError } from './errors';
import type {
  ArcConnectionOptionsType,
  ArcGeometryType,
  ArcPointInterface,
  ArcSideType
} from './types';
import { add, center, distance, NORMALS } from './utils/geometry';
import { uniqueID } from './utils/id';
import { type ArcOriginType, getLocalRect, isRendered } from './utils/measure';
import {
  bezierPath,
  bezierPathVia,
  type ArcPathResultType,
  orthogonalPath,
  orthogonalPathVia,
  polylinePath,
  straightPath
} from './utils/paths';
import { resolveWaypoints } from './utils/resolve-element';
import { createSVGElement, setAttributes } from './utils/svg';
import { dashNumbers, validateConnectionOptions } from './utils/validate';

/**
 * Connection options with every default filled in. `label`, `color`,
 * `gradient`, `dashArray`, `via`, `startCurvature`, `endCurvature` and
 * `className` have no default.
 */
export type ArcResolvedConnectionOptionsType = Required<
  Omit<
    ArcConnectionOptionsType,
    | 'id'
    | 'label'
    | 'color'
    | 'gradient'
    | 'dashArray'
    | 'via'
    | 'startCurvature'
    | 'endCurvature'
    | 'className'
  >
> &
  Pick<
    ArcConnectionOptionsType,
    | 'label'
    | 'color'
    | 'gradient'
    | 'dashArray'
    | 'via'
    | 'startCurvature'
    | 'endCurvature'
    | 'className'
  > & {
    id: string;
  };

/**
 * Options every connection falls back to. Frozen: set your own defaults with
 * the `defaults` option of {@link Arclace} instead.
 */
export const DEFAULT_CONNECTION_OPTIONS: Readonly<
  Required<
    Omit<
      ArcConnectionOptionsType,
      | 'id'
      | 'label'
      | 'color'
      | 'gradient'
      | 'dashArray'
      | 'via'
      | 'startCurvature'
      | 'endCurvature'
      | 'className'
    >
  >
> = Object.freeze({
  type: 'bezier',
  startSide: 'auto',
  endSide: 'auto',
  arrow: 'none',
  strokeWidth: 2,
  dashed: false,
  animated: false,
  glow: false,
  anchors: false,
  gap: 0,
  spread: true,
  spacing: 16,
  curvature: 1,
  radius: 8,
  offset: 20
});

/**
 * Drops options set to `undefined`, so they fall back to the defaults instead
 * of replacing them.
 */
const definedOnly = (
  options: ArcConnectionOptionsType
): ArcConnectionOptionsType =>
  Object.fromEntries(
    Object.entries(options).filter(([, value]) => value !== undefined)
  );
// Arrow length in multiples of the stroke width
const ARROW_SIZE = 4;

type ArcConnectionParamsType = {
  id: string;
  startElement: Element;
  endElement: Element;
  options: ArcConnectionOptionsType;
  defaults?: ArcConnectionOptionsType;
  owner: Arclace;
};

/**
 * A line between two elements. Created with {@link Arclace.connect} or
 * {@link Arclace.connectAll}, not with `new`.
 *
 * Each connection renders as:
 *
 * ```html
 * <g class="arc-connection arc-bezier">
 *   <marker class="arc-marker">…</marker>  <!-- when `arrow` is set -->
 *   <linearGradient class="arc-gradient">…</linearGradient>  <!-- when `gradient` is set -->
 *   <path class="arc-path" />
 *   <rect class="arc-label-bg" />          <!-- when `label` is set -->
 *   <text class="arc-label">…</text>
 *   <circle class="arc-anchor arc-anchor-start" />  <!-- when `anchors` is set -->
 *   <circle class="arc-anchor arc-anchor-end" />
 * </g>
 * ```
 *
 * The line, arrows and anchors use `currentColor`, so setting `color` on
 * `.arc-connection` colors all of them.
 */
export class Connection {
  readonly id: string;
  readonly startElement: Element;
  readonly endElement: Element;

  /**
   * The `<g>` element holding everything this connection draws.
   */
  readonly element: SVGGElement;

  /**
   * The `<path>` element of the line.
   */
  readonly path: SVGPathElement;

  #geometry: ArcGeometryType | null = null;
  #removed = false;
  #owner: Arclace;
  #options: ArcConnectionOptionsType;
  #defaults: ArcConnectionOptionsType;
  #marker: SVGMarkerElement | null = null;
  // A second arrow, only for a gradient line with arrows at both ends
  #endMarker: SVGMarkerElement | null = null;
  #gradient: SVGLinearGradientElement | null = null;
  #label: SVGTextElement | null = null;
  #labelBg: SVGRectElement | null = null;
  // The background's box relative to the label's anchor point, measured once
  // per label
  #labelBox: { x: number; y: number; width: number; height: number } | null =
    null;
  #anchors: [SVGCircleElement, SVGCircleElement] | null = null;
  // The waypoints, with selectors resolved to elements
  #via: (Element | ArcPointInterface)[] = [];

  private constructor(params: ArcConnectionParamsType) {
    const {
      id,
      startElement,
      endElement,
      options,
      defaults = {},
      owner
    } = params;

    this.id = id;
    this.startElement = startElement;
    this.endElement = endElement;
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
   * Creates a connection for its owner. Options must already be validated.
   *
   * @internal
   */
  static _create(params: ArcConnectionParamsType): Connection {
    return new Connection(params);
  }

  /**
   * The geometry from the last update, or `null` when the connection is
   * hidden because one of its elements is not rendered.
   */
  get geometry(): Readonly<ArcGeometryType> | null {
    return this.#geometry;
  }

  /**
   * The connection's options merged with the instance defaults.
   */
  get options(): Readonly<ArcResolvedConnectionOptionsType> {
    return {
      ...DEFAULT_CONNECTION_OPTIONS,
      ...definedOnly(this.#defaults),
      ...definedOnly(this.#options),
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
   * @throws {TypeError} When an option has the wrong type, or `id` is set.
   * @throws {RangeError} When an option is out of range.
   * @throws {ArclaceError} When the connection has been removed.
   */
  setOptions(options: Omit<ArcConnectionOptionsType, 'id'>): this {
    if (this.#removed) {
      throw new ArclaceError(`connection "${this.id}" has been removed`);
    }

    validateConnectionOptions(options);

    if ((options as ArcConnectionOptionsType).id !== undefined) {
      throw new TypeError('arclace: setOptions() cannot change the id');
    }

    // Looked up first, so a selector that fails leaves the options as they were
    if (options.via) resolveWaypoints(options.via, 'options.via');

    this.#options = { ...this.#options, ...options };
    this.#applyOptions();

    if (options.via) this.#owner._observe(this);

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
   * The elements this connection depends on: its ends and the elements it
   * passes through.
   *
   * @internal
   */
  _elements(): Element[] {
    return [
      this.startElement,
      this.endElement,
      ...this.#via.filter((waypoint) => waypoint instanceof Element)
    ];
  }

  /**
   * Measures the points the line passes through, or returns `null` when one
   * of the elements is not rendered.
   *
   * @internal
   */
  _waypoints(origin: ArcOriginType): ArcPointInterface[] | null {
    const points: ArcPointInterface[] = [];

    for (const waypoint of this.#via) {
      if (!(waypoint instanceof Element)) {
        points.push({ x: waypoint.x, y: waypoint.y });
      } else if (isRendered(waypoint)) {
        points.push(center(getLocalRect(waypoint, origin)));
      } else {
        return null;
      }
    }

    return points;
  }

  /**
   * Draws the connection between two attachment points, through the
   * waypoints.
   *
   * @internal
   */
  _draw(
    start: ArcPointInterface,
    startSide: ArcSideType,
    end: ArcPointInterface,
    endSide: ArcSideType,
    via: ArcPointInterface[] = []
  ): void {
    const { arrow, strokeWidth } = this.options;
    const arrowLength = ARROW_SIZE * strokeWidth;
    // Shorten the line so arrow tips, not the line's end caps, touch the
    // elements
    const pathStart =
      arrow === 'start' || arrow === 'both'
        ? this.#pullBack(start, startSide, via[0] ?? end, arrowLength)
        : start;
    const pathEnd =
      arrow === 'end' || arrow === 'both'
        ? this.#pullBack(
            end,
            endSide,
            via[via.length - 1] ?? start,
            arrowLength
          )
        : end;
    const { d, labelPoint } = this.#buildPath(
      pathStart,
      startSide,
      pathEnd,
      endSide,
      via
    );

    this.#geometry = Object.freeze({
      start,
      end,
      startSide,
      endSide,
      labelPoint,
      d
    });

    this.element.removeAttribute('display');
    setAttributes(this.element, {
      'data-start-side': startSide,
      'data-end-side': endSide
    });
    this.path.setAttribute('d', d);

    if (this.#gradient) {
      setAttributes(this.#gradient, {
        x1: start.x,
        y1: start.y,
        x2: end.x,
        y2: end.y
      });
    }

    if (this.#label) this.#placeLabel(labelPoint);

    if (this.#anchors) {
      setAttributes(this.#anchors[0], { cx: start.x, cy: start.y });
      setAttributes(this.#anchors[1], { cx: end.x, cy: end.y });
    }
  }

  /**
   * Hides the connection.
   *
   * @internal
   */
  _hide(): void {
    this.#geometry = null;
    this.element.setAttribute('display', 'none');
  }

  /**
   * Removes the connection's elements from the overlay.
   *
   * @internal
   */
  _dispose(): void {
    this.#removed = true;
    this.element.remove();
  }

  #buildPath(
    start: ArcPointInterface,
    startSide: ArcSideType,
    end: ArcPointInterface,
    endSide: ArcSideType,
    via: ArcPointInterface[]
  ): ArcPathResultType {
    const {
      type,
      curvature,
      startCurvature = curvature,
      endCurvature = curvature,
      radius,
      offset
    } = this.options;

    if (type === 'straight') {
      return via.length > 0
        ? polylinePath([start, ...via, end])
        : straightPath(start, end);
    }

    if (type === 'orthogonal') {
      return via.length > 0
        ? orthogonalPathVia(start, startSide, end, endSide, via, {
            radius,
            offset
          })
        : orthogonalPath(start, startSide, end, endSide, { radius, offset });
    }

    if (via.length > 0) {
      return bezierPathVia(
        start,
        startSide,
        end,
        endSide,
        via,
        startCurvature,
        endCurvature
      );
    }

    return bezierPath(
      start,
      startSide,
      end,
      endSide,
      startCurvature,
      endCurvature
    );
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
      gradient,
      strokeWidth,
      dashed,
      dashArray,
      animated,
      glow,
      anchors,
      via,
      className
    } = this.options;
    const numbers = dashArray ? dashNumbers(dashArray) : undefined;
    const dash = numbers?.join(' ');
    // SVG repeats a pattern with an odd count of numbers to make it even
    const period =
      numbers &&
      numbers.reduce((sum, number) => sum + number, 0) *
        (numbers.length % 2 ? 2 : 1);
    const classes = ['arc-connection', `arc-${type}`];

    this.#via = resolveWaypoints(via ?? [], 'options.via');

    if (dashed || animated) classes.push('arc-dashed');

    if (animated) classes.push('arc-animated');

    if (glow) classes.push('arc-glow');

    if (className) classes.push(...className.split(/\s+/).filter(Boolean));

    setAttributes(this.element, {
      class: classes.join(' '),
      'data-type': type
    });
    // Inline so it wins over the stylesheet's --arc-color
    this.element.style.color = color ?? '';

    setAttributes(this.path, {
      'stroke-width': strokeWidth,
      'stroke-dasharray': dashed || animated ? (dash ?? '6 6') : null
    });

    // Inline so they win over the page's CSS. The period is how far the
    // animation moves the dashes, so they loop without a jump.
    if (dash) {
      this.element.style.setProperty('--arc-dash', dash);
      this.element.style.setProperty('--arc-dash-period', String(period));
    } else {
      this.element.style.removeProperty('--arc-dash');
      this.element.style.removeProperty('--arc-dash-period');
    }

    if (typeof glow === 'number' && glow > 0) {
      this.element.style.setProperty('--arc-glow', `${glow}px`);
    } else {
      this.element.style.removeProperty('--arc-glow');
    }

    this.#applyGradient(gradient);
    this.#applyArrow(arrow, gradient);
    this.#applyLabel(label);
    this.#applyAnchors(anchors, strokeWidth, gradient);
  }

  #applyGradient(gradient: string[] | undefined): void {
    if (!gradient) {
      this.#gradient?.remove();
      this.#gradient = null;
      this.path.setAttribute('stroke', 'currentColor');

      return;
    }

    if (!this.#gradient) {
      // In user space, because objectBoundingBox units span the path's
      // bounding box, which has no height or width on a horizontal or
      // vertical line. _draw sets the ends.
      this.#gradient = createSVGElement('linearGradient', {
        id: `arc-gradient-${uniqueID()}`,
        class: 'arc-gradient',
        gradientUnits: 'userSpaceOnUse'
      });
      this.element.insertBefore(this.#gradient, this.path);
    }

    this.#gradient.replaceChildren(
      ...gradient.map((color, index) =>
        createSVGElement('stop', {
          offset: index / (gradient.length - 1),
          'stop-color': color
        })
      )
    );
    this.path.setAttribute('stroke', `url(#${this.#gradient.id})`);
  }

  #createMarker(): SVGMarkerElement {
    // The marker lives inside the connection's group so it inherits the
    // group's color
    const marker = createSVGElement('marker', {
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

    marker.appendChild(
      createSVGElement('path', {
        d: 'M 0 0 L 10 5 L 0 10 z',
        fill: 'currentColor'
      })
    );
    this.element.insertBefore(marker, this.path);

    return marker;
  }

  #applyArrow(
    arrow: ArcResolvedConnectionOptionsType['arrow'],
    gradient: string[] | undefined
  ): void {
    if (arrow === 'none') {
      this.#marker?.remove();
      this.#endMarker?.remove();
      this.#marker = null;
      this.#endMarker = null;
      setAttributes(this.path, { 'marker-start': null, 'marker-end': null });

      return;
    }

    this.#marker ??= this.#createMarker();

    // One marker can't take two colors, so a gradient line with arrows at
    // both ends gets a marker for each
    if (gradient && arrow === 'both') {
      this.#endMarker ??= this.#createMarker();
      this.#endMarker.style.color = gradient[gradient.length - 1];
    } else {
      this.#endMarker?.remove();
      this.#endMarker = null;
    }

    // Each arrow takes the gradient's color at its end
    this.#marker.style.color = gradient
      ? gradient[arrow === 'end' ? gradient.length - 1 : 0]
      : '';

    const url = (marker: SVGMarkerElement): string => `url(#${marker.id})`;

    setAttributes(this.path, {
      'marker-start':
        arrow === 'start' || arrow === 'both' ? url(this.#marker) : null,
      'marker-end':
        arrow === 'end' || arrow === 'both'
          ? url(this.#endMarker ?? this.#marker)
          : null
    });
  }

  #placeLabel(point: ArcPointInterface): void {
    setAttributes(this.#label!, { ...point });

    // shortcut: measured once per label change, so a font or padding change
    // from CSS alone needs a setOptions() call to resize the background
    // getBBox is missing where there is no layout, such as jsdom
    if (!this.#labelBox?.width && typeof this.#label!.getBBox === 'function') {
      const { x, y, width, height } = this.#label!.getBBox();
      // CSS padding doesn't apply to SVG, but its computed value is in px,
      // so the stylesheet sets it on the background and it is read here
      const style = getComputedStyle(this.#labelBg!);
      const [top, right, bottom, left] = [
        style.paddingTop,
        style.paddingRight,
        style.paddingBottom,
        style.paddingLeft
      ].map((value) => parseFloat(value) || 0);

      this.#labelBox = {
        x: x - point.x - left,
        y: y - point.y - top,
        width: width + left + right,
        height: height + top + bottom
      };
    }

    if (!this.#labelBox) return;

    setAttributes(this.#labelBg!, {
      x: point.x + this.#labelBox.x,
      y: point.y + this.#labelBox.y,
      width: this.#labelBox.width,
      height: this.#labelBox.height
    });
  }

  #applyLabel(label: string | undefined): void {
    this.#labelBox = null;

    if (!label) {
      this.#label?.remove();
      this.#labelBg?.remove();
      this.#label = null;
      this.#labelBg = null;

      return;
    }

    if (!this.#label) {
      this.#label = createSVGElement('text', {
        class: 'arc-label',
        fill: 'currentColor',
        'text-anchor': 'middle',
        'dominant-baseline': 'central'
      });
      // Invisible without the stylesheet, which fills it
      this.#labelBg = createSVGElement('rect', {
        class: 'arc-label-bg',
        fill: 'none',
        rx: 4
      });
      this.path.after(this.#labelBg, this.#label);
    }

    this.#label.textContent = label;

    if (this.#geometry) this.#placeLabel(this.#geometry.labelPoint);
  }

  #applyAnchors(
    anchors: boolean,
    strokeWidth: number,
    gradient: string[] | undefined
  ): void {
    if (!anchors) {
      this.#anchors?.forEach((anchor) => anchor.remove());
      this.#anchors = null;

      return;
    }

    if (!this.#anchors) {
      this.#anchors = [
        createSVGElement('circle', { class: 'arc-anchor arc-anchor-start' }),
        createSVGElement('circle', { class: 'arc-anchor arc-anchor-end' })
      ];
      this.element.append(...this.#anchors);
    }

    this.#anchors.forEach((anchor, index) => {
      setAttributes(anchor, { r: strokeWidth + 2, fill: 'currentColor' });
      // Each anchor takes the gradient's color at its end
      anchor.style.color = gradient
        ? gradient[index === 0 ? 0 : gradient.length - 1]
        : '';
    });
  }
}
