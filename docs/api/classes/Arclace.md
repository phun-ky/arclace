[@phun-ky/arclace](../index.md) / Arclace

# Class: Arclace

Defined in: [Arclace.ts:57](https://github.com/phun-ky/arclace/blob/main/src/Arclace.ts#L57)

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

Defined in: [Arclace.ts:77](https://github.com/phun-ky/arclace/blob/main/src/Arclace.ts#L77)

#### Parameters

##### options?

[`ArcOptionsType`](../type-aliases/ArcOptionsType.md) = `{}`

#### Returns

`Arclace`

## Properties

### container

> `readonly` **container**: `HTMLElement`

Defined in: [Arclace.ts:61](https://github.com/phun-ky/arclace/blob/main/src/Arclace.ts#L61)

The element the overlay was added to.

***

### svg

> `readonly` **svg**: `SVGSVGElement`

Defined in: [Arclace.ts:66](https://github.com/phun-ky/arclace/blob/main/src/Arclace.ts#L66)

The SVG overlay all lines are drawn in.

## Accessors

### connections

#### Get Signature

> **get** **connections**(): [`Connection`](Connection.md)[]

Defined in: [Arclace.ts:119](https://github.com/phun-ky/arclace/blob/main/src/Arclace.ts#L119)

All current connections, in the order they were made.

##### Returns

[`Connection`](Connection.md)[]

## Methods

### clear()

> **clear**(): `void`

Defined in: [Arclace.ts:231](https://github.com/phun-ky/arclace/blob/main/src/Arclace.ts#L231)

Removes every connection.

#### Returns

`void`

***

### connect()

> **connect**(`startElement`, `stopElement`, `options?`): [`Connection`](Connection.md)

Defined in: [Arclace.ts:135](https://github.com/phun-ky/arclace/blob/main/src/Arclace.ts#L135)

Connects two elements and draws the line right away.

#### Parameters

##### startElement

[`ArcElementTargetType`](../type-aliases/ArcElementTargetType.md)

The element (or selector) the line starts at.

##### stopElement

[`ArcElementTargetType`](../type-aliases/ArcElementTargetType.md)

The element (or selector) the line stops at.

##### options?

[`ArcConnectionOptionsType`](../type-aliases/ArcConnectionOptionsType.md) = `{}`

Options for this connection, merged over the instance defaults.

#### Returns

[`Connection`](Connection.md)

#### Throws

When an element can't be found or the id is taken.

#### Example

```ts
const connection = arclace.connect(a, b, { type: 'orthogonal', arrow: 'end' });
```

***

### connectAll()

> **connectAll**(`definitions`): [`Connection`](Connection.md)[]

Defined in: [Arclace.ts:158](https://github.com/phun-ky/arclace/blob/main/src/Arclace.ts#L158)

Connects many pairs of elements and draws them in one go.

#### Parameters

##### definitions

[`ArcConnectionDefinitionType`](../type-aliases/ArcConnectionDefinitionType.md)[]

#### Returns

[`Connection`](Connection.md)[]

#### Example

```ts
arclace.connectAll([
  { startElement: '#a', stopElement: '#b' },
  { startElement: '#a', stopElement: '#c', dashed: true }
]);
```

***

### destroy()

> **destroy**(): `void`

Defined in: [Arclace.ts:339](https://github.com/phun-ky/arclace/blob/main/src/Arclace.ts#L339)

Removes every connection and the overlay, and stops listening for
changes. The instance can't be used afterwards.

#### Returns

`void`

***

### disconnect()

> **disconnect**(`target`): `void`

Defined in: [Arclace.ts:201](https://github.com/phun-ky/arclace/blob/main/src/Arclace.ts#L201)

Removes connections.

#### Parameters

##### target

`string` \| `Element` \| [`Connection`](Connection.md)

A connection, a connection id, or an element (or
  selector) whose connections should all be removed. Targets that match
  nothing are ignored.

#### Returns

`void`

#### Example

```ts
arclace.disconnect(connection);
arclace.disconnect('my-connection-id');
arclace.disconnect(document.querySelector('#a'));
```

***

### find()

> **find**(`target`): [`Connection`](Connection.md)[]

Defined in: [Arclace.ts:179](https://github.com/phun-ky/arclace/blob/main/src/Arclace.ts#L179)

Returns every connection that starts or stops at an element.

#### Parameters

##### target

[`ArcElementTargetType`](../type-aliases/ArcElementTargetType.md)

#### Returns

[`Connection`](Connection.md)[]

***

### get()

> **get**(`id`): [`Connection`](Connection.md) \| `undefined`

Defined in: [Arclace.ts:172](https://github.com/phun-ky/arclace/blob/main/src/Arclace.ts#L172)

Returns the connection with the given id.

#### Parameters

##### id

`string`

#### Returns

[`Connection`](Connection.md) \| `undefined`

***

### update()

> **update**(): `void`

Defined in: [Arclace.ts:247](https://github.com/phun-ky/arclace/blob/main/src/Arclace.ts#L247)

Remeasures every element and redraws every connection. Called
automatically when `autoUpdate` is on; call it yourself after moving
elements in ways the page can't observe.

#### Returns

`void`
