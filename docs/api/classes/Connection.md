[@phun-ky/arclace](../index.md) / Connection

# Class: Connection

Defined in: [src/Connection.ts:139](https://github.com/phun-ky/arclace/blob/main/src/Connection.ts#L139)

A line between two elements. Created with [Arclace.connect](Arclace.md#connect) or
[Arclace.connectAll](Arclace.md#connectall), not with `new`.

Each connection renders as:

```html
<g class="arc-connection arc-bezier">
  <marker class="arc-marker">…</marker>  <!-- when `arrow` is set -->
  <linearGradient class="arc-gradient">…</linearGradient>  <!-- when `gradient` is set -->
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

Defined in: [src/Connection.ts:147](https://github.com/phun-ky/arclace/blob/main/src/Connection.ts#L147)

The `<g>` element holding everything this connection draws.

***

### endElement

> `readonly` **endElement**: `Element`

Defined in: [src/Connection.ts:142](https://github.com/phun-ky/arclace/blob/main/src/Connection.ts#L142)

***

### id

> `readonly` **id**: `string`

Defined in: [src/Connection.ts:140](https://github.com/phun-ky/arclace/blob/main/src/Connection.ts#L140)

***

### path

> `readonly` **path**: `SVGPathElement`

Defined in: [src/Connection.ts:152](https://github.com/phun-ky/arclace/blob/main/src/Connection.ts#L152)

The `<path>` element of the line.

***

### startElement

> `readonly` **startElement**: `Element`

Defined in: [src/Connection.ts:141](https://github.com/phun-ky/arclace/blob/main/src/Connection.ts#L141)

## Accessors

### geometry

#### Get Signature

> **get** **geometry**(): `Readonly`\<[`ArcGeometryType`](../type-aliases/ArcGeometryType.md)\> \| `null`

Defined in: [src/Connection.ts:208](https://github.com/phun-ky/arclace/blob/main/src/Connection.ts#L208)

The geometry from the last update, or `null` when the connection is
hidden because one of its elements is not rendered.

##### Returns

`Readonly`\<[`ArcGeometryType`](../type-aliases/ArcGeometryType.md)\> \| `null`

***

### options

#### Get Signature

> **get** **options**(): `Readonly`\<[`ArcResolvedConnectionOptionsType`](../type-aliases/ArcResolvedConnectionOptionsType.md)\>

Defined in: [src/Connection.ts:215](https://github.com/phun-ky/arclace/blob/main/src/Connection.ts#L215)

The connection's options merged with the instance defaults.

##### Returns

`Readonly`\<[`ArcResolvedConnectionOptionsType`](../type-aliases/ArcResolvedConnectionOptionsType.md)\>

## Methods

### remove()

> **remove**(): `void`

Defined in: [src/Connection.ts:271](https://github.com/phun-ky/arclace/blob/main/src/Connection.ts#L271)

Removes this connection.

#### Returns

`void`

***

### setOptions()

> **setOptions**(`options`): `this`

Defined in: [src/Connection.ts:235](https://github.com/phun-ky/arclace/blob/main/src/Connection.ts#L235)

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

Defined in: [src/Connection.ts:264](https://github.com/phun-ky/arclace/blob/main/src/Connection.ts#L264)

Redraws every connection of the owning instance.

#### Returns

`void`
