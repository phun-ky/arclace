[@phun-ky/arclace](../index.md) / ArcConnectionOptionsType

# Type Alias: ArcConnectionOptionsType

> **ArcConnectionOptionsType** = `object`

Defined in: [src/types.ts:55](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L55)

Options for a single connection.

## Properties

### anchors?

> `optional` **anchors?**: `boolean`

Defined in: [src/types.ts:132](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L132)

Draw a dot where the line touches each element. Defaults to `false`.

***

### animated?

> `optional` **animated?**: `boolean`

Defined in: [src/types.ts:120](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L120)

Animate the dashes from start to end. Implies `dashed`. Requires the
stylesheet. Defaults to `false`.

***

### arrow?

> `optional` **arrow?**: [`ArcArrowType`](ArcArrowType.md)

Defined in: [src/types.ts:79](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L79)

Where to draw arrow heads. Defaults to `'none'`.

***

### className?

> `optional` **className?**: `string`

Defined in: [src/types.ts:137](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L137)

Extra class names added to the connection's `<g>` element.

***

### color?

> `optional` **color?**: `string`

Defined in: [src/types.ts:90](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L90)

Line color. Any CSS color. Defaults to `currentColor` of the container,
or `--arc-color` when the stylesheet is loaded.

***

### curvature?

> `optional` **curvature?**: `number`

Defined in: [src/types.ts:162](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L162)

`bezier` only: multiplies how far the curve bulges out from the
elements. Defaults to `1`.

***

### dashArray?

> `optional` **dashArray?**: `string` \| `number`[]

Defined in: [src/types.ts:114](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L114)

The dash pattern of `dashed` and `animated` lines, in pixels: dash and
gap lengths, as numbers or a string such as `'4 2'`. Without it, lines
use `--arc-dash` when the stylesheet is loaded, or `'6 6'`.

***

### dashed?

> `optional` **dashed?**: `boolean`

Defined in: [src/types.ts:107](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L107)

Draw a dashed line. Defaults to `false`.

***

### endCurvature?

> `optional` **endCurvature?**: `number`

Defined in: [src/types.ts:174](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L174)

`bezier` only: `curvature` at the end of the line. Defaults to
`curvature`.

***

### endSide?

> `optional` **endSide?**: [`ArcSideOptionType`](ArcSideOptionType.md)

Defined in: [src/types.ts:74](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L74)

The side of the end element the line arrives at. Defaults to `'auto'`.

***

### gap?

> `optional` **gap?**: `number`

Defined in: [src/types.ts:143](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L143)

Distance in pixels between the element's edge and the line's end.
Defaults to `0`.

***

### glow?

> `optional` **glow?**: `boolean` \| `number`

Defined in: [src/types.ts:127](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L127)

A soft glow around the line, in its color: `true` for the stylesheet's
`--arc-glow` or 4px, or a blur radius in pixels. Requires the
stylesheet. Defaults to `false`.

***

### gradient?

> `optional` **gradient?**: `string`[]

Defined in: [src/types.ts:97](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L97)

Two or more CSS colors the line fades through from start to end, evenly
spaced. Overrides `color` for the line; the arrow and anchor at each end
take that end's color.

***

### id?

> `optional` **id?**: `string`

Defined in: [src/types.ts:59](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L59)

A unique id for the connection. Generated when omitted.

***

### label?

> `optional` **label?**: `string`

Defined in: [src/types.ts:84](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L84)

Text drawn at the middle of the line.

***

### offset?

> `optional` **offset?**: `number`

Defined in: [src/types.ts:196](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L196)

`orthogonal` only: how far in pixels the line travels straight out of an
element before it turns. Defaults to `20`.

***

### radius?

> `optional` **radius?**: `number`

Defined in: [src/types.ts:190](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L190)

`orthogonal` only: corner radius in pixels. Use `0` for sharp corners.
Defaults to `8`.

***

### spacing?

> `optional` **spacing?**: `number`

Defined in: [src/types.ts:156](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L156)

Preferred distance in pixels between spread end points. Shrinks to fit
the side. Defaults to `16`.

***

### spread?

> `optional` **spread?**: `boolean`

Defined in: [src/types.ts:150](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L150)

When several connections share the same side of an element, spread their
end points along that side instead of stacking them in the middle.
Defaults to `true`.

***

### startCurvature?

> `optional` **startCurvature?**: `number`

Defined in: [src/types.ts:168](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L168)

`bezier` only: `curvature` at the start of the line, so the two ends can
bulge differently and lean the curve. Defaults to `curvature`.

***

### startSide?

> `optional` **startSide?**: [`ArcSideOptionType`](ArcSideOptionType.md)

Defined in: [src/types.ts:69](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L69)

The side of the start element the line leaves from. Defaults to `'auto'`.

***

### strokeWidth?

> `optional` **strokeWidth?**: `number`

Defined in: [src/types.ts:102](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L102)

Line width in pixels. Defaults to `2`.

***

### type?

> `optional` **type?**: [`ArcPathType`](ArcPathType.md)

Defined in: [src/types.ts:64](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L64)

How the line is drawn. Defaults to `'bezier'`.

***

### via?

> `optional` **via?**: [`ArcWaypointType`](ArcWaypointType.md)[]

Defined in: [src/types.ts:184](https://github.com/phun-ky/arclace/blob/main/src/types.ts#L184)

Elements or points the line passes through on its way from start to
end, in order, as one path, so dashes stay in step. An `orthogonal`
line runs straight through a waypoint, or turns at it when the legs on
either side run different ways. Selectors are looked up when the option
is set. The line is hidden while one of the elements is
not rendered.
