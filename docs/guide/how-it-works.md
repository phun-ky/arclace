# How it works

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
