[@phun-ky/arclace](../index.md) / straightPath

# Function: straightPath()

> **straightPath**(`start`, `end`): [`ArcPathResultType`](../type-aliases/ArcPathResultType.md)

Defined in: [src/utils/paths.ts:90](https://github.com/phun-ky/arclace/blob/main/src/utils/paths.ts#L90)

A straight line between two points.

## Parameters

### start

[`ArcPointInterface`](../interfaces/ArcPointInterface.md)

### end

[`ArcPointInterface`](../interfaces/ArcPointInterface.md)

## Returns

[`ArcPathResultType`](../type-aliases/ArcPathResultType.md)

## Throws

When a point doesn't have finite `x` and `y`.

## Example

```ts
straightPath({ x: 0, y: 0 }, { x: 100, y: 0 }).d; // 'M 0 0 L 100 0'
```
