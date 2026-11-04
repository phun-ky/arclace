[@phun-ky/arclace](../index.md) / orthogonalPath

# Function: orthogonalPath()

> **orthogonalPath**(`start`, `startSide`, `stop`, `stopSide`, `__namedParameters?`): [`ArcPathResultType`](../type-aliases/ArcPathResultType.md)

Defined in: [utils/paths.ts:295](https://github.com/phun-ky/arclace/blob/main/src/utils/paths.ts#L295)

An orthogonal line with rounded corners.

## Parameters

### start

[`ArcPointInterface`](../interfaces/ArcPointInterface.md)

### startSide

[`ArcSideType`](../type-aliases/ArcSideType.md)

### stop

[`ArcPointInterface`](../interfaces/ArcPointInterface.md)

### stopSide

[`ArcSideType`](../type-aliases/ArcSideType.md)

### \_\_namedParameters?

#### offset?

`number` = `20`

#### radius?

`number` = `8`

## Returns

[`ArcPathResultType`](../type-aliases/ArcPathResultType.md)

## Example

```ts
orthogonalPath({ x: 0, y: 0 }, 'right', { x: 200, y: 100 }, 'left', {
  radius: 8,
  offset: 20
}).d;
```
