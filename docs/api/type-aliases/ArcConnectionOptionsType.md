[@phun-ky/arclace](../index.md) / ArcConnectionOptionsType

# Type Alias: ArcConnectionOptionsType

> **ArcConnectionOptionsType** = `object`

Defined in: [src/types.ts:48](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L48)

Options for a single connection.

## Properties

### anchors?

> `optional` **anchors?**: `boolean`

Defined in: [src/types.ts:125](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L125)

Draw a dot where the line touches each element. Defaults to `false`.

***

### animated?

> `optional` **animated?**: `boolean`

Defined in: [src/types.ts:113](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L113)

Animate the dashes from start to end. Implies `dashed`. Requires the
stylesheet. Defaults to `false`.

***

### arrow?

> `optional` **arrow?**: [`ArcArrowType`](ArcArrowType.md)

Defined in: [src/types.ts:72](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L72)

Where to draw arrow heads. Defaults to `'none'`.

***

### className?

> `optional` **className?**: `string`

Defined in: [src/types.ts:130](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L130)

Extra class names added to the connection's `<g>` element.

***

### color?

> `optional` **color?**: `string`

Defined in: [src/types.ts:83](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L83)

Line color. Any CSS color. Defaults to `currentColor` of the container,
or `--arc-color` when the stylesheet is loaded.

***

### curvature?

> `optional` **curvature?**: `number`

Defined in: [src/types.ts:155](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L155)

`bezier` only: multiplies how far the curve bulges out from the
elements. Defaults to `1`.

***

### dashArray?

> `optional` **dashArray?**: `string` \| `number`[]

Defined in: [src/types.ts:107](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L107)

The dash pattern of `dashed` and `animated` lines, in pixels: dash and
gap lengths, as numbers or a string such as `'4 2'`. Without it, lines
use `--arc-dash` when the stylesheet is loaded, or `'6 6'`.

***

### dashed?

> `optional` **dashed?**: `boolean`

Defined in: [src/types.ts:100](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L100)

Draw a dashed line. Defaults to `false`.

***

### endSide?

> `optional` **endSide?**: [`ArcSideOptionType`](ArcSideOptionType.md)

Defined in: [src/types.ts:67](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L67)

The side of the end element the line arrives at. Defaults to `'auto'`.

***

### gap?

> `optional` **gap?**: `number`

Defined in: [src/types.ts:136](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L136)

Distance in pixels between the element's edge and the line's end.
Defaults to `0`.

***

### glow?

> `optional` **glow?**: `boolean` \| `number`

Defined in: [src/types.ts:120](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L120)

A soft glow around the line, in its color: `true` for the stylesheet's
`--arc-glow` or 4px, or a blur radius in pixels. Requires the
stylesheet. Defaults to `false`.

***

### gradient?

> `optional` **gradient?**: `string`[]

Defined in: [src/types.ts:90](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L90)

Two or more CSS colors the line fades through from start to end, evenly
spaced. Overrides `color` for the line; the arrow and anchor at each end
take that end's color.

***

### id?

> `optional` **id?**: `string`

Defined in: [src/types.ts:52](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L52)

A unique id for the connection. Generated when omitted.

***

### label?

> `optional` **label?**: `string`

Defined in: [src/types.ts:77](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L77)

Text drawn at the middle of the line.

***

### offset?

> `optional` **offset?**: `number`

Defined in: [src/types.ts:167](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L167)

`orthogonal` only: how far in pixels the line travels straight out of an
element before it turns. Defaults to `20`.

***

### radius?

> `optional` **radius?**: `number`

Defined in: [src/types.ts:161](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L161)

`orthogonal` only: corner radius in pixels. Use `0` for sharp corners.
Defaults to `8`.

***

### spacing?

> `optional` **spacing?**: `number`

Defined in: [src/types.ts:149](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L149)

Preferred distance in pixels between spread end points. Shrinks to fit
the side. Defaults to `16`.

***

### spread?

> `optional` **spread?**: `boolean`

Defined in: [src/types.ts:143](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L143)

When several connections share the same side of an element, spread their
end points along that side instead of stacking them in the middle.
Defaults to `true`.

***

### startSide?

> `optional` **startSide?**: [`ArcSideOptionType`](ArcSideOptionType.md)

Defined in: [src/types.ts:62](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L62)

The side of the start element the line leaves from. Defaults to `'auto'`.

***

### strokeWidth?

> `optional` **strokeWidth?**: `number`

Defined in: [src/types.ts:95](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L95)

Line width in pixels. Defaults to `2`.

***

### type?

> `optional` **type?**: [`ArcPathType`](ArcPathType.md)

Defined in: [src/types.ts:57](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L57)

How the line is drawn. Defaults to `'bezier'`.
