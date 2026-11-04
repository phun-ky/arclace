[@phun-ky/connect-the-things](../index.md) / straightPath

# Function: straightPath()

> **straightPath**(`start`, `stop`): [`CTTPathResultType`](../type-aliases/CTTPathResultType.md)

Defined in: [utils/paths.ts:72](https://github.com/phun-ky/connect-the-things/blob/main/src/utils/paths.ts#L72)

A straight line between two points.

## Parameters

### start

[`CTTPointInterface`](../interfaces/CTTPointInterface.md)

### stop

[`CTTPointInterface`](../interfaces/CTTPointInterface.md)

## Returns

[`CTTPathResultType`](../type-aliases/CTTPathResultType.md)

## Example

```ts
straightPath({ x: 0, y: 0 }, { x: 100, y: 0 }).d; // 'M 0 0 L 100 0'
```
