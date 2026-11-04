[@phun-ky/arclace](../index.md) / bezierPath

# Function: bezierPath()

> **bezierPath**(`start`, `startSide`, `stop`, `stopSide`, `curvature?`): [`ArcPathResultType`](../type-aliases/ArcPathResultType.md)

Defined in: [utils/paths.ts:89](https://github.com/phun-ky/arclace/blob/main/src/utils/paths.ts#L89)

A cubic bezier curve that leaves `start` and arrives at `stop`
perpendicular to their sides.

## Parameters

### start

[`ArcPointInterface`](../interfaces/ArcPointInterface.md)

### startSide

[`ArcSideType`](../type-aliases/ArcSideType.md)

### stop

[`ArcPointInterface`](../interfaces/ArcPointInterface.md)

### stopSide

[`ArcSideType`](../type-aliases/ArcSideType.md)

### curvature?

`number` = `1`

## Returns

[`ArcPathResultType`](../type-aliases/ArcPathResultType.md)

## Example

```ts
bezierPath({ x: 0, y: 0 }, 'right', { x: 200, y: 100 }, 'left').d;
```
