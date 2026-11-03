[**@phun-ky/connect-the-things**](../README.md)

***

[@phun-ky/connect-the-things](../README.md) / bezierPath

# Function: bezierPath()

> **bezierPath**(`start`, `startSide`, `stop`, `stopSide`, `curvature?`): [`CTTPathResultType`](../type-aliases/CTTPathResultType.md)

Defined in: utils/paths.ts:89

A cubic bezier curve that leaves `start` and arrives at `stop`
perpendicular to their sides.

## Parameters

### start

[`CTTPointInterface`](../interfaces/CTTPointInterface.md)

### startSide

[`CTTSideType`](../type-aliases/CTTSideType.md)

### stop

[`CTTPointInterface`](../interfaces/CTTPointInterface.md)

### stopSide

[`CTTSideType`](../type-aliases/CTTSideType.md)

### curvature?

`number` = `1`

## Returns

[`CTTPathResultType`](../type-aliases/CTTPathResultType.md)

## Example

```ts
bezierPath({ x: 0, y: 0 }, 'right', { x: 200, y: 100 }, 'left').d;
```
