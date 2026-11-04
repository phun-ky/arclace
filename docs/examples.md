# Examples

## Playground

Drag the boxes, zoom, and change the options. The lines follow the boxes through
`autoUpdate`, and the zoom is a CSS transform on the container.

<Playground />

The playground connects the boxes once and changes the options of every
connection when a control changes:

```html
<div id="world">
  <div class="node" id="tokens">Base tokens</div>
  <div class="node" id="fonts">Font tokens</div>
  <div class="node" id="theme">Theme</div>
  <div class="node" id="card">Card</div>
  <div class="node" id="docs">Docs</div>
</div>
```

```ts
import { Arclace } from '@phun-ky/arclace';
import '@phun-ky/arclace/style.css';

const world = document.getElementById('world');
const arclace = new Arclace({ container: world });

arclace.connect('#tokens', '#theme', { label: 'accent', arrow: 'end' });
arclace.connect('#fonts', '#card', { label: 'font', dashed: true });
arclace.connect('#theme', '#docs', { startSide: 'bottom', endSide: 'top' });

// When a control changes
for (const connection of arclace.connections) {
  connection.setOptions({ type: 'orthogonal' });
}
```
