import * as fc from 'fast-check';

import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { Arclace } from '../Arclace';
import type { ArcPointInterface, ArcSideType } from '../types';
import {
  bezierPath,
  orthogonalPath,
  routeOrthogonal,
  straightPath
} from '../utils/paths';
import { getAnchorPoint } from '../utils/sides';

import { box } from './helpers';

const coordinate = fc.double({ min: -1e5, max: 1e5, noNaN: true });
// Plain objects: fc.record makes objects without a prototype
const point = fc
  .tuple(coordinate, coordinate)
  .map(([x, y]): ArcPointInterface => ({ x, y }));
const side = fc.constantFrom<ArcSideType>('top', 'right', 'bottom', 'left');
const rect = fc
  .record({
    left: coordinate,
    top: coordinate,
    width: fc.double({ min: 1, max: 1e4, noNaN: true }),
    height: fc.double({ min: 1, max: 1e4, noNaN: true })
  })
  .map(({ left, top, width, height }) => ({
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height
  }));
// Path data is numbers, letters and separators only
const FINITE_PATH = /^[MLCQ0-9 ,.e+-]+$/;

afterEach(() => {
  document.body.innerHTML = '';
});

describe('properties', () => {
  it('routes orthogonal lines with horizontal and vertical segments only', () => {
    fc.assert(
      fc.property(
        point,
        side,
        point,
        side,
        fc.double({ min: 0, max: 500, noNaN: true }),
        (start, startSide, end, endSide, offset) => {
          const points = routeOrthogonal(
            start,
            startSide,
            end,
            endSide,
            offset
          );

          assert.deepEqual(points[0], start);
          assert.deepEqual(points.at(-1), end);

          points.slice(1).forEach((p: ArcPointInterface, i) => {
            const prev = points[i];

            assert.ok(
              p.x === prev.x || p.y === prev.y,
              `segment ${i} goes diagonally`
            );
          });
        }
      )
    );
  });

  it('puts every anchor point on its side', () => {
    fc.assert(
      fc.property(
        rect,
        side,
        fc.integer({ min: 1, max: 12 }).chain((count) =>
          fc.record({
            count: fc.constant(count),
            index: fc.integer({ min: 0, max: count - 1 })
          })
        ),
        fc.double({ min: 0, max: 100, noNaN: true }),
        (box, side, { count, index }, spacing) => {
          const { x, y } = getAnchorPoint(box, side, { count, index, spacing });
          // A tiny margin for floating point rounding
          const near = (value: number, min: number, max: number) =>
            value >= min - 1e-6 && value <= max + 1e-6;

          if (side === 'top' || side === 'bottom') {
            assert.equal(y, side === 'top' ? box.top : box.bottom);
            assert.ok(near(x, box.left, box.right), `x ${x} is off the side`);
          } else {
            assert.equal(x, side === 'left' ? box.left : box.right);
            assert.ok(near(y, box.top, box.bottom), `y ${y} is off the side`);
          }
        }
      )
    );
  });

  it('never puts NaN or Infinity in path data', () => {
    fc.assert(
      fc.property(
        point,
        side,
        point,
        side,
        fc.double({ min: -10, max: 10, noNaN: true }),
        fc.double({ min: 0, max: 100, noNaN: true }),
        fc.double({ min: 0, max: 500, noNaN: true }),
        (start, startSide, end, endSide, curvature, radius, offset) => {
          for (const { d, labelPoint } of [
            straightPath(start, end),
            bezierPath(start, startSide, end, endSide, curvature),
            orthogonalPath(start, startSide, end, endSide, { radius, offset })
          ]) {
            assert.match(d, FINITE_PATH);
            assert.ok(Number.isFinite(labelPoint.x));
            assert.ok(Number.isFinite(labelPoint.y));
          }
        }
      )
    );
  });

  it('keeps an instance working whatever the options are', () => {
    const a = box('a', { left: 0, top: 0, width: 100, height: 50 });
    const b = box('b', { left: 300, top: 200, width: 100, height: 50 });
    const arclace = new Arclace({ autoUpdate: false });
    const anything = fc.oneof(
      fc.anything(),
      fc.constantFrom('top', 'auto', 'end', 'straight', 'orthogonal', '')
    );
    const keys = [
      'id',
      'type',
      'startSide',
      'endSide',
      'arrow',
      'label',
      'color',
      'strokeWidth',
      'dashed',
      'animated',
      'anchors',
      'className',
      'gap',
      'spread',
      'spacing',
      'curvature',
      'radius',
      'offset'
    ];

    fc.assert(
      fc.property(
        fc.dictionary(fc.constantFrom(...keys), anything, { maxKeys: 4 }),
        (options) => {
          try {
            arclace.connect(a, b, options);
          } catch (error) {
            assert.ok(
              error instanceof TypeError ||
                error instanceof RangeError ||
                (error as Error).name === 'ArclaceError',
              `unexpected ${(error as Error).name}: ${(error as Error).message}`
            );
          }

          // Whatever happened, the instance still draws
          arclace.update();

          for (const connection of arclace.connections) {
            assert.match(connection.geometry!.d, FINITE_PATH);
          }
        }
      )
    );
  });
});
