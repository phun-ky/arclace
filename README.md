# @phun-ky/connect-the-things

> Draw SVG lines between DOM elements.

Point it at two elements and it draws a line between them: a curve, a straight
line or an orthogonal "circuit board" line, with optional arrows, labels and
anchors. The lines follow the elements when they move, resize, scroll or get
zoomed.

It's framework agnostic and has zero dependencies. You keep your own HTML for
the boxes; connect-the-things only draws the lines.

- **Three line types**: `bezier`, `straight` and `orthogonal` (with rounded
  corners)
- **Automatic sides**: lines leave and enter on the sides that face each other,
  or on sides you pick
- **Spreading**: several lines on the same side of an element are spread out and
  ordered so they don't cross
- **Arrows, labels, anchors, dashed and animated lines**
- **Keeps itself in sync** with resizes, scrolling and DOM/style changes, or on
  every frame if you want
- **Works in scrolled and CSS-transformed containers**, so it fits pan/zoom
  canvases
- **Styled with CSS**: everything uses `currentColor` and plain class names

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

## How it works

Each instance adds one `<svg class="ctt-svg">` to its container, absolutely
positioned over the container's content, and draws every line into it. The
overlay doesn't block clicks (`pointer-events: none`).

- Put all the elements you connect inside the container. If the container is
  `position: static` it is changed to `position: relative` so the overlay
  scrolls and clips with it (and changed back on `destroy()`). The default
  container is `document.body`.
- Positions are measured relative to the overlay itself, so lines stay correct
  in scrolled containers and when the container is scaled with CSS transforms
  (for example by a pan/zoom library).
- The overlay is the container's first child, so it is painted below positioned
  elements that come after it. Set `z-index` on `.ctt-svg` to change that.

## API

### `new ConnectTheThings(options?)`

