[@phun-ky/arclace](../index.md) / ArcOptionsType

# Type Alias: ArcOptionsType

> **ArcOptionsType** = `object`

Defined in: [src/types.ts:210](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L210)

Options for a [Arclace](../classes/Arclace.md) instance.

## Properties

### autoUpdate?

> `optional` **autoUpdate?**: `boolean` \| `"frame"`

Defined in: [src/types.ts:226](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L226)

Keep lines in sync with the page.

- `true`: redraw on window resize, scroll, element resize and DOM or
  style changes inside the container (default)
- `'frame'`: redraw on every animation frame, for CSS animations and
  transitions
- `false`: only redraw when you call `update()`

***

### className?

> `optional` **className?**: `string`

Defined in: [src/types.ts:236](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L236)

Extra class names added to the SVG overlay.

***

### container?

> `optional` **container?**: [`ArcElementTargetType`](ArcElementTargetType.md)

Defined in: [src/types.ts:215](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L215)

The element the SVG overlay is added to. All connected elements should
be inside it. Defaults to `document.body`.

***

### defaults?

> `optional` **defaults?**: [`ArcConnectionOptionsType`](ArcConnectionOptionsType.md)

Defined in: [src/types.ts:231](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L231)

Default options for every connection made by this instance.

***

### zIndex?

> `optional` **zIndex?**: `number`

Defined in: [src/types.ts:243](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L243)

The overlay's `z-index`. Without it, the overlay is painted below
positioned elements that come after it in the container; a `zIndex`
above theirs paints the lines on top.
