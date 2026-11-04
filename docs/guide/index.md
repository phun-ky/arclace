# Getting started

Point it at two elements and it draws a line between them: a curve, a straight
line or an orthogonal "circuit board" line, with optional arrows, labels and
anchors. The lines follow the elements when they move, resize, scroll or get
zoomed.

It's framework agnostic and has zero dependencies. You keep your own HTML for
the boxes; connect-the-things only draws the lines.

## Install

```shell
npm i @phun-ky/connect-the-things
```

ES modules; `require()` needs Node 22.12 or later. A UMD build is available for
script tags (see [Without a bundler](#without-a-bundler)).

## Usage

```html
<div id="diagram">
  <div class="box" id="a">A</div>
  <div class="box" id="b">B</div>
  <div class="box" id="c">C</div>
</div>
```

```ts
import { ConnectTheThings } from '@phun-ky/connect-the-things';
// Optional: label halo, hollow anchors and the dash animation
import '@phun-ky/connect-the-things/style.css';

const ctt = new ConnectTheThings({ container: '#diagram' });

ctt.connect('#a', '#b', { arrow: 'end', label: 'depends on' });
ctt.connect('#a', '#c', { type: 'orthogonal', dashed: true });
```

Or create everything at once:

```ts
import { createConnections } from '@phun-ky/connect-the-things';

const ctt = createConnections(
  [
    { startElement: '#a', stopElement: '#b' },
    { startElement: '#b', stopElement: '#c', label: 'then' }
  ],
  { container: '#diagram', defaults: { type: 'orthogonal', arrow: 'end' } }
);
```

### Without a bundler

```html
<link
  rel="stylesheet"
  href="https://unpkg.com/@phun-ky/connect-the-things/dist/style.css"
/>
<script src="https://unpkg.com/@phun-ky/connect-the-things"></script>
<script>
  const ctt = new ConnectTheThings.ConnectTheThings();

  ctt.connect('#a', '#b');
</script>
```
