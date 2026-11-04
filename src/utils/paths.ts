import type { ArcPointInterface, ArcSideType } from '../types';

import {
  add,
  distance,
  fmt,
  isHorizontalSide,
  NORMALS,
  OPPOSITE
} from './geometry';
import { assertNumber, assertOneOf, assertPoint, SIDES } from './validate';

export type ArcPathResultType = {
  /**
   * SVG path data.
   */
  d: string;

  /**
   * The middle of the path, used to place labels.
   */
  labelPoint: ArcPointInterface;
};

/**
 * Normalizes a distance to a range from 0 to 1, based on max distance.
 *
 * @param distance - The actual distance.
 * @param maxDistance - The distance treated as 100% (1.0).
 * @returns Normalized value between 0 and 1.
 */
export const normalizeDistance = (
  distance: number,
  maxDistance: number = 1000
): number => Math.min(distance / maxDistance, 1);

/**
 * Maps a normalized value [0, 1] to a value between min and max.
 *
 * @param norm - Normalized value (0 to 1).
 * @param min - Minimum output value.
 * @param max - Maximum output value.
 * @returns Value between min and max.
 */
export const lerp = (norm: number, min: number, max: number): number =>
  min + (max - min) * norm;

/**
 * Calculates a curve multiplier based on distance. Short lines get a
 * relatively larger bulge than long lines.
 *
 * @param distance - Distance between points.
 * @param min - Minimum multiplier.
 * @param max - Maximum multiplier.
 * @param maxDistance - Distance at which max multiplier is used.
 * @returns A multiplier between min and max.
 */
export const curveMultiplierFromDistance = (
  distance: number,
  min: number = 1.1,
  max: number = 3.5,
  maxDistance: number = 1000
): number => lerp(normalizeDistance(distance, maxDistance), min, max);

/**
 * Checks the ends of a path, so a bad side or point fails with a clear error
 * instead of path data with `NaN` in it.
 */
const checkEnds = (
  start: unknown,
  startSide: unknown,
  end: unknown,
  endSide: unknown
): void => {
  assertPoint(start, 'start');
  assertOneOf(startSide, SIDES, 'startSide');
  assertPoint(end, 'end');
  assertOneOf(endSide, SIDES, 'endSide');
};

/**
 * A straight line between two points.
 *
 * @throws {TypeError} When a point doesn't have finite `x` and `y`.
 * @example
 * ```ts
 * straightPath({ x: 0, y: 0 }, { x: 100, y: 0 }).d; // 'M 0 0 L 100 0'
 * ```
 */
export const straightPath = (
  start: ArcPointInterface,
  end: ArcPointInterface
): ArcPathResultType => {
  assertPoint(start, 'start');
  assertPoint(end, 'end');

  return {
    d: `M ${fmt(start)} L ${fmt(end)}`,
    labelPoint: { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 }
  };
};

/**
 * A cubic bezier curve that leaves `start` and arrives at `end`
 * perpendicular to their sides.
 *
 * @throws {TypeError} When a point or `curvature` isn't finite.
 * @throws {RangeError} When a side isn't `top`, `right`, `bottom` or `left`.
 * @example
 * ```ts
 * bezierPath({ x: 0, y: 0 }, 'right', { x: 200, y: 100 }, 'left').d;
 * ```
 */
export const bezierPath = (
  start: ArcPointInterface,
  startSide: ArcSideType,
  end: ArcPointInterface,
  endSide: ArcSideType,
  curvature = 1
): ArcPathResultType => {
  checkEnds(start, startSide, end, endSide);
  assertNumber(curvature, 'curvature');

  const length = distance(start, end);
  const bulge = (length / curveMultiplierFromDistance(length)) * curvature;
  const c1 = add(start, NORMALS[startSide], bulge);
  const c2 = add(end, NORMALS[endSide], bulge);

  return {
    d: `M ${fmt(start)} C ${fmt(c1)}, ${fmt(c2)}, ${fmt(end)}`,
    // Point on the curve at t = 0.5
    labelPoint: {
      x: (start.x + 3 * c1.x + 3 * c2.x + end.x) / 8,
      y: (start.y + 3 * c1.y + 3 * c2.y + end.y) / 8
    }
  };
};

/**
 * Removes repeated points and points in the middle of a straight segment.
 */
export const simplifyPolyline = (
  points: ArcPointInterface[]
): ArcPointInterface[] => {
  const unique = points.filter(
    (point, i) => i === 0 || distance(point, points[i - 1]) > 0.01
  );

  return unique.filter((point, i) => {
    if (i === 0 || i === unique.length - 1) return true;

    const prev = unique[i - 1];
    const next = unique[i + 1];
    const cross =
      (point.x - prev.x) * (next.y - prev.y) -
      (point.y - prev.y) * (next.x - prev.x);

    return Math.abs(cross) > 0.01;
  });
};

/**
 * Turns a polyline into path data, rounding each corner with a quadratic
 * curve. The radius shrinks on short segments so corners never overlap.
 */
