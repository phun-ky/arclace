import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  bezierPath,
  orthogonalPath,
  polylineMidpoint,
  roundedPolyline,
  routeOrthogonal,
  simplifyPolyline,
  straightPath
} from '../utils/paths';

describe('straightPath', () => {
  it('draws a line with the label in the middle', () => {
    const { d, labelPoint } = straightPath({ x: 0, y: 0 }, { x: 100, y: 50 });

    assert.equal(d, 'M 0 0 L 100 50');
    assert.deepEqual(labelPoint, { x: 50, y: 25 });
  });
});

describe('bezierPath', () => {
  it('places control points along the side normals', () => {
    const { d } = bezierPath({ x: 0, y: 0 }, 'right', { x: 100, y: 0 }, 'left');
    const [, c1x, c1y, c2x, c2y] = d
      .match(/M 0 0 C ([\d.-]+) ([\d.-]+), ([\d.-]+) ([\d.-]+), 100 0/)!
      .map(Number);

    assert.ok(c1x > 0);
    assert.equal(c1y, 0);
    assert.ok(c2x < 100);
    assert.equal(c2y, 0);
  });

  it('puts the label on the curve', () => {
    const { labelPoint } = bezierPath(
      { x: 0, y: 0 },
      'right',
      { x: 100, y: 100 },
      'left'
    );

    assert.deepEqual(labelPoint, { x: 50, y: 50 });
  });

  it('scales the bulge with curvature', () => {
    const flat = bezierPath(
      { x: 0, y: 0 },
      'bottom',
      { x: 0, y: 100 },
      'top',
      0
    );

    assert.equal(flat.d, 'M 0 0 C 0 0, 0 100, 0 100');
  });
});

describe('routeOrthogonal', () => {
  it('turns halfway between facing sides', () => {
    assert.deepEqual(
      routeOrthogonal({ x: 0, y: 0 }, 'right', { x: 200, y: 100 }, 'left'),
      [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 200, y: 100 }
      ]
    );
  });

  it('routes vertical sides the same way', () => {
    assert.deepEqual(
      routeOrthogonal({ x: 0, y: 0 }, 'bottom', { x: 100, y: 200 }, 'top'),
      [
        { x: 0, y: 0 },
        { x: 0, y: 100 },
        { x: 100, y: 100 },
        { x: 100, y: 200 }
      ]
    );
  });

  it('steps out and back when the sides face away', () => {
    const points = routeOrthogonal(
      { x: 200, y: 0 },
      'right',
      { x: 0, y: 100 },
      'left',
      20
    );

    assert.deepEqual(points, [
      { x: 200, y: 0 },
      { x: 220, y: 0 },
      { x: 220, y: 50 },
      { x: -20, y: 50 },
      { x: -20, y: 100 },
      { x: 0, y: 100 }
    ]);
  });

  it('goes around the outside for the same side', () => {
    const points = routeOrthogonal(
      { x: 100, y: 0 },
      'right',
      { x: 50, y: 100 },
      'right',
      20
    );

    assert.deepEqual(points, [
      { x: 100, y: 0 },
      { x: 120, y: 0 },
      { x: 120, y: 100 },
      { x: 50, y: 100 }
    ]);
  });

  it('uses a single corner from a horizontal to a vertical side', () => {
    assert.deepEqual(
      routeOrthogonal({ x: 0, y: 0 }, 'right', { x: 100, y: 100 }, 'top'),
      [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 }
      ]
    );
  });

  it('only moves along one axis per segment', () => {
    const sides = ['top', 'right', 'bottom', 'left'] as const;

    for (const startSide of sides) {
      for (const endSide of sides) {
        const points = routeOrthogonal(
          { x: 10, y: 20 },
          startSide,
          { x: 300, y: -150 },
          endSide
        );

        points.slice(1).forEach((point, i) => {
          const prev = points[i];

          assert.ok(
            point.x === prev.x || point.y === prev.y,
            `${startSide} → ${endSide}: diagonal segment`
          );
        });
      }
    }
  });
});

describe('simplifyPolyline', () => {
  it('removes duplicate and collinear points', () => {
    assert.deepEqual(
      simplifyPolyline([
        { x: 0, y: 0 },
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 }
      ]),
      [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 }
      ]
    );
  });
});

describe('roundedPolyline', () => {
  it('rounds corners with quadratic curves', () => {
    assert.equal(
      roundedPolyline(
        [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 }
        ],
        10
      ),
      'M 0 0 L 90 0 Q 100 0, 100 10 L 100 100'
    );
  });

  it('shrinks the radius on short segments', () => {
    assert.equal(
      roundedPolyline(
        [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 10, y: 100 }
        ],
        20
      ),
      'M 0 0 L 5 0 Q 10 0, 10 5 L 10 100'
    );
  });

  it('draws sharp corners with radius 0', () => {
    assert.equal(
      roundedPolyline(
        [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 10, y: 10 }
        ],
        0
      ),
      'M 0 0 L 10 0 L 10 10'
    );
  });
});

describe('polylineMidpoint', () => {
  it('finds the point halfway along the line', () => {
    assert.deepEqual(
      polylineMidpoint([
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 }
      ]),
      { x: 100, y: 0 }
    );
  });
});

describe('orthogonalPath', () => {
  it('combines routing, rounding and the label point', () => {
    const { d, labelPoint } = orthogonalPath(
      { x: 0, y: 0 },
      'right',
      { x: 200, y: 100 },
      'left',
      { radius: 0 }
    );

    assert.equal(d, 'M 0 0 L 100 0 L 100 100 L 200 100');
    assert.deepEqual(labelPoint, { x: 100, y: 50 });
  });
});