| Option       | Type                                      | Default         | Description                                                                                                                                                                             |
| ------------ | ----------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `container`  | `Element \| string`                       | `document.body` | The element the overlay is added to.                                                                                                                                                    |
| `autoUpdate` | `boolean \| 'frame'`                      | `true`          | `true` redraws on window resize, scroll, element resize and DOM/style changes in the container. `'frame'` redraws every animation frame. `false` only redraws when you call `update()`. |
| `defaults`   | [Connection options](#connection-options) | `{}`            | Defaults for every connection made by this instance.                                                                                                                                    |
| `className`  | `string`                                  |                 | Extra classes for the overlay.                                                                                                                                                          |

| Member                           | Description                                                                      |
| -------------------------------- | -------------------------------------------------------------------------------- |
| `connect(start, stop, options?)` | Connects two elements (or selectors) and draws the line. Returns a `Connection`. |
| `connectAll(definitions)`        | Connects many `{ startElement, stopElement, ...options }` pairs in one go.       |
| `get(id)`                        | The connection with that id.                                                     |
| `find(element)`                  | Every connection that starts or stops at an element.                             |
| `disconnect(target)`             | Removes a connection, a connection by id, or every connection of an element.     |
| `clear()`                        | Removes every connection.                                                        |
| `update()`                       | Remeasures and redraws everything.                                               |
| `destroy()`                      | Removes everything and stops listening for changes.                              |
| `connections`                    | All connections, in the order they were made.                                    |
| `container`, `svg`               | The container and the overlay.                                                   |

### `Connection`

| Member                              | Description                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------------ |
| `setOptions(options)`               | Changes options and redraws.                                                                     |
| `remove()`                          | Removes the connection.                                                                          |
| `update()`                          | Redraws (all connections of the instance, since spreading depends on the others).                |
| `options`                           | The options in effect, with defaults filled in.                                                  |
| `geometry`                          | `{ start, stop, startSide, stopSide, labelPoint, d }` from the last draw, or `null` when hidden. |
| `id`, `startElement`, `stopElement` |                                                                                                  |
| `element`, `path`                   | The connection's `<g>` and `<path>`, for styling or event listeners.                             |

A connection is hidden while one of its elements is detached or `display: none`,
and shown again when it comes back.

### Connection options

| Option        | Type                                               | Default    | Description                                                                    |
| ------------- | -------------------------------------------------- | ---------- | ------------------------------------------------------------------------------ |
| `id`          | `string`                                           | generated  | Unique id, for `get()` and `disconnect()`.                                     |
| `type`        | `'bezier' \| 'straight' \| 'orthogonal'`           | `'bezier'` | How the line is drawn.                                                         |
| `startSide`   | `'auto' \| 'top' \| 'right' \| 'bottom' \| 'left'` | `'auto'`   | Side of the start element. `auto` picks the side facing the other element.     |
| `stopSide`    | same as `startSide`                                | `'auto'`   | Side of the stop element.                                                      |
| `arrow`       | `'none' \| 'start' \| 'end' \| 'both'`             | `'none'`   | Arrow heads.                                                                   |
| `label`       | `string`                                           |            | Text in the middle of the line.                                                |
| `color`       | `string`                                           |            | Line color. Without it, lines use `--ctt-color` or the container's text color. |
| `strokeWidth` | `number`                                           | `2`        | Line width in pixels. Arrows and anchors scale with it.                        |
| `dashed`      | `boolean`                                          | `false`    | Dashed line.                                                                   |
| `animated`    | `boolean`                                          | `false`    | Dashes flowing from start to stop. Needs `style.css`.                          |
| `anchors`     | `boolean`                                          | `false`    | Dots where the line meets the elements.                                        |
| `className`   | `string`                                           |            | Extra classes for the connection's `<g>`.                                      |
| `gap`         | `number`                                           | `0`        | Space between the element edge and the line end.                               |
| `spread`      | `boolean`                                          | `true`     | Spread lines that share a side of an element.                                  |
| `spacing`     | `number`                                           | `16`       | Distance between spread lines. Shrinks to fit the side.                        |
| `curvature`   | `number`                                           | `1`        | `bezier`: how far the curve bulges out.                                        |
| `radius`      | `number`                                           | `8`        | `orthogonal`: corner radius. `0` for sharp corners.                            |
| `offset`      | `number`                                           | `20`       | `orthogonal`: how far the line goes straight out of an element before turning. |

The path builders `bezierPath`, `straightPath` and `orthogonalPath` are also
exported if you want to draw lines between points yourself.

## Styling

Each connection is rendered as:

```html
<g
  class="ctt-connection ctt-bezier"
  data-type="bezier"
  data-start-side="right"
  data-stop-side="left"
>
  <marker class="ctt-marker">…</marker>
  <!-- arrow -->
  <path class="ctt-path" />
  <text class="ctt-label">…</text>
  <!-- label -->
  <circle class="ctt-anchor ctt-anchor-start" />
  <!-- anchors -->
  <circle class="ctt-anchor ctt-anchor-stop" />
</g>
```

Lines, arrows and anchors use `currentColor`, so `color` on `.ctt-connection`
colors all of them:

```css
.ctt-connection {
  color: #6e625e;
}

.ctt-connection.important {
  color: #0054f0;
}

.ctt-path {
  stroke-width: 3;
}
```

`style.css` is optional. It adds a halo behind labels, hollow anchors and the
`animated` dash animation (turned off with `prefers-reduced-motion`), and these
custom properties:

| Property            | Default        |
| ------------------- | -------------- |
| `--ctt-color`       | `currentColor` |
| `--ctt-label-color` | `currentColor` |
| `--ctt-label-halo`  | `#fff`         |
| `--ctt-label-size`  | `12px`         |
| `--ctt-anchor-fill` | `#fff`         |

### Clickable lines

The overlay ignores the pointer so it never blocks your page. To make lines
clickable, turn pointer events back on for the paths:

```css
.ctt-path {
  pointer-events: visibleStroke;
  cursor: pointer;
}
```

```ts
connection.path.addEventListener('click', () => console.log(connection.id));
```

## Keeping lines in sync

With the default `autoUpdate: true`, lines are redrawn (at most once per frame)
when:

- the window resizes or anything scrolls
- the container or a connected element changes size
- elements are added or removed in the container, or their `style`, `class` or
  `hidden` attributes change. Dragging by setting `style.left`/`top` or
  `style.transform` just works.

For movement it can't observe, like CSS transitions and animations, either call
`ctt.update()` yourself or use `autoUpdate: 'frame'`.

## With frameworks

Create the instance after the elements are mounted and destroy it on unmount. In
React:

```tsx
useEffect(() => {
  const ctt = new ConnectTheThings({ container: containerRef.current });

  ctt.connect(aRef.current, bRef.current, { arrow: 'end' });

  return () => ctt.destroy();
}, []);
```

## Development

```shell
npm i
npm run dev        # demo at http://localhost:5173
npm test
npm run lint
npm run build      # dist/
npm run docs:gen   # API docs in docs/api/
```

## License

[MIT](LICENSE) © 2021-2026 Alexander Vassbotn Røyne-Helgesen