export const roundedPolyline = (
  points: ArcPointInterface[],
  radius: number
): string => {
  if (points.length === 0) return '';

  const towards = (
    from: ArcPointInterface,
    to: ArcPointInterface,
    length: number
  ): ArcPointInterface => {
    const total = distance(from, to);

    return {
      x: from.x + ((to.x - from.x) / total) * length,
      y: from.y + ((to.y - from.y) / total) * length
    };
  };
  const segments = [`M ${fmt(points[0])}`];

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const corner = points[i];
    const next = points[i + 1];
    const r = Math.min(
      radius,
      distance(prev, corner) / 2,
      distance(corner, next) / 2
    );

    if (r <= 0) {
      segments.push(`L ${fmt(corner)}`);
      continue;
    }

    segments.push(
      `L ${fmt(towards(corner, prev, r))}`,
      `Q ${fmt(corner)}, ${fmt(towards(corner, next, r))}`
    );
  }

  if (points.length > 1) segments.push(`L ${fmt(points[points.length - 1])}`);

  return segments.join(' ');
};

/**
 * The point halfway along a polyline.
 */
export const polylineMidpoint = (
  points: ArcPointInterface[]
): ArcPointInterface => {
  const lengths = points.slice(1).map((point, i) => distance(points[i], point));

  let remaining = lengths.reduce((sum, length) => sum + length, 0) / 2;

  for (let i = 0; i < lengths.length; i++) {
    if (remaining <= lengths[i] && lengths[i] > 0) {
      const t = remaining / lengths[i];

      return {
        x: points[i].x + (points[i + 1].x - points[i].x) * t,
        y: points[i].y + (points[i + 1].y - points[i].y) * t
      };
    }

    remaining -= lengths[i];
  }

  return { ...points[0] };
};

// Swapping x and y turns vertical sides into horizontal ones, so only the
// horizontal case has to be routed by hand.
const SWAPPED_SIDE: Readonly<Record<ArcSideType, ArcSideType>> = Object.freeze({
  top: 'left',
  bottom: 'right',
  left: 'top',
  right: 'bottom'
});
const swap = (point: ArcPointInterface): ArcPointInterface => ({
  x: point.y,
  y: point.x
});

/**
 * Routes a line from `start` to `end` using only horizontal and vertical
 * segments. The line leaves and arrives perpendicular to the given sides,
 * travelling at least `offset` pixels straight out before turning back.
 *
 * @returns The corner points of the route, including `start` and `end`.
 */
export const routeOrthogonal = (
  start: ArcPointInterface,
  startSide: ArcSideType,
  end: ArcPointInterface,
  endSide: ArcSideType,
  offset = 20
): ArcPointInterface[] => {
  if (!isHorizontalSide(startSide)) {
    return routeOrthogonal(
      swap(start),
      SWAPPED_SIDE[startSide],
      swap(end),
      SWAPPED_SIDE[endSide],
      offset
    ).map(swap);
  }

  const n1 = NORMALS[startSide];
  const n2 = NORMALS[endSide];
  const s1 = add(start, n1, offset);
  const s2 = add(end, n2, offset);

  if (isHorizontalSide(endSide)) {
    if (endSide === OPPOSITE[startSide]) {
      // Facing each other with room in between: turn halfway
      if ((s2.x - s1.x) * n1.x >= 0) {
        const midX = (start.x + end.x) / 2;

        return [start, { x: midX, y: start.y }, { x: midX, y: end.y }, end];
      }

      // Facing away from each other: step out, cross over halfway, step in
      const midY = (s1.y + s2.y) / 2;

      return [start, s1, { x: s1.x, y: midY }, { x: s2.x, y: midY }, s2, end];
    }

    // Same side: go around the outside of both
    const x = n1.x > 0 ? Math.max(s1.x, s2.x) : Math.min(s1.x, s2.x);

    return [start, { x, y: start.y }, { x, y: end.y }, end];
  }

  // One horizontal and one vertical side: a single corner if it lies in
  // front of both sides, otherwise step out of both and meet
  const corner = { x: end.x, y: start.y };

  if ((corner.x - start.x) * n1.x > 0 && (corner.y - end.y) * n2.y > 0) {
    return [start, corner, end];
  }

  return [start, s1, { x: s1.x, y: s2.y }, s2, end];
};

/**
 * An orthogonal line with rounded corners.
 *
 * @throws {TypeError} When a point, `radius` or `offset` isn't finite.
 * @throws {RangeError} When a side isn't `top`, `right`, `bottom` or `left`,
 *   or `radius` or `offset` is negative.
 * @example
 * ```ts
 * orthogonalPath({ x: 0, y: 0 }, 'right', { x: 200, y: 100 }, 'left', {
 *   radius: 8,
 *   offset: 20
 * }).d;
 * ```
 */
export const orthogonalPath = (
  start: ArcPointInterface,
  startSide: ArcSideType,
  end: ArcPointInterface,
  endSide: ArcSideType,
  { radius = 8, offset = 20 }: { radius?: number; offset?: number } = {}
): ArcPathResultType => {
  checkEnds(start, startSide, end, endSide);
  assertNumber(radius, 'radius', 0);
  assertNumber(offset, 'offset', 0);

  const points = simplifyPolyline(
    routeOrthogonal(start, startSide, end, endSide, offset)
  );

  return {
    d: roundedPolyline(points, radius),
    labelPoint: polylineMidpoint(points)
  };
};
