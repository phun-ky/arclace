import type {
  CTTPointInterface,
  CTTRectInterface,
  CTTSideType
} from '../types';

/**
 * Unit vectors pointing away from each side of a box.
 */
export const NORMALS: Record<CTTSideType, CTTPointInterface> = {
  top: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 }
};

export const OPPOSITE: Record<CTTSideType, CTTSideType> = {
  top: 'bottom',
  right: 'left',
  bottom: 'top',
  left: 'right'
};

export const isHorizontalSide = (side: CTTSideType): boolean =>
  side === 'left' || side === 'right';

export const center = (rect: CTTRectInterface): CTTPointInterface => ({
  x: rect.left + rect.width / 2,
  y: rect.top + rect.height / 2
});

export const add = (
  a: CTTPointInterface,
  b: CTTPointInterface,
  factor = 1
): CTTPointInterface => ({ x: a.x + b.x * factor, y: a.y + b.y * factor });

/**
 * Euclidean distance between two points.
 *
 * @example
 * ```ts
 * distance({ x: 0, y: 0 }, { x: 3, y: 4 }); // 5
 * ```
 */
export const distance = (a: CTTPointInterface, b: CTTPointInterface): number =>
  Math.hypot(b.x - a.x, b.y - a.y);

/**
 * Rounds to two decimals to keep path data short.
 */
export const round = (value: number): number => Math.round(value * 100) / 100;

/**
 * Formats a point for use in SVG path data.
 */
export const fmt = (point: CTTPointInterface): string =>
  `${round(point.x)} ${round(point.y)}`;
