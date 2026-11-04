# Options

The full reference, with every type, is in the [API](/api/).

## `new Arclace(options?)`

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

## `Connection`

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

## Connection options

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

## Errors

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
