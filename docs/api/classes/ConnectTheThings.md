[**@phun-ky/connect-the-things**](../README.md)

***

[@phun-ky/connect-the-things](../README.md) / ConnectTheThings

# Class: ConnectTheThings

Defined in: ConnectTheThings.ts:57

Draws and maintains SVG lines between DOM elements.

An instance adds one `<svg class="ctt-svg">` overlay to its container and
draws every connection into it.

## Example

```ts
import { ConnectTheThings } from '@phun-ky/connect-the-things';

const ctt = new ConnectTheThings({ container: '#diagram' });

ctt.connect('#a', '#b', { arrow: 'end', label: 'depends on' });
```

## Constructors

### Constructor

> **new ConnectTheThings**(`options?`): `ConnectTheThings`

Defined in: ConnectTheThings.ts:77

#### Parameters

##### options?

[`CTTOptionsType`](../type-aliases/CTTOptionsType.md) = `{}`

#### Returns

`ConnectTheThings`

## Properties

### container

> `readonly` **container**: `HTMLElement`

Defined in: ConnectTheThings.ts:61

The element the overlay was added to.

***

### svg

> `readonly` **svg**: `SVGSVGElement`

Defined in: ConnectTheThings.ts:66

The SVG overlay all lines are drawn in.

## Accessors

### connections

#### Get Signature

> **get** **connections**(): [`Connection`](Connection.md)[]

Defined in: ConnectTheThings.ts:119

All current connections, in the order they were made.

##### Returns

[`Connection`](Connection.md)[]

## Methods

### clear()

> **clear**(): `void`

Defined in: ConnectTheThings.ts:231

Removes every connection.

#### Returns

`void`

***

### connect()

> **connect**(`startElement`, `stopElement`, `options?`): [`Connection`](Connection.md)

Defined in: ConnectTheThings.ts:135

Connects two elements and draws the line right away.

#### Parameters

##### startElement

[`CTTElementTargetType`](../type-aliases/CTTElementTargetType.md)

The element (or selector) the line starts at.

##### stopElement

[`CTTElementTargetType`](../type-aliases/CTTElementTargetType.md)

The element (or selector) the line stops at.

##### options?

[`CTTConnectionOptionsType`](../type-aliases/CTTConnectionOptionsType.md) = `{}`

Options for this connection, merged over the instance defaults.

#### Returns

[`Connection`](Connection.md)

#### Throws

When an element can't be found or the id is taken.

#### Example

```ts
const connection = ctt.connect(a, b, { type: 'orthogonal', arrow: 'end' });
```

***

### connectAll()

> **connectAll**(`definitions`): [`Connection`](Connection.md)[]

Defined in: ConnectTheThings.ts:158

Connects many pairs of elements and draws them in one go.

#### Parameters

##### definitions

[`CTTConnectionDefinitionType`](../type-aliases/CTTConnectionDefinitionType.md)[]

#### Returns

[`Connection`](Connection.md)[]

#### Example

```ts
ctt.connectAll([
  { startElement: '#a', stopElement: '#b' },
  { startElement: '#a', stopElement: '#c', dashed: true }
]);
```

***

### destroy()

> **destroy**(): `void`

Defined in: ConnectTheThings.ts:339

Removes every connection and the overlay, and stops listening for
changes. The instance can't be used afterwards.

#### Returns

`void`

***

### disconnect()

> **disconnect**(`target`): `void`

Defined in: ConnectTheThings.ts:201

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
ctt.disconnect(connection);
ctt.disconnect('my-connection-id');
ctt.disconnect(document.querySelector('#a'));
```

***

### find()

> **find**(`target`): [`Connection`](Connection.md)[]

Defined in: ConnectTheThings.ts:179

Returns every connection that starts or stops at an element.

#### Parameters

##### target

[`CTTElementTargetType`](../type-aliases/CTTElementTargetType.md)

#### Returns

[`Connection`](Connection.md)[]

***

### get()

> **get**(`id`): [`Connection`](Connection.md) \| `undefined`

Defined in: ConnectTheThings.ts:172

Returns the connection with the given id.

#### Parameters

##### id

`string`

#### Returns

[`Connection`](Connection.md) \| `undefined`

***

### update()

> **update**(): `void`

Defined in: ConnectTheThings.ts:247

Remeasures every element and redraws every connection. Called
automatically when `autoUpdate` is on; call it yourself after moving
elements in ways the page can't observe.

#### Returns

`void`
