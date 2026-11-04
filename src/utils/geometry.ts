import type {
  ArcPointInterface,
  ArcRectInterface,
  ArcSideType
} from '../types';

/**
 * Unit vectors pointing away from each side of a box.
 */
export const NORMALS: Record<ArcSideType, ArcPointInterface> = {
  top: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 }
};

export const OPPOSITE: Record<ArcSideType, ArcSideType> = {
  top: 'bottom',
  right: 'left',
  bottom: 'top',
  left: 'right'
};

export const isHorizontalSide = (side: ArcSideType): boolean =>
  side === 'left' || side === 'right';

export const center = (rect: ArcRectInterface): ArcPointInterface => ({
  x: rect.left + rect.width / 2,
  y: rect.top + rect.height / 2
});

export const add = (
  a: ArcPointInterface,
  b: ArcPointInterface,
  factor = 1
): ArcPointInterface => ({ x: a.x + b.x * factor, y: a.y + b.y * factor });

/**
 * Euclidean distance between two points.
 *
 * @example
 * ```ts
 * distance({ x: 0, y: 0 }, { x: 3, y: 4 }); // 5
 * ```
 */
export const distance = (a: ArcPointInterface, b: ArcPointInterface): number =>
  Math.hypot(b.x - a.x, b.y - a.y);

/**
 * Rounds to two decimals to keep path data short.
 */
export const round = (value: number): number => Math.round(value * 100) / 100;

/**
 * Formats a point for use in SVG path data.
 */
export const fmt = (point: ArcPointInterface): string =>
  `${round(point.x)} ${round(point.y)}`;
