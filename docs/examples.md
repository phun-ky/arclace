# Examples

## Playground

Drag the boxes, zoom, and change the options. The lines follow the boxes through
`autoUpdate`, and the zoom is a CSS transform on the container.

<Playground />

The playground connects the boxes once and changes the options of every
connection when a control changes:

```ts
import { ConnectTheThings } from '@phun-ky/connect-the-things';
import '@phun-ky/connect-the-things/style.css';

const ctt = new ConnectTheThings({ container: world });

ctt.connect('#tokens', '#theme', { label: 'accent', arrow: 'end' });
ctt.connect('#fonts', '#card', { label: 'font', dashed: true });
ctt.connect('#theme', '#docs', { startSide: 'bottom', stopSide: 'top' });

// When a control changes
for (const connection of ctt.connections) {
  connection.setOptions({ type: 'orthogonal' });
}
```
