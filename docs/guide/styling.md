# Styling

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

## Clickable lines

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
