import type { CTTPointInterface, CTTSideType } from '../types';

import {
  add,
  distance,
  fmt,
  isHorizontalSide,
  NORMALS,
  OPPOSITE
} from './geometry';

export type CTTPathResultType = {
  /**
   * SVG path data.
   */
  d: string;

  /**
   * The middle of the path, used to place labels.
   */
  labelPoint: CTTPointInterface;
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
 * A straight line between two points.
 *
 * @example
 * ```ts
 * straightPath({ x: 0, y: 0 }, { x: 100, y: 0 }).d; // 'M 0 0 L 100 0'
 * ```
 */
export const straightPath = (
  start: CTTPointInterface,
  stop: CTTPointInterface
): CTTPathResultType => ({
  d: `M ${fmt(start)} L ${fmt(stop)}`,
  labelPoint: { x: (start.x + stop.x) / 2, y: (start.y + stop.y) / 2 }
});

/**
 * A cubic bezier curve that leaves `start` and arrives at `stop`
 * perpendicular to their sides.
 *
 * @example
 * ```ts
 * bezierPath({ x: 0, y: 0 }, 'right', { x: 200, y: 100 }, 'left').d;
 * ```
 */
export const bezierPath = (
  start: CTTPointInterface,
  startSide: CTTSideType,
  stop: CTTPointInterface,
  stopSide: CTTSideType,
  curvature = 1
): CTTPathResultType => {
  const length = distance(start, stop);
  const bulge = (length / curveMultiplierFromDistance(length)) * curvature;
  const c1 = add(start, NORMALS[startSide], bulge);
  const c2 = add(stop, NORMALS[stopSide], bulge);

  return {
    d: `M ${fmt(start)} C ${fmt(c1)}, ${fmt(c2)}, ${fmt(stop)}`,
    // Point on the curve at t = 0.5
    labelPoint: {
      x: (start.x + 3 * c1.x + 3 * c2.x + stop.x) / 8,
      y: (start.y + 3 * c1.y + 3 * c2.y + stop.y) / 8
    }
  };
};

/**
 * Removes repeated points and points in the middle of a straight segment.
 */
export const simplifyPolyline = (
  points: CTTPointInterface[]
): CTTPointInterface[] => {
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
  points: CTTPointInterface[],
  radius: number
): string => {
  if (points.length === 0) return '';

  const towards = (
    from: CTTPointInterface,
    to: CTTPointInterface,
    length: number
  ): CTTPointInterface => {
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
  points: CTTPointInterface[]
): CTTPointInterface => {
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
const SWAPPED_SIDE: Record<CTTSideType, CTTSideType> = {
  top: 'left',
  bottom: 'right',
  left: 'top',
  right: 'bottom'
};
const swap = (point: CTTPointInterface): CTTPointInterface => ({
  x: point.y,
  y: point.x
});

/**
 * Routes a line from `start` to `stop` using only horizontal and vertical
 * segments. The line leaves and arrives perpendicular to the given sides,
 * travelling at least `offset` pixels straight out before turning back.
 *
 * @returns The corner points of the route, including `start` and `stop`.
 */
export const routeOrthogonal = (
  start: CTTPointInterface,
  startSide: CTTSideType,
  stop: CTTPointInterface,
  stopSide: CTTSideType,
  offset = 20
): CTTPointInterface[] => {
  if (!isHorizontalSide(startSide)) {
    return routeOrthogonal(
      swap(start),
      SWAPPED_SIDE[startSide],
      swap(stop),
      SWAPPED_SIDE[stopSide],
      offset
    ).map(swap);
  }

  const n1 = NORMALS[startSide];
  const n2 = NORMALS[stopSide];
  const s1 = add(start, n1, offset);
  const s2 = add(stop, n2, offset);

  if (isHorizontalSide(stopSide)) {
    if (stopSide === OPPOSITE[startSide]) {
      // Facing each other with room in between: turn halfway
      if ((s2.x - s1.x) * n1.x >= 0) {
        const midX = (start.x + stop.x) / 2;

        return [start, { x: midX, y: start.y }, { x: midX, y: stop.y }, stop];
      }

      // Facing away from each other: step out, cross over halfway, step in
      const midY = (s1.y + s2.y) / 2;

      return [start, s1, { x: s1.x, y: midY }, { x: s2.x, y: midY }, s2, stop];
    }

    // Same side: go around the outside of both
    const x = n1.x > 0 ? Math.max(s1.x, s2.x) : Math.min(s1.x, s2.x);

    return [start, { x, y: start.y }, { x, y: stop.y }, stop];
  }

  // One horizontal and one vertical side: a single corner if it lies in
  // front of both sides, otherwise step out of both and meet
  const corner = { x: stop.x, y: start.y };

  if ((corner.x - start.x) * n1.x > 0 && (corner.y - stop.y) * n2.y > 0) {
    return [start, corner, stop];
  }

  return [start, s1, { x: s1.x, y: s2.y }, s2, stop];
};

/**
 * An orthogonal line with rounded corners.
 *
 * @example
 * ```ts
 * orthogonalPath({ x: 0, y: 0 }, 'right', { x: 200, y: 100 }, 'left', {
 *   radius: 8,
 *   offset: 20
 * }).d;
 * ```
 */
export const orthogonalPath = (
  start: CTTPointInterface,
  startSide: CTTSideType,
  stop: CTTPointInterface,
  stopSide: CTTSideType,
  { radius = 8, offset = 20 }: { radius?: number; offset?: number } = {}
): CTTPathResultType => {
  const points = simplifyPolyline(
    routeOrthogonal(start, startSide, stop, stopSide, offset)
  );

  return {
    d: roundedPolyline(points, radius),
    labelPoint: polylineMidpoint(points)
  };
};
