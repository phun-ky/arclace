[@phun-ky/arclace](../index.md) / bezierPath

# Function: bezierPath()

> **bezierPath**(`start`, `startSide`, `end`, `endSide`, `curvature?`): [`ArcPathResultType`](../type-aliases/ArcPathResultType.md)

Defined in: [src/utils/paths.ts:114](https://github.com/phun-ky/arclace/blob/main/src/utils/paths.ts#L114)

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

## Returns

[`ArcPathResultType`](../type-aliases/ArcPathResultType.md)

## Throws

When a point or `curvature` isn't finite.

## Throws

When a side isn't `top`, `right`, `bottom` or `left`.

## Example

```ts
bezierPath({ x: 0, y: 0 }, 'right', { x: 200, y: 100 }, 'left').d;
```
