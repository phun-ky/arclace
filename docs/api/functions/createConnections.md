[@phun-ky/arclace](../index.md) / createConnections

# Function: createConnections()

> **createConnections**(`definitions`, `options?`): [`Arclace`](../classes/Arclace.md)

Defined in: [Arclace.ts:479](https://github.com/phun-ky/arclace/blob/main/src/Arclace.ts#L479)

Creates a [Arclace](../classes/Arclace.md) instance and connects the given pairs.

## Parameters

### definitions

[`ArcConnectionDefinitionType`](../type-aliases/ArcConnectionDefinitionType.md)[]

### options?

[`ArcOptionsType`](../type-aliases/ArcOptionsType.md)

## Returns

[`Arclace`](../classes/Arclace.md)

## Example

```ts
import { createConnections } from '@phun-ky/arclace';

const arclace = createConnections(
  [
    { startElement: '#a', stopElement: '#b' },
    { startElement: '#b', stopElement: '#c', arrow: 'end' }
  ],
  { defaults: { type: 'orthogonal' } }
);
```
