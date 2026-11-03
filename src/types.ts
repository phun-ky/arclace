/**
 * A side of an element's bounding box.
 */
export type CTTSideType = 'top' | 'right' | 'bottom' | 'left';

/**
 * A side, or `'auto'` to let connect-the-things pick the side that faces the
 * other element.
 */
export type CTTSideOptionType = CTTSideType | 'auto';

/**
 * How the line between two elements is drawn.
 *
 * - `bezier`: a smooth cubic curve (default)
 * - `straight`: a straight line
 * - `orthogonal`: horizontal and vertical segments with rounded corners
 */
export type CTTPathType = 'bezier' | 'straight' | 'orthogonal';

/**
 * Where to draw arrow heads.
 */
export type CTTArrowType = 'none' | 'start' | 'end' | 'both';

/**
 * An element, or a CSS selector that resolves to one.
 */
export type CTTElementTargetType = Element | string;

export interface CTTPointInterface {
  x: number;
  y: number;
}

export interface CTTRectInterface {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

/**
 * Options for a single connection.
 */
export type CTTConnectionOptionsType = {
  /**
   * A unique id for the connection. Generated when omitted.
   */
  id?: string;

  /**
   * How the line is drawn. Defaults to `'bezier'`.
   */
  type?: CTTPathType;

  /**
   * The side of the start element the line leaves from. Defaults to `'auto'`.
   */
  startSide?: CTTSideOptionType;

  /**
   * The side of the stop element the line arrives at. Defaults to `'auto'`.
   */
  stopSide?: CTTSideOptionType;

  /**
   * Where to draw arrow heads. Defaults to `'none'`.
   */
  arrow?: CTTArrowType;

  /**
   * Text drawn at the middle of the line.
   */
  label?: string;

  /**
   * Line color. Any CSS color. Defaults to `currentColor` of the container,
   * or `--ctt-color` when the stylesheet is loaded.
   */
  color?: string;

  /**
   * Line width in pixels. Defaults to `2`.
   */
  strokeWidth?: number;

  /**
   * Draw a dashed line. Defaults to `false`.
   */
  dashed?: boolean;

  /**
   * Animate the dashes from start to stop. Implies `dashed`. Requires the
   * stylesheet. Defaults to `false`.
   */
  animated?: boolean;

  /**
   * Draw a dot where the line touches each element. Defaults to `false`.
   */
  anchors?: boolean;

  /**
   * Extra class names added to the connection's `<g>` element.
   */
  className?: string;

  /**
   * Distance in pixels between the element's edge and the line's end.
   * Defaults to `0`.
   */
  gap?: number;

  /**
   * When several connections share the same side of an element, spread their
   * end points along that side instead of stacking them in the middle.
   * Defaults to `true`.
   */
  spread?: boolean;

  /**
   * Preferred distance in pixels between spread end points. Shrinks to fit
   * the side. Defaults to `16`.
   */
  spacing?: number;

  /**
   * `bezier` only: multiplies how far the curve bulges out from the
   * elements. Defaults to `1`.
   */
  curvature?: number;

  /**
   * `orthogonal` only: corner radius in pixels. Use `0` for sharp corners.
   * Defaults to `8`.
   */
  radius?: number;

  /**
   * `orthogonal` only: how far in pixels the line travels straight out of an
   * element before it turns. Defaults to `20`.
   */
  offset?: number;
};

/**
 * A connection between two elements, used with
 * {@link ConnectTheThings.connectAll} and {@link createConnections}.
 */
export type CTTConnectionDefinitionType = CTTConnectionOptionsType & {
  startElement: CTTElementTargetType;
  stopElement: CTTElementTargetType;
};

/**
 * Options for a {@link ConnectTheThings} instance.
 */
export type CTTOptionsType = {
  /**
   * The element the SVG overlay is added to. All connected elements should
   * be inside it. Defaults to `document.body`.
   */
  container?: CTTElementTargetType;

  /**
   * Keep lines in sync with the page.
   *
   * - `true`: redraw on window resize, scroll, element resize and DOM or
   *   style changes inside the container (default)
   * - `'frame'`: redraw on every animation frame, for CSS animations and
   *   transitions
   * - `false`: only redraw when you call `update()`
   */
  autoUpdate?: boolean | 'frame';

  /**
   * Default options for every connection made by this instance.
   */
  defaults?: CTTConnectionOptionsType;

  /**
   * Extra class names added to the SVG overlay.
   */
  className?: string;
};

/**
 * The computed geometry of a connection after the last update.
 */
export type CTTGeometryType = {
  start: CTTPointInterface;
  stop: CTTPointInterface;
  startSide: CTTSideType;
  stopSide: CTTSideType;
  labelPoint: CTTPointInterface;
  d: string;
};
