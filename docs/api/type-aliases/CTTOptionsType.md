[@phun-ky/connect-the-things](../index.md) / CTTOptionsType

# Type Alias: CTTOptionsType

> **CTTOptionsType** = `object`

Defined in: [types.ts:161](https://github.com/phun-ky/connect-the-things/blob/main/src/types.ts#L161)

Options for a [ConnectTheThings](../classes/ConnectTheThings.md) instance.

## Properties

### autoUpdate?

> `optional` **autoUpdate?**: `boolean` \| `"frame"`

Defined in: [types.ts:177](https://github.com/phun-ky/connect-the-things/blob/main/src/types.ts#L177)

Keep lines in sync with the page.

- `true`: redraw on window resize, scroll, element resize and DOM or
  style changes inside the container (default)
- `'frame'`: redraw on every animation frame, for CSS animations and
  transitions
- `false`: only redraw when you call `update()`

***

### className?

> `optional` **className?**: `string`

Defined in: [types.ts:187](https://github.com/phun-ky/connect-the-things/blob/main/src/types.ts#L187)

Extra class names added to the SVG overlay.

***

### container?

> `optional` **container?**: [`CTTElementTargetType`](CTTElementTargetType.md)

Defined in: [types.ts:166](https://github.com/phun-ky/connect-the-things/blob/main/src/types.ts#L166)

The element the SVG overlay is added to. All connected elements should
be inside it. Defaults to `document.body`.

***

### defaults?

> `optional` **defaults?**: [`CTTConnectionOptionsType`](CTTConnectionOptionsType.md)

Defined in: [types.ts:182](https://github.com/phun-ky/connect-the-things/blob/main/src/types.ts#L182)

Default options for every connection made by this instance.
