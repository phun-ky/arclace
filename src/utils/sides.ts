import type {
  ArcPointInterface,
  ArcRectInterface,
  ArcSideOptionType,
  ArcSideType
} from '../types';

import { add, center, NORMALS, OPPOSITE } from './geometry';

/**
 * Picks the side of `from` that faces `to`.
 *
 * Boxes that are further apart horizontally than vertically connect
 * left/right, otherwise top/bottom.
 *
 * @example
 * ```ts
 * facingSide(
 *   { left: 0, top: 0, right: 100, bottom: 50, width: 100, height: 50 },
 *   { left: 300, top: 0, right: 400, bottom: 50, width: 100, height: 50 }
 * ); // 'right'
 * ```
 */
export const facingSide = (
  from: ArcRectInterface,
  to: ArcRectInterface
): ArcSideType => {
  const a = center(from);
  const b = center(to);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  // Positive when the boxes are separated on that axis, negative when they overlap
  const gapX = Math.max(to.left - from.right, from.left - to.right);
  const gapY = Math.max(to.top - from.bottom, from.top - to.bottom);
  const horizontal = gapX === gapY ? Math.abs(dx) >= Math.abs(dy) : gapX > gapY;

  if (horizontal) return dx >= 0 ? 'right' : 'left';

  return dy >= 0 ? 'bottom' : 'top';
};

/**
 * Resolves `'auto'` sides for a connection between two boxes.
 *
 * @example
 * ```ts
 * resolveSides(startRect, stopRect, 'auto', 'auto');
 * // { startSide: 'right', stopSide: 'left' }
 * ```
 */
export const resolveSides = (
  startRect: ArcRectInterface,
  stopRect: ArcRectInterface,
  startSide: ArcSideOptionType = 'auto',
  stopSide: ArcSideOptionType = 'auto'
): { startSide: ArcSideType; stopSide: ArcSideType } => ({
  startSide: startSide === 'auto' ? facingSide(startRect, stopRect) : startSide,
  stopSide:
    stopSide === 'auto' ? OPPOSITE[facingSide(startRect, stopRect)] : stopSide
});

/**
 * Returns the point on a side of a box where a line attaches.
 *
 * When `count` lines share the side, they are spread around the middle of the
 * side, `spacing` pixels apart, shrinking to fit the side if needed. `gap`
 * moves the point away from the box.
 *
 * @example
 * ```ts
 * // The second of three lines on the top side
 * getAnchorPoint(rect, 'top', { index: 1, count: 3 });
 * ```
 */
export const getAnchorPoint = (
  rect: ArcRectInterface,
  side: ArcSideType,
  {
    index = 0,
    count = 1,
    spacing = 16,
    gap = 0
  }: { index?: number; count?: number; spacing?: number; gap?: number } = {}
): ArcPointInterface => {
  const length = side === 'top' || side === 'bottom' ? rect.width : rect.height;
  const step = count > 1 ? Math.min(spacing, length / count) : 0;
  const shift = (index - (count - 1) / 2) * step;
  const { x: cx, y: cy } = center(rect);

  let point: ArcPointInterface;

  switch (side) {
    case 'top':
      point = { x: cx + shift, y: rect.top };
      break;
    case 'bottom':
      point = { x: cx + shift, y: rect.bottom };
      break;
    case 'left':
      point = { x: rect.left, y: cy + shift };
      break;
    case 'right':
      point = { x: rect.right, y: cy + shift };
      break;
  }

  return add(point, NORMALS[side], gap);
};
