# Styling

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

## Clickable lines

The overlay ignores the pointer so it never blocks your page. To make lines
clickable, turn pointer events back on for the paths:

```css
.arc-path {
  pointer-events: visibleStroke;
  cursor: pointer;
}
```

A line can't take keyboard focus and is hidden from screen readers, so make a
click on it a shortcut for a control that is in your page anyway, such as a
button:

```html
<div id="diagram">
  <div class="box" id="a">A</div>
  <div class="box" id="b">B</div>
  <div class="box" id="c">C</div>
  <button type="button" id="details">Show A to B</button>
</div>
```

```ts
const showDetails = () => console.log(connection.id);

document.querySelector('#details')?.addEventListener('click', showDetails);
// The same action for pointer users who click the line
connection.path.addEventListener('click', showDetails);
```

See [accessibility](/guide/accessibility) for the rest.
