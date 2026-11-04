[@phun-ky/arclace](../index.md) / orthogonalPath

# Function: orthogonalPath()

> **orthogonalPath**(`start`, `startSide`, `end`, `endSide`, `__namedParameters?`): [`ArcPathResultType`](../type-aliases/ArcPathResultType.md)

Defined in: [src/utils/paths.ts:326](https://github.com/phun-ky/arclace/blob/main/src/utils/paths.ts#L326)

An orthogonal line with rounded corners.

## Parameters

### start

[`ArcPointInterface`](../interfaces/ArcPointInterface.md)

### startSide

[`ArcSideType`](../type-aliases/ArcSideType.md)

### end

[`ArcPointInterface`](../interfaces/ArcPointInterface.md)

### endSide

[`ArcSideType`](../type-aliases/ArcSideType.md)

### \_\_namedParameters?

#### offset?

`number` = `20`

#### radius?

`number` = `8`

## Returns

[`ArcPathResultType`](../type-aliases/ArcPathResultType.md)

## Throws

When a point, `radius` or `offset` isn't finite.

## Throws

When a side isn't `top`, `right`, `bottom` or `left`,
  or `radius` or `offset` is negative.

## Example

```ts
orthogonalPath({ x: 0, y: 0 }, 'right', { x: 200, y: 100 }, 'left', {
  radius: 8,
  offset: 20
}).d;
```
