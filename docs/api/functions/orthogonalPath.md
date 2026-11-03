[**@phun-ky/connect-the-things**](../README.md)

***

[@phun-ky/connect-the-things](../README.md) / orthogonalPath

# Function: orthogonalPath()

> **orthogonalPath**(`start`, `startSide`, `stop`, `stopSide`, `__namedParameters?`): [`CTTPathResultType`](../type-aliases/CTTPathResultType.md)

Defined in: utils/paths.ts:295

An orthogonal line with rounded corners.

## Parameters

### start

[`CTTPointInterface`](../interfaces/CTTPointInterface.md)

### startSide

[`CTTSideType`](../type-aliases/CTTSideType.md)

### stop

[`CTTPointInterface`](../interfaces/CTTPointInterface.md)

### stopSide

[`CTTSideType`](../type-aliases/CTTSideType.md)

### \_\_namedParameters?

#### offset?

`number` = `20`

#### radius?

`number` = `8`

## Returns

[`CTTPathResultType`](../type-aliases/CTTPathResultType.md)

## Example

```ts
orthogonalPath({ x: 0, y: 0 }, 'right', { x: 200, y: 100 }, 'left', {
  radius: 8,
  offset: 20
}).d;
```
