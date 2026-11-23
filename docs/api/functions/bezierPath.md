[@phun-ky/arclace](../index.md) / bezierPath

# Function: bezierPath()

> **bezierPath**(`start`, `startSide`, `end`, `endSide`, `curvature?`, `endCurvature?`): [`ArcPathResultType`](../type-aliases/ArcPathResultType.md)

Defined in: [src/utils/paths.ts:119](https://github.com/phun-ky/arclace/blob/main/src/utils/paths.ts#L119)

A cubic bezier curve that leaves `start` and arrives at `end`
perpendicular to their sides.

## Parameters

### start

[`ArcPointInterface`](../interfaces/ArcPointInterface.md)

### startSide

[`ArcSideType`](../type-aliases/ArcSideType.md)

### end

[`ArcPointInterface`](../interfaces/ArcPointInterface.md)

### endSide

[`ArcSideType`](../type-aliases/ArcSideType.md)

### curvature?

`number` = `1`

How far the curve bulges out at the start, and at the
  end unless `endCurvature` is given.

### endCurvature?

`number` = `curvature`

How far the curve bulges out at the end. Different
  values at each end lean the curve.

## Returns

[`ArcPathResultType`](../type-aliases/ArcPathResultType.md)

## Throws

When a point, `curvature` or `endCurvature` isn't
  finite.

## Throws

When a side isn't `top`, `right`, `bottom` or `left`.

## Example

```ts
bezierPath({ x: 0, y: 0 }, 'right', { x: 200, y: 100 }, 'left').d;
```
