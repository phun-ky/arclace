[@phun-ky/arclace](../index.md) / ArcResolvedConnectionOptionsType

# Type Alias: ArcResolvedConnectionOptionsType

> **ArcResolvedConnectionOptionsType** = `Required`\<`Omit`\<[`ArcConnectionOptionsType`](ArcConnectionOptionsType.md), `"id"` \| `"label"` \| `"color"` \| `"gradient"` \| `"dashArray"` \| `"via"` \| `"startCurvature"` \| `"endCurvature"` \| `"className"`\>\> & `Pick`\<[`ArcConnectionOptionsType`](ArcConnectionOptionsType.md), `"label"` \| `"color"` \| `"gradient"` \| `"dashArray"` \| `"via"` \| `"startCurvature"` \| `"endCurvature"` \| `"className"`\> & `object`

Defined in: [src/Connection.ts:30](https://github.com/phun-ky/arclace/blob/main/src/Connection.ts#L30)

Connection options with every default filled in. `label`, `color`,
`gradient`, `dashArray`, `via`, `startCurvature`, `endCurvature` and
`className` have no default.

## Type Declaration

### id

> **id**: `string`
