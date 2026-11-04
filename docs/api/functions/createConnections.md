[@phun-ky/arclace](../index.md) / createConnections

# Function: createConnections()

> **createConnections**(`definitions`, `options?`): [`Arclace`](../classes/Arclace.md)

Defined in: [src/Arclace.ts:563](https://github.com/phun-ky/arclace/blob/main/src/Arclace.ts#L563)

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
    { startElement: '#a', endElement: '#b' },
    { startElement: '#b', endElement: '#c', arrow: 'end' }
  ],
  { defaults: { type: 'orthogonal' } }
);
```
