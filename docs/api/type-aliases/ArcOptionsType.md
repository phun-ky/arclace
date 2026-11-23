[@phun-ky/arclace](../index.md) / ArcOptionsType

# Type Alias: ArcOptionsType

> **ArcOptionsType** = `object`

Defined in: [src/types.ts:211](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L211)

Options for a [Arclace](../classes/Arclace.md) instance.

## Properties

### autoUpdate?

> `optional` **autoUpdate?**: `boolean` \| `"frame"`

Defined in: [src/types.ts:227](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L227)

Keep lines in sync with the page.

- `true`: redraw on window resize, scroll, element resize and DOM or
  style changes inside the container (default)
- `'frame'`: redraw on every animation frame, for CSS animations and
  transitions
- `false`: only redraw when you call `update()`

***

### className?

> `optional` **className?**: `string`

Defined in: [src/types.ts:237](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L237)

Extra class names added to the SVG overlay.

***

### container?

> `optional` **container?**: [`ArcElementTargetType`](ArcElementTargetType.md)

Defined in: [src/types.ts:216](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L216)

The element the SVG overlay is added to. All connected elements should
be inside it. Defaults to `document.body`.

***

### defaults?

> `optional` **defaults?**: [`ArcConnectionOptionsType`](ArcConnectionOptionsType.md)

Defined in: [src/types.ts:232](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L232)

Default options for every connection made by this instance.

***

### zIndex?

> `optional` **zIndex?**: `number`

Defined in: [src/types.ts:244](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L244)

The overlay's `z-index`. Without it, the overlay is painted below
positioned elements that come after it in the container; a `zIndex`
above theirs paints the lines on top.
