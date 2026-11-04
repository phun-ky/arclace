[@phun-ky/connect-the-things](../index.md) / Connection

# Class: Connection

Defined in: [Connection.ts:83](https://github.com/phun-ky/connect-the-things/blob/main/src/Connection.ts#L83)

A line between two elements. Created with [ConnectTheThings.connect](ConnectTheThings.md#connect).

Each connection renders as:

```html
<g class="ctt-connection ctt-bezier">
  <marker class="ctt-marker">…</marker>  <!-- when `arrow` is set -->
  <path class="ctt-path" />
  <text class="ctt-label">…</text>       <!-- when `label` is set -->
  <circle class="ctt-anchor ctt-anchor-start" />  <!-- when `anchors` is set -->
  <circle class="ctt-anchor ctt-anchor-stop" />
</g>
```

The line, arrows and anchors use `currentColor`, so setting `color` on
`.ctt-connection` colors all of them.

## Constructors

### Constructor

> **new Connection**(`params`): `Connection`

Defined in: [Connection.ts:111](https://github.com/phun-ky/connect-the-things/blob/main/src/Connection.ts#L111)

#### Parameters

##### params

[`CTTConnectionParamsType`](../type-aliases/CTTConnectionParamsType.md)

#### Returns

`Connection`

## Properties

### element

> `readonly` **element**: `SVGGElement`

Defined in: [Connection.ts:91](https://github.com/phun-ky/connect-the-things/blob/main/src/Connection.ts#L91)

The `<g>` element holding everything this connection draws.

***

### geometry

> **geometry**: [`CTTGeometryType`](../type-aliases/CTTGeometryType.md) \| `null` = `null`

Defined in: [Connection.ts:102](https://github.com/phun-ky/connect-the-things/blob/main/src/Connection.ts#L102)

The geometry from the last update, or `null` when the connection is
hidden because one of its elements is not rendered.

***

### id

> `readonly` **id**: `string`

Defined in: [Connection.ts:84](https://github.com/phun-ky/connect-the-things/blob/main/src/Connection.ts#L84)

***

### path

> `readonly` **path**: `SVGPathElement`

Defined in: [Connection.ts:96](https://github.com/phun-ky/connect-the-things/blob/main/src/Connection.ts#L96)

The `<path>` element of the line.

***

### startElement

> `readonly` **startElement**: `Element`

Defined in: [Connection.ts:85](https://github.com/phun-ky/connect-the-things/blob/main/src/Connection.ts#L85)

***

### stopElement

> `readonly` **stopElement**: `Element`

Defined in: [Connection.ts:86](https://github.com/phun-ky/connect-the-things/blob/main/src/Connection.ts#L86)

## Accessors

### options

#### Get Signature

> **get** **options**(): `Readonly`\<[`CTTResolvedConnectionOptionsType`](../type-aliases/CTTResolvedConnectionOptionsType.md)\>

Defined in: [Connection.ts:140](https://github.com/phun-ky/connect-the-things/blob/main/src/Connection.ts#L140)

The connection's options merged with the instance defaults.

##### Returns

`Readonly`\<[`CTTResolvedConnectionOptionsType`](../type-aliases/CTTResolvedConnectionOptionsType.md)\>

## Methods

### remove()

> **remove**(): `void`

Defined in: [Connection.ts:175](https://github.com/phun-ky/connect-the-things/blob/main/src/Connection.ts#L175)

Removes this connection.

#### Returns

`void`

***

### setOptions()

> **setOptions**(`options`): `this`

Defined in: [Connection.ts:157](https://github.com/phun-ky/connect-the-things/blob/main/src/Connection.ts#L157)

Changes options and redraws.

#### Parameters

##### options

`Omit`\<[`CTTConnectionOptionsType`](../type-aliases/CTTConnectionOptionsType.md), `"id"`\>

#### Returns

`this`

#### Example

```ts
connection.setOptions({ type: 'orthogonal', arrow: 'end' });
```

***

### update()

> **update**(): `void`

Defined in: [Connection.ts:168](https://github.com/phun-ky/connect-the-things/blob/main/src/Connection.ts#L168)

Redraws every connection of the owning instance.

#### Returns

`void`
