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
  <rect class="arc-label-bg" />
  <!-- label -->
  <text class="arc-label">…</text>
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

`style.css` is optional. It adds a background behind labels, hollow anchors and
the `animated` dash animation (turned off with `prefers-reduced-motion`), and
these custom properties:

| Property              | Default                    |
| --------------------- | -------------------------- |
| `--arc-color`         | `currentColor`             |
| `--arc-label-color`   | `currentColor`             |
| `--arc-label-size`    | `12px`                     |
| `--arc-label-bg`      | `--arc-label-halo`, `#fff` |
| `--arc-label-border`  | `none`                     |
| `--arc-label-radius`  | `4px`                      |
| `--arc-label-padding` | `3px 6px`                  |
| `--arc-anchor-fill`   | `#fff`                     |

Set `--arc-label-bg` and `--arc-anchor-fill` to the background behind the lines,
so labels and hollow anchors blend in. `--arc-label-halo` from earlier versions
still works as the label background.

Without the stylesheet the label background is not painted. Style
`.arc-label-bg` like any SVG shape, with `fill`, `stroke` and `rx`, and set its
space with the CSS `padding` property, in lengths such as `px` or `em`, not
percentages. SVG ignores `padding`; Arclace reads it to size the background.

The background is measured when the label is drawn and whenever `setOptions()`
is called. After changing a label's font or padding with CSS alone, such as
toggling a class yourself, call `connection.setOptions({})` to measure again.

## Examples

The demos below use the stylesheet and one connection:

```ts
import { Arclace } from '@phun-ky/arclace';
import '@phun-ky/arclace/style.css';

const arclace = new Arclace({ container: '#diagram' });

arclace.connect('#theme', '#button', { arrow: 'end', label: 'depends on' });
```

### Color one connection

Give the connection a class with `className`, and set `--arc-color` on it:

<StyleDemo variant="important" :options="{ className: 'important' }" />

```ts
arclace.connect('#theme', '#button', {
  arrow: 'end',
  label: 'depends on',
  className: 'important'
});
```

```css
.arc-connection.important {
  --arc-color: #0054f0;
}
```

For a single connection, the `color` option does the same without CSS.

### Dotted line

Round line caps turn zero-length dashes into dots. Set the width with
`strokeWidth`, so the arrow head grows with the line:

<StyleDemo variant="dotted" :options="{ strokeWidth: 3 }" />

```ts
arclace.connect('#theme', '#button', { arrow: 'end', strokeWidth: 3 });
```

```css
.arc-path {
  stroke-dasharray: 0 8;
}
```

### Label typography

A label is SVG `<text>`, so font properties work on it. Fill sets the color,
through `--arc-label-color`:

<StyleDemo variant="typography" />

```css
.arc-label {
  --arc-label-color: #0054f0;
  --arc-label-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
```

Use a monospace font when labels name tokens or code:

<StyleDemo variant="code" :options="{ label: '$color-cta' }" />

```css
.arc-label {
  --arc-label-color: #555;
  font-family: ui-monospace, Menlo, Consolas, monospace;
}
```

### Label badge

Color the background, and round it into a pill with a radius of half its height,
10px at the default label size:

<StyleDemo variant="badge" :options="{ className: 'badge' }" />

```css
.arc-connection.badge {
  --arc-label-bg: #0054f0;
  --arc-label-color: #fff;
  --arc-label-radius: 10px;
}

.arc-connection.badge .arc-label {
  font-weight: 600;
}
```

### Outlined label

<StyleDemo variant="outlined" />

```css
.arc-label-bg {
  --arc-label-border: #c2c2c4;
  --arc-label-radius: 6px;
}
```

### Padding

`--arc-label-padding` takes one to four lengths, like `padding`. In `em` it
grows with the label's font size:

<StyleDemo variant="padding" />

```css
.arc-connection {
  --arc-label-size: 14px;
  --arc-label-padding: 0.4em 0.9em;
  --arc-label-border: #c2c2c4;
}
```

### Style one label

Every custom property inherits from the connection's `<g>`, and each label is
measured from its own styles, so one label can differ from the rest. Target the
connection by the `id` you give it, which is on the `<g>` as `data-arc-id`:

<StyleDemo
  variant="individual"
  :second="{ id: 'theme-card', label: 'surface' }"
/>

```ts
arclace.connect('#theme', '#button', { arrow: 'end', label: 'depends on' });
arclace.connect('#theme', '#card', {
  id: 'theme-card',
  arrow: 'end',
  label: 'surface'
});
```

```css
[data-arc-id='theme-card'] {
  --arc-label-bg: #e5edfd;
  --arc-label-color: #0054f0;
  --arc-label-border: #0054f0;
  --arc-label-radius: 12px;
  --arc-label-padding: 6px 12px;
}
```

To style a group of labels, give their connections the same `className` instead.
From script, set the properties on `connection.element`, then call
`setOptions({})` so a new padding or font is measured:

```ts
connection.element.style.setProperty('--arc-label-padding', '6px 12px');
connection.setOptions({});
```

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
