[**@phun-ky/connect-the-things**](../README.md)

***

[@phun-ky/connect-the-things](../README.md) / CTTConnectionOptionsType

# Type Alias: CTTConnectionOptionsType

> **CTTConnectionOptionsType** = `object`

Defined in: types.ts:48

Options for a single connection.

## Properties

### anchors?

> `optional` **anchors?**: `boolean`

Defined in: types.ts:104

Draw a dot where the line touches each element. Defaults to `false`.

***

### animated?

> `optional` **animated?**: `boolean`

Defined in: types.ts:99

Animate the dashes from start to stop. Implies `dashed`. Requires the
stylesheet. Defaults to `false`.

***

### arrow?

> `optional` **arrow?**: [`CTTArrowType`](CTTArrowType.md)

Defined in: types.ts:72

Where to draw arrow heads. Defaults to `'none'`.

***

### className?

> `optional` **className?**: `string`

Defined in: types.ts:109

Extra class names added to the connection's `<g>` element.

***

### color?

> `optional` **color?**: `string`

Defined in: types.ts:83

Line color. Any CSS color. Defaults to `currentColor` of the container,
or `--ctt-color` when the stylesheet is loaded.

***

### curvature?

> `optional` **curvature?**: `number`

Defined in: types.ts:134

`bezier` only: multiplies how far the curve bulges out from the
elements. Defaults to `1`.

***

### dashed?

> `optional` **dashed?**: `boolean`

Defined in: types.ts:93

Draw a dashed line. Defaults to `false`.

***

### gap?

> `optional` **gap?**: `number`

Defined in: types.ts:115

Distance in pixels between the element's edge and the line's end.
Defaults to `0`.

***

### id?

> `optional` **id?**: `string`

Defined in: types.ts:52

A unique id for the connection. Generated when omitted.

***

### label?

> `optional` **label?**: `string`

Defined in: types.ts:77

Text drawn at the middle of the line.

***

### offset?

> `optional` **offset?**: `number`

Defined in: types.ts:146

`orthogonal` only: how far in pixels the line travels straight out of an
element before it turns. Defaults to `20`.

***

### radius?

> `optional` **radius?**: `number`

Defined in: types.ts:140

`orthogonal` only: corner radius in pixels. Use `0` for sharp corners.
Defaults to `8`.

***

### spacing?

> `optional` **spacing?**: `number`

Defined in: types.ts:128

Preferred distance in pixels between spread end points. Shrinks to fit
the side. Defaults to `16`.

***

### spread?

> `optional` **spread?**: `boolean`

Defined in: types.ts:122

When several connections share the same side of an element, spread their
end points along that side instead of stacking them in the middle.
Defaults to `true`.

***

### startSide?

> `optional` **startSide?**: [`CTTSideOptionType`](CTTSideOptionType.md)

Defined in: types.ts:62

The side of the start element the line leaves from. Defaults to `'auto'`.

***

### stopSide?

> `optional` **stopSide?**: [`CTTSideOptionType`](CTTSideOptionType.md)

Defined in: types.ts:67

The side of the stop element the line arrives at. Defaults to `'auto'`.

***

### strokeWidth?

> `optional` **strokeWidth?**: `number`

Defined in: types.ts:88

Line width in pixels. Defaults to `2`.

***

### type?

> `optional` **type?**: [`CTTPathType`](CTTPathType.md)

Defined in: types.ts:57

How the line is drawn. Defaults to `'bezier'`.
