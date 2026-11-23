[@phun-ky/arclace](../index.md) / ArcOptionsType

# Type Alias: ArcOptionsType

> **ArcOptionsType** = `object`

Defined in: [src/types.ts:182](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L182)

Options for a [Arclace](../classes/Arclace.md) instance.

## Properties

### autoUpdate?

> `optional` **autoUpdate?**: `boolean` \| `"frame"`

Defined in: [src/types.ts:198](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L198)

Keep lines in sync with the page.

- `true`: redraw on window resize, scroll, element resize and DOM or
  style changes inside the container (default)
- `'frame'`: redraw on every animation frame, for CSS animations and
  transitions
- `false`: only redraw when you call `update()`

***

### className?

> `optional` **className?**: `string`

Defined in: [src/types.ts:208](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L208)

Extra class names added to the SVG overlay.

***

### container?

> `optional` **container?**: [`ArcElementTargetType`](ArcElementTargetType.md)

Defined in: [src/types.ts:187](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L187)

The element the SVG overlay is added to. All connected elements should
be inside it. Defaults to `document.body`.

***

### defaults?

> `optional` **defaults?**: [`ArcConnectionOptionsType`](ArcConnectionOptionsType.md)

Defined in: [src/types.ts:203](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L203)

Default options for every connection made by this instance.
