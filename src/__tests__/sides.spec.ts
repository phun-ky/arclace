import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { facingSide, getAnchorPoint, resolveSides } from '../utils/sides';

const rect = (left: number, top: number, width = 100, height = 50) => ({
  left,
  top,
  width,
  height,
  right: left + width,
  bottom: top + height
});

describe('facingSide', () => {
  it('picks left/right when boxes are further apart horizontally', () => {
    assert.equal(facingSide(rect(0, 0), rect(300, 40)), 'right');
    assert.equal(facingSide(rect(300, 40), rect(0, 0)), 'left');
  });

  it('picks top/bottom when boxes are further apart vertically', () => {
    assert.equal(facingSide(rect(0, 0), rect(50, 300)), 'bottom');
    assert.equal(facingSide(rect(50, 300), rect(0, 0)), 'top');
  });

  it('breaks equal gaps by the distance between the centres', () => {
    assert.equal(facingSide(rect(0, 0), rect(200, 150)), 'right');
    assert.equal(
      facingSide(rect(0, 0, 50, 100), rect(150, 200, 50, 100)),
      'bottom'
    );
  });
});

describe('resolveSides', () => {
  it('connects facing sides by default', () => {
    assert.deepEqual(resolveSides(rect(0, 0), rect(300, 0)), {
      startSide: 'right',
      stopSide: 'left'
    });
  });

  it('keeps explicit sides', () => {
    assert.deepEqual(resolveSides(rect(0, 0), rect(300, 0), 'bottom', 'auto'), {
      startSide: 'bottom',
      stopSide: 'left'
    });
    assert.deepEqual(resolveSides(rect(0, 0), rect(300, 0), 'top', 'top'), {
      startSide: 'top',
      stopSide: 'top'
    });
  });
});

describe('getAnchorPoint', () => {
  it('returns the middle of a side', () => {
    const r = rect(0, 0, 100, 50);

    assert.deepEqual(getAnchorPoint(r, 'top'), { x: 50, y: 0 });
    assert.deepEqual(getAnchorPoint(r, 'right'), { x: 100, y: 25 });
    assert.deepEqual(getAnchorPoint(r, 'bottom'), { x: 50, y: 50 });
    assert.deepEqual(getAnchorPoint(r, 'left'), { x: 0, y: 25 });
  });

  it('spreads points around the middle', () => {
    const r = rect(0, 0, 100, 50);
    const xs = [0, 1, 2].map(
      (index) => getAnchorPoint(r, 'top', { index, count: 3, spacing: 10 }).x
    );

    assert.deepEqual(xs, [40, 50, 60]);
  });

  it('shrinks spacing to fit the side', () => {
    const r = rect(0, 0, 20, 20);
    const xs = [0, 1].map(
      (index) =>
        getAnchorPoint(r, 'bottom', { index, count: 2, spacing: 100 }).x
    );

    assert.deepEqual(xs, [5, 15]);
  });

  it('moves the point away from the box by gap', () => {
    assert.deepEqual(getAnchorPoint(rect(0, 0), 'left', { gap: 5 }), {
      x: -5,
      y: 25
    });
  });
});
