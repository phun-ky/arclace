[@phun-ky/arclace](../index.md) / Connection

# Class: Connection

Defined in: [src/Connection.ts:101](https://github.com/phun-ky/arclace/blob/main/src/Connection.ts#L101)

A line between two elements. Created with [Arclace.connect](Arclace.md#connect) or
[Arclace.connectAll](Arclace.md#connectall), not with `new`.

Each connection renders as:

```html
<g class="arc-connection arc-bezier">
  <marker class="arc-marker">…</marker>  <!-- when `arrow` is set -->
  <path class="arc-path" />
  <rect class="arc-label-bg" />          <!-- when `label` is set -->
  <text class="arc-label">…</text>
  <circle class="arc-anchor arc-anchor-start" />  <!-- when `anchors` is set -->
  <circle class="arc-anchor arc-anchor-end" />
</g>
```

The line, arrows and anchors use `currentColor`, so setting `color` on
`.arc-connection` colors all of them.

## Properties

### element

> `readonly` **element**: `SVGGElement`

Defined in: [src/Connection.ts:109](https://github.com/phun-ky/arclace/blob/main/src/Connection.ts#L109)

The `<g>` element holding everything this connection draws.

***

### endElement

> `readonly` **endElement**: `Element`

Defined in: [src/Connection.ts:104](https://github.com/phun-ky/arclace/blob/main/src/Connection.ts#L104)

***

### id

> `readonly` **id**: `string`

Defined in: [src/Connection.ts:102](https://github.com/phun-ky/arclace/blob/main/src/Connection.ts#L102)

***

### path

> `readonly` **path**: `SVGPathElement`

Defined in: [src/Connection.ts:114](https://github.com/phun-ky/arclace/blob/main/src/Connection.ts#L114)

The `<path>` element of the line.

***

### startElement

> `readonly` **startElement**: `Element`

Defined in: [src/Connection.ts:103](https://github.com/phun-ky/arclace/blob/main/src/Connection.ts#L103)

## Accessors

### geometry

#### Get Signature

> **get** **geometry**(): `Readonly`\<[`ArcGeometryType`](../type-aliases/ArcGeometryType.md)\> \| `null`

Defined in: [src/Connection.ts:168](https://github.com/phun-ky/arclace/blob/main/src/Connection.ts#L168)

The geometry from the last update, or `null` when the connection is
hidden because one of its elements is not rendered.

##### Returns

`Readonly`\<[`ArcGeometryType`](../type-aliases/ArcGeometryType.md)\> \| `null`

***

### options

#### Get Signature

> **get** **options**(): `Readonly`\<[`ArcResolvedConnectionOptionsType`](../type-aliases/ArcResolvedConnectionOptionsType.md)\>

Defined in: [src/Connection.ts:175](https://github.com/phun-ky/arclace/blob/main/src/Connection.ts#L175)

The connection's options merged with the instance defaults.

##### Returns

`Readonly`\<[`ArcResolvedConnectionOptionsType`](../type-aliases/ArcResolvedConnectionOptionsType.md)\>

## Methods

### remove()

> **remove**(): `void`

Defined in: [src/Connection.ts:223](https://github.com/phun-ky/arclace/blob/main/src/Connection.ts#L223)

Removes this connection.

#### Returns

`void`

***

### setOptions()

> **setOptions**(`options`): `this`

Defined in: [src/Connection.ts:195](https://github.com/phun-ky/arclace/blob/main/src/Connection.ts#L195)

Changes options and redraws.

#### Parameters

##### options

`Omit`\<[`ArcConnectionOptionsType`](../type-aliases/ArcConnectionOptionsType.md), `"id"`\>

#### Returns

`this`

#### Example

```ts
connection.setOptions({ type: 'orthogonal', arrow: 'end' });
```

#### Throws

When an option has the wrong type, or `id` is set.

#### Throws

When an option is out of range.

#### Throws

When the connection has been removed.

***

### update()

> **update**(): `void`

Defined in: [src/Connection.ts:216](https://github.com/phun-ky/arclace/blob/main/src/Connection.ts#L216)

Redraws every connection of the owning instance.

#### Returns

`void`
