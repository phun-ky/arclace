import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  bezierPath,
  bezierPathVia,
  orthogonalPath,
  orthogonalPathVia,
  polylineMidpoint,
  polylinePath,
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

describe('polylinePath', () => {
  it('draws straight lines through the points, labelled halfway along', () => {
    const { d, labelPoint } = polylinePath([
      { x: 0, y: 0 },
      { x: 50, y: 50 },
      { x: 100, y: 0 }
    ]);

    assert.equal(d, 'M 0 0 L 50 50 L 100 0');
    assert.deepEqual(labelPoint, { x: 50, y: 50 });
  });
});

describe('bezierPathVia', () => {
  const curve = (via: { x: number; y: number }[]) =>
    bezierPathVia({ x: 0, y: 0 }, 'right', { x: 200, y: 0 }, 'left', via);
  const numbers = (d: string) => (d.match(/-?[\d.]+/g) ?? []).map(Number);

  it('passes through each waypoint as one path', () => {
    const { d } = curve([{ x: 100, y: 50 }]);

    assert.match(d, /^M 0 0 C [^C]+, 100 50 C [^C]+, 200 0$/);
  });

  it('leaves and arrives along the sides, and is smooth at waypoints', () => {
    // M x y C c1 c2 p C c1 c2 p
    const [, , c1x, c1y, c2x, c2y, , , d1x, d1y, d2x, d2y] = numbers(
      curve([{ x: 100, y: 50 }]).d
    );

    assert.ok(c1x > 0);
    assert.equal(c1y, 0);
    assert.ok(d2x < 200);
    assert.equal(d2y, 0);
    // Both handles at the waypoint are level with it, one on each side
    assert.equal(c2y, 50);
    assert.equal(d1y, 50);
    assert.ok(c2x < 100 && d1x > 100);
  });

  it('puts the label halfway along the whole curve', () => {
    const { labelPoint } = curve([{ x: 100, y: 50 }]);

    assert.ok(Math.abs(labelPoint.x - 100) < 0.5);
    assert.ok(Math.abs(labelPoint.y - 50) < 0.5);
  });

  it('bulges each end by its own curvature', () => {
    const { d } = bezierPathVia(
      { x: 0, y: 0 },
      'right',
      { x: 200, y: 0 },
      'left',
      [{ x: 100, y: 50 }],
      1,
      0
    );

    // No bulge at the end: the last handle sits on the end point
    assert.match(d, /, 200 0, 200 0$/);
  });

  it('copes with waypoints on top of each other', () => {
    const { d } = curve([
      { x: 0, y: 0 },
      { x: 0, y: 0 }
    ]);

    assert.doesNotMatch(d, /NaN/);
  });
});

describe('orthogonalPathVia', () => {
  const route = (
    end: { x: number; y: number },
    endSide: 'left' | 'top',
    via: { x: number; y: number }[]
  ) =>
    orthogonalPathVia({ x: 0, y: 0 }, 'right', end, endSide, via, {
      radius: 0,
      offset: 20
    }).d;

  it('runs straight through a waypoint between two Zs', () => {
    assert.equal(
      route({ x: 200, y: 100 }, 'left', [{ x: 100, y: 50 }]),
      'M 0 0 L 50 0 L 50 50 L 150 50 L 150 100 L 200 100'
    );
  });

  it('routes leftwards and upwards the same way', () => {
    const options = { radius: 0, offset: 20 };

    assert.equal(
      orthogonalPathVia(
        { x: 0, y: 0 },
        'left',
        { x: -200, y: -100 },
        'right',
        [{ x: -100, y: -50 }],
        options
      ).d,
      'M 0 0 L -50 0 L -50 -50 L -150 -50 L -150 -100 L -200 -100'
    );
    assert.equal(
      orthogonalPathVia(
        { x: 0, y: 0 },
        'top',
        { x: 100, y: -200 },
        'bottom',
        [{ x: 50, y: -100 }],
        options
      ).d,
      'M 0 0 L 0 -50 L 50 -50 L 50 -150 L 100 -150 L 100 -200'
    );
  });

  it('turns at a waypoint when the legs run different ways', () => {
    assert.equal(
      route({ x: 100, y: 200 }, 'top', [{ x: 100, y: 0 }]),
      'M 0 0 L 100 0 L 100 200'
    );
  });

  it('never steps back past a waypoint that is close', () => {
    const xs = route({ x: 60, y: 10 }, 'left', [{ x: 30, y: 5 }])
      .match(/-?[\d.]+ -?[\d.]+/g)!
      .map((pair) => Number(pair.split(' ')[0]));

    assert.deepEqual(
      xs,
      [...xs].sort((p, q) => p - q)
    );
  });
});

describe('bezierPath', () => {
  it('bulges each end by its own curvature', () => {
    const start = { x: 0, y: 0 };
    const end = { x: 100, y: 0 };
    const handle = (d: string) => Number(d.match(/^M 0 0 C ([\d.-]+) 0,/)![1]);
    const even = bezierPath(start, 'right', end, 'left', 1).d;
    const lean = bezierPath(start, 'right', end, 'left', 2, 0).d;

    // endCurvature defaults to curvature
    assert.equal(bezierPath(start, 'right', end, 'left', 1, 1).d, even);
    assert.ok(Math.abs(handle(lean) - 2 * handle(even)) < 0.02);
    assert.match(lean, /, 100 0, 100 0$/);
  });

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
  it('steps endOffset out of the end, offset by default', () => {
    const start = { x: 0, y: 0 };
    const end = { x: -50, y: 50 };

    assert.deepEqual(routeOrthogonal(start, 'right', end, 'left'), [
      start,
      { x: 20, y: 0 },
      { x: 20, y: 25 },
      { x: -70, y: 25 },
      { x: -70, y: 50 },
      end
    ]);
    assert.deepEqual(routeOrthogonal(start, 'right', end, 'left', 20, 0), [
      start,
      { x: 20, y: 0 },
      { x: 20, y: 25 },
      { x: -50, y: 25 },
      end,
      end
    ]);
  });

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
