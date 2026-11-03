[**@phun-ky/connect-the-things**](../README.md)

***

[@phun-ky/connect-the-things](../README.md) / createConnections

# Function: createConnections()

> **createConnections**(`definitions`, `options?`): [`ConnectTheThings`](../classes/ConnectTheThings.md)

Defined in: [ConnectTheThings.ts:479](https://github.com/phun-ky/connect-the-things/blob/7184f61d9dad0abc53416d24c7ff878fbf2cb48d/src/ConnectTheThings.ts#L479)

Creates a [ConnectTheThings](../classes/ConnectTheThings.md) instance and connects the given pairs.

## Parameters

### definitions

[`CTTConnectionDefinitionType`](../type-aliases/CTTConnectionDefinitionType.md)[]

### options?

[`CTTOptionsType`](../type-aliases/CTTOptionsType.md)

## Returns

[`ConnectTheThings`](../classes/ConnectTheThings.md)

## Example

```ts
import { createConnections } from '@phun-ky/connect-the-things';

const ctt = createConnections(
  [
    { startElement: '#a', stopElement: '#b' },
    { startElement: '#b', stopElement: '#c', arrow: 'end' }
  ],
  { defaults: { type: 'orthogonal' } }
);
```
