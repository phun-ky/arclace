# @phun-ky/arclace

[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/16333/badge)](https://www.bestpractices.dev/projects/16333)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/phun-ky/arclace/badge)](https://scorecard.dev/viewer/?uri=github.com/phun-ky/arclace)

> Draw SVG lines between DOM elements.

Point it at two elements and it draws a line between them: a curve, a straight
line or an orthogonal "circuit board" line, with optional arrows, labels and
anchors. The lines follow the elements when they move, resize, scroll or get
zoomed.

It's framework agnostic and has zero dependencies. You keep your own HTML for
the boxes; Arclace only draws the lines.

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
npm i @phun-ky/arclace
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
import { Arclace } from '@phun-ky/arclace';
// Optional: label halo, hollow anchors and the dash animation
import '@phun-ky/arclace/style.css';

const arclace = new Arclace({ container: '#diagram' });

arclace.connect('#a', '#b', { arrow: 'end', label: 'depends on' });
arclace.connect('#a', '#c', { type: 'orthogonal', dashed: true });
```

Or create everything at once:

```ts
import { createConnections } from '@phun-ky/arclace';

const arclace = createConnections(
  [
    { startElement: '#a', endElement: '#b' },
    { startElement: '#b', endElement: '#c', label: 'then' }
  ],
  { container: '#diagram', defaults: { type: 'orthogonal', arrow: 'end' } }
);
```

### Without a bundler

```html
<link
  rel="stylesheet"
  href="https://unpkg.com/@phun-ky/arclace/dist/style.css"
/>
<script src="https://unpkg.com/@phun-ky/arclace"></script>
<script>
  const arclace = new Arclace.Arclace();

  arclace.connect('#a', '#b');
</script>
```

## How it works

Each instance adds one `<svg class="arc-svg">` to its container, absolutely
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
  elements that come after it. Set `z-index` on `.arc-svg` to change that.

## API

### `new Arclace(options?)`

| Option       | Type                                      | Default         | Description                                                                                                                                                                             |
| ------------ | ----------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `container`  | `Element \| string`                       | `document.body` | The element the overlay is added to.                                                                                                                                                    |
| `autoUpdate` | `boolean \| 'frame'`                      | `true`          | `true` redraws on window resize, scroll, element resize and DOM/style changes in the container. `'frame'` redraws every animation frame. `false` only redraws when you call `update()`. |
| `defaults`   | [Connection options](#connection-options) | `{}`            | Defaults for every connection made by this instance.                                                                                                                                    |
| `className`  | `string`                                  |                 | Extra classes for the overlay.                                                                                                                                                          |

| Member                          | Description                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `connect(start, end, options?)` | Connects two elements (or selectors) and draws the line. Returns a `Connection`.                              |
| `connectAll(definitions)`       | Connects many `{ startElement, endElement, ...options }` pairs in one go: all of them or, if one fails, none. |
| `get(id)`                       | The connection with that id.                                                                                  |
| `find(element)`                 | Every connection that starts or ends at an element. `[]` when a selector matches nothing.                     |
| `disconnect(target)`            | Removes a connection, a connection by id, or every connection of an element.                                  |
| `clear()`                       | Removes every connection.                                                                                     |
| `update()`                      | Remeasures and redraws everything.                                                                            |
| `destroy()`                     | Removes everything and stops listening for changes.                                                           |
| `connections`                   | All connections, in the order they were made.                                                                 |
| `container`, `svg`              | The container and the overlay.                                                                                |

### `Connection`

| Member                             | Description                                                                                    |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- |
| `setOptions(options)`              | Changes options and redraws.                                                                   |
| `remove()`                         | Removes the connection.                                                                        |
| `update()`                         | Redraws (all connections of the instance, since spreading depends on the others).              |
| `options`                          | The options in effect, with defaults filled in.                                                |
| `geometry`                         | `{ start, end, startSide, endSide, labelPoint, d }` from the last draw, or `null` when hidden. |
| `id`, `startElement`, `endElement` |                                                                                                |
| `element`, `path`                  | The connection's `<g>` and `<path>`, for styling or event listeners.                           |

A connection is hidden while one of its elements is detached or `display: none`,
and shown again when it comes back.

### Connection options

| Option        | Type                                               | Default    | Description                                                                                 |
| ------------- | -------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------- |
| `id`          | `string`                                           | generated  | Unique id, for `get()` and `disconnect()`.                                                  |
| `type`        | `'bezier' \| 'straight' \| 'orthogonal'`           | `'bezier'` | How the line is drawn.                                                                      |
| `startSide`   | `'auto' \| 'top' \| 'right' \| 'bottom' \| 'left'` | `'auto'`   | Side of the start element. `auto` picks the side facing the other element.                  |
| `endSide`     | same as `startSide`                                | `'auto'`   | Side of the end element.                                                                    |
| `arrow`       | `'none' \| 'start' \| 'end' \| 'both'`             | `'none'`   | Arrow heads.                                                                                |
| `label`       | `string`                                           |            | Text in the middle of the line.                                                             |
| `color`       | `string`                                           |            | Line color. Without it, lines use `--arc-color` or the container's text color.              |
| `strokeWidth` | `number`                                           | `2`        | Line width in pixels, `0` or more. Arrows and anchors scale with it.                        |
| `dashed`      | `boolean`                                          | `false`    | Dashed line.                                                                                |
| `animated`    | `boolean`                                          | `false`    | Dashes flowing from start to end. Needs `style.css`.                                        |
| `anchors`     | `boolean`                                          | `false`    | Dots where the line meets the elements.                                                     |
| `className`   | `string`                                           |            | Extra classes for the connection's `<g>`.                                                   |
| `gap`         | `number`                                           | `0`        | Space between the element edge and the line end. Negative moves the end into the element.   |
| `spread`      | `boolean`                                          | `true`     | Spread lines that share a side of an element.                                               |
| `spacing`     | `number`                                           | `16`       | Distance between spread lines, `0` or more. Shrinks to fit the side.                        |
| `curvature`   | `number`                                           | `1`        | `bezier`: how far the curve bulges out. Negative bulges the other way.                      |
| `radius`      | `number`                                           | `8`        | `orthogonal`: corner radius, `0` or more. `0` for sharp corners.                            |
| `offset`      | `number`                                           | `20`       | `orthogonal`: how far the line goes straight out of an element before turning, `0` or more. |

The path builders `bezierPath`, `straightPath` and `orthogonalPath` are also
exported if you want to draw lines between points yourself.

### Errors

Options are checked when they are given, so a mistake fails at once with a
message that names the option:

- **`TypeError`:** a value of the wrong type, for example `strokeWidth: '3'`,
  `label: 0`, or a target that is neither an element nor a selector.
- **`RangeError`:** a value out of range, for example `type: 'wavy'`,
  `startSide: 'middle'` or `radius: -5`.
- **`ArclaceError`:** Arclace can't do what was asked: a selector matches
  nothing or is invalid (with the browser's error as `cause`), an id is taken,
  or the connection or the instance has been removed. It is exported, for
  `instanceof` checks.

Every message starts with `arclace:`. When a call throws, nothing is added, so
the lines already drawn keep working. An option set to `undefined` uses the
default, and option names Arclace doesn't know are ignored.

## Styling

Each connection is rendered as:

```html
<g
  class="arc-connection arc-bezier"
  data-type="bezier"
  data-start-side="right"
  data-end-side="left"
>
  <marker class="arc-marker">…</marker>
  <!-- arrow -->
  <path class="arc-path" />
  <text class="arc-label">…</text>
  <!-- label -->
  <circle class="arc-anchor arc-anchor-start" />
  <!-- anchors -->
  <circle class="arc-anchor arc-anchor-end" />
</g>
```

Lines, arrows and anchors use `currentColor`, so `color` on `.arc-connection`
colors all of them:

```css
.arc-connection {
  color: #6e625e;
}

.arc-connection.important {
  color: #0054f0;
}

.arc-path {
  stroke-width: 3;
}
```

`style.css` is optional. It adds a halo behind labels, hollow anchors and the
`animated` dash animation (turned off with `prefers-reduced-motion`), and these
custom properties:

| Property            | Default        |
| ------------------- | -------------- |
| `--arc-color`       | `currentColor` |
| `--arc-label-color` | `currentColor` |
| `--arc-label-halo`  | `#fff`         |
| `--arc-label-size`  | `12px`         |
| `--arc-anchor-fill` | `#fff`         |

### Clickable lines

The overlay ignores the pointer so it never blocks your page. To make lines
clickable, turn pointer events back on for the paths:

```css
.arc-path {
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
`arclace.update()` yourself or use `autoUpdate: 'frame'`.

## With frameworks

Create the instance after the elements are mounted and destroy it on unmount. In
React:

```tsx
useEffect(() => {
  const arclace = new Arclace({ container: containerRef.current });

  arclace.connect(aRef.current, bRef.current, { arrow: 'end' });

  return () => arclace.destroy();
}, []);
```

## Development

```shell
npm i
npm run dev        # demo at http://localhost:5173
npm test
npm run test:ci    # with coverage thresholds
npm run lint
npm run build      # dist/
npm run check:pack # pack, install and run every example in Chrome
npm run docs:gen   # API docs in docs/api/
npm run docs:dev   # docs site at http://localhost:5173/arclace/
```

## Background

Arclace comes from [SPECCER](https://speccer.dev). While building SPECCER, I
spent most of the time on my own SVG feature for drawing the lines between its
pins and the elements they point at, with bezier curves shaped into curly
brackets.

I then found I could reuse that code to give a better overview of design tokens
and how they relate to one another. The first public proof of concept is
[on CodePen](https://codepen.io/editor/phun-ky/pen/01783ae7-e010-76d8-9429-43a7be9da34f).
After years of other work taking priority, I split the line drawing out into
this package, so it can connect anything on a page.

## Why Arclace?

Arclace combines **arc** and **lace**: the curve of a line, and the act of
threading separate things together.

**Arc** reflects the library's visual character and its origins in
[SPECCER](https://speccer.dev). There, curved SVG lines formed curly brackets
between annotation pins and the HTML elements they described. The same drawing
code later found another use: showing how design tokens relate to each other.

**Lace** captures the broader purpose: joining elements with visible threads,
the way a lace runs through eyelets. Move, resize, scroll or zoom an element,
and the lace follows. Whether a connection curves, runs straight or turns a
corner, it makes a relationship visible.

Together, the words tie the library's drawing roots to its wider role in
diagrams, node editors, flowcharts and annotated interfaces. And it reads
naturally in code:

```js
new Arclace({ container: '#diagram' });
```

Pronounced "ARK-lays".

## License

[MIT](LICENSE) © 2021-2026 Alexander Vassbotn Røyne-Helgesen
