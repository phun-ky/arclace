[@phun-ky/arclace](../index.md) / Arclace

# Class: Arclace

Defined in: [src/Arclace.ts:71](https://github.com/phun-ky/arclace/blob/main/src/Arclace.ts#L71)

Draws and maintains SVG lines between DOM elements.

An instance adds one `<svg class="arc-svg">` overlay to its container and
draws every connection into it.

## Example

```ts
import { Arclace } from '@phun-ky/arclace';

const arclace = new Arclace({ container: '#diagram' });

arclace.connect('#a', '#b', { arrow: 'end', label: 'depends on' });
```

## Constructors

### Constructor

> **new Arclace**(`options?`): `Arclace`

Defined in: [src/Arclace.ts:97](https://github.com/phun-ky/arclace/blob/main/src/Arclace.ts#L97)

#### Parameters

##### options?

[`ArcOptionsType`](../type-aliases/ArcOptionsType.md) = `{}`

#### Returns

`Arclace`

#### Throws

When an option has the wrong type.

#### Throws

When an option is out of range.

#### Throws

When there is no DOM, or the container can't be
  found.

## Properties

### container

> `readonly` **container**: `HTMLElement`

Defined in: [src/Arclace.ts:75](https://github.com/phun-ky/arclace/blob/main/src/Arclace.ts#L75)

The element the overlay was added to.

***

### svg

> `readonly` **svg**: `SVGSVGElement`

Defined in: [src/Arclace.ts:80](https://github.com/phun-ky/arclace/blob/main/src/Arclace.ts#L80)

The SVG overlay all lines are drawn in.

## Accessors

### connections

#### Get Signature

> **get** **connections**(): [`Connection`](Connection.md)[]

Defined in: [src/Arclace.ts:139](https://github.com/phun-ky/arclace/blob/main/src/Arclace.ts#L139)

All current connections, in the order they were made.

##### Returns

[`Connection`](Connection.md)[]

## Methods

### clear()

> **clear**(): `void`

Defined in: [src/Arclace.ts:298](https://github.com/phun-ky/arclace/blob/main/src/Arclace.ts#L298)

Removes every connection.

#### Returns

`void`

***

### connect()

> **connect**(`startElement`, `endElement`, `options?`): [`Connection`](Connection.md)

Defined in: [src/Arclace.ts:158](https://github.com/phun-ky/arclace/blob/main/src/Arclace.ts#L158)

Connects two elements and draws the line right away.

#### Parameters

##### startElement

[`ArcElementTargetType`](../type-aliases/ArcElementTargetType.md)

The element (or selector) the line starts at.

##### endElement

[`ArcElementTargetType`](../type-aliases/ArcElementTargetType.md)

The element (or selector) the line ends at.

##### options?

[`ArcConnectionOptionsType`](../type-aliases/ArcConnectionOptionsType.md) = `{}`

Options for this connection, merged over the instance defaults.

#### Returns

[`Connection`](Connection.md)

#### Throws

When an element or an option has the wrong type.

#### Throws

When an option is out of range.

#### Throws

When an element can't be found, the id is taken
  or the instance has been destroyed. Nothing is added.

#### Example

```ts
const connection = arclace.connect(a, b, { type: 'orthogonal', arrow: 'end' });
```

***

### connectAll()

> **connectAll**(`definitions`): [`Connection`](Connection.md)[]

Defined in: [src/Arclace.ts:189](https://github.com/phun-ky/arclace/blob/main/src/Arclace.ts#L189)

Connects many pairs of elements and draws them in one go. Every
definition is checked first, so either all of them are added or none.

#### Parameters

##### definitions

[`ArcConnectionDefinitionType`](../type-aliases/ArcConnectionDefinitionType.md)[]

#### Returns

[`Connection`](Connection.md)[]

#### Throws

When `definitions` isn't an array, or an element or
  an option has the wrong type.

#### Throws

When an option is out of range.

#### Throws

When an element can't be found, an id is taken or
  repeated, or the instance has been destroyed.

#### Example

```ts
arclace.connectAll([
  { startElement: '#a', endElement: '#b' },
  { startElement: '#a', endElement: '#c', dashed: true }
]);
```

***

### destroy()

> **destroy**(): `void`

Defined in: [src/Arclace.ts:406](https://github.com/phun-ky/arclace/blob/main/src/Arclace.ts#L406)

Removes every connection and the overlay, and stops listening for
changes. The instance can't be used afterwards.

#### Returns

`void`

***

### disconnect()

> **disconnect**(`target`): `void`

Defined in: [src/Arclace.ts:266](https://github.com/phun-ky/arclace/blob/main/src/Arclace.ts#L266)

Removes connections.

#### Parameters

##### target

`string` \| `Element` \| [`Connection`](Connection.md)

A connection, a connection id, or an element (or
  selector) whose connections should all be removed. Targets that match
  nothing, and `null` or `undefined`, are ignored.

#### Returns

`void`

#### Throws

When the target is another kind of value.

#### Throws

When a string is neither an id nor a valid
  selector.

#### Example

```ts
arclace.disconnect(connection);
arclace.disconnect('my-connection-id');
arclace.disconnect(document.querySelector('#a'));
```

***

### find()

> **find**(`target`): [`Connection`](Connection.md)[]

Defined in: [src/Arclace.ts:236](https://github.com/phun-ky/arclace/blob/main/src/Arclace.ts#L236)

Returns every connection that starts or ends at an element. A selector
that matches nothing returns an empty array.

#### Parameters

##### target

[`ArcElementTargetType`](../type-aliases/ArcElementTargetType.md)

#### Returns

[`Connection`](Connection.md)[]

#### Throws

When the target is neither an element nor a string.

#### Throws

When the selector is invalid.

***

### get()

> **get**(`id`): [`Connection`](Connection.md) \| `undefined`

Defined in: [src/Arclace.ts:225](https://github.com/phun-ky/arclace/blob/main/src/Arclace.ts#L225)

Returns the connection with the given id.

#### Parameters

##### id

`string`

#### Returns

[`Connection`](Connection.md) \| `undefined`

***

### update()

> **update**(): `void`

Defined in: [src/Arclace.ts:314](https://github.com/phun-ky/arclace/blob/main/src/Arclace.ts#L314)

Remeasures every element and redraws every connection. Called
automatically when `autoUpdate` is on; call it yourself after moving
elements in ways the page can't observe.

#### Returns

`void`
