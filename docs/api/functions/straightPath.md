[@phun-ky/arclace](../index.md) / straightPath

# Function: straightPath()

> **straightPath**(`start`, `stop`): [`ArcPathResultType`](../type-aliases/ArcPathResultType.md)

Defined in: [utils/paths.ts:72](https://github.com/phun-ky/arclace/blob/main/src/utils/paths.ts#L72)

A straight line between two points.

## Parameters

### start

[`ArcPointInterface`](../interfaces/ArcPointInterface.md)

### stop

[`ArcPointInterface`](../interfaces/ArcPointInterface.md)

## Returns

[`ArcPathResultType`](../type-aliases/ArcPathResultType.md)

## Example

```ts
straightPath({ x: 0, y: 0 }, { x: 100, y: 0 }).d; // 'M 0 0 L 100 0'
```
