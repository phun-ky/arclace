[@phun-ky/arclace](../index.md) / ArcResolvedConnectionOptionsType

# Type Alias: ArcResolvedConnectionOptionsType

> **ArcResolvedConnectionOptionsType** = `Required`\<`Omit`\<[`ArcConnectionOptionsType`](ArcConnectionOptionsType.md), `"id"` \| `"label"` \| `"color"` \| `"gradient"` \| `"dashArray"` \| `"via"` \| `"className"`\>\> & `Pick`\<[`ArcConnectionOptionsType`](ArcConnectionOptionsType.md), `"label"` \| `"color"` \| `"gradient"` \| `"dashArray"` \| `"via"` \| `"className"`\> & `object`

Defined in: [src/Connection.ts:28](https://github.com/phun-ky/arclace/blob/main/src/Connection.ts#L28)

Connection options with every default filled in. `label`, `color`,
`gradient`, `dashArray`, `via` and `className` have no default.

## Type Declaration

### id

> **id**: `string`
