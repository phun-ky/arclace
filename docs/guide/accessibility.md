# Accessibility

The lines are decorative. The overlay has `aria-hidden="true"`, so screen
readers don't announce lines, arrows or labels, and a line can't take keyboard
focus. Whatever a line tells sighted users must also be in your page's own HTML.

The simplest way is to connect elements whose markup already says how they
relate. Lines between the items of an ordered list show a sequence that a screen
reader reads out as a list of steps:

```html
<ol id="diagram">
  <li class="box" id="a">Build</li>
  <li class="box" id="b">Test</li>
  <li class="box" id="c">Deploy</li>
</ol>
```

```ts
const arclace = new Arclace({ container: '#diagram' });

arclace.connect('#a', '#b', { arrow: 'end' });
arclace.connect('#b', '#c', { arrow: 'end' });
```

Beyond that:

- **Describe other relationships in text,** for example in a table of what
  connects to what, or in a sentence that `aria-describedby` on a focusable
  element points at.
- **Repeat labels in the page.** A label is part of the overlay, so its text
  isn't announced either.
- **Don't tell lines apart by color alone.** Use `dashed`, `arrow` or a label as
  well, and give lines a contrast of at least 3:1 with the background so they
  stay visible with low vision.
- **Motion:** with the stylesheet, `animated` lines stop moving when the user
  asks for reduced motion (`prefers-reduced-motion`).
- **Clickable lines** need the same action on a control in the page; see
  [clickable lines](/guide/styling#clickable-lines).

Arclace doesn't add `aria-describedby` or any other attribute to your elements:
it only changes what it draws.
