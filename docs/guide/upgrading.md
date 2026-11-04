---
description:
  How Arclace versions its releases, how deprecations work, and the code to
  change when upgrading to 1.0 from connect-the-things or an earlier 0.x.
---

# Upgrading

How Arclace versions its releases, how deprecations work, and the code changes
for each major release. For what changed and why, read the
[release notes](./releases/index.md) first.

## How versions work

Arclace follows [Semantic Versioning](https://semver.org/):

- **Patch** (1.0.**1**): bug fixes. Nothing to change.
- **Minor** (1.**1**.0): new features. Nothing to change.
- **Major** (**2**.0.0): breaking changes, listed on this page with the code to
  change.

From 1.0, the public API only breaks in a major release: the exports and their
types, the options, the errors each method throws, the class names and data
attributes on the SVG, and the custom properties in `style.css`. With a `^1.0.0`
range, `npm update` never needs a change to your code.

### Deprecations

Deprecating an API isn't a breaking change, so it can happen in any release:

- The API is marked `@deprecated` in its types, naming its replacement and the
  major it will be removed in. Editors show it struck through.
- It keeps working through one full major. Deprecated during 1.x, it can be
  removed in 3.0 at the earliest.
- The release notes for the next major list everything deprecated and removed.

A security fix is the one exception: if a vulnerability can't be fixed without
changing an API, the fix may come in a patch or minor release. See the
[security policy](https://github.com/phun-ky/arclace/blob/main/SECURITY.md#supported-versions).

## Migrating to 1.0 {#migrating-to-1-0}

1.0.0 has the same code as 0.3.0. What it adds is the promise above. How much
there is to change depends on where you start:

| You use                             | What to change                                                                         |
| ----------------------------------- | -------------------------------------------------------------------------------------- |
| `@phun-ky/arclace` 0.3              | Nothing. Update the version.                                                           |
| `@phun-ky/arclace` 0.2              | [From 0.2](#from-0-2): `stop` became `end`, and options are checked.                   |
| `@phun-ky/connect-the-things` (0.1) | [From connect-the-things](#from-connect-the-things) first, then [from 0.2](#from-0-2). |

### Checklist

1. **Install the new package:** `npm i @phun-ky/arclace@^1.0.0`, and remove
   `@phun-ky/connect-the-things` if you have it.
2. **Rename** `ConnectTheThings` to `Arclace`, `CTT` types to `Arc`, and `ctt-`
   classes and custom properties to `arc-`.
3. **Rename `stop` to `end`** everywhere: `stopElement`, `stopSide`,
   `geometry.stop`, `.arc-anchor-stop` and `data-stop-side`. Search for them: an
   old option name is ignored, not rejected.
4. **Check your options** against their types. A wrong type now throws a
   `TypeError`, a value out of range a `RangeError`.
5. **Catch `ArclaceError`** instead of matching on error messages.
6. **Run your tests.** Everything else that changed throws where it used to go
   wrong quietly, so a test run finds it.

The runtime requirements haven't changed: ES modules, and Node.js 22.12 or later
for `require()`.

### From connect-the-things

The package was renamed in 0.2.0. The code is the same; every name changed:

| connect-the-things                          | Arclace                              |
| ------------------------------------------- | ------------------------------------ |
| `@phun-ky/connect-the-things`               | `@phun-ky/arclace`                   |
| `@phun-ky/connect-the-things/style.css`     | `@phun-ky/arclace/style.css`         |
| `class ConnectTheThings`                    | `class Arclace`                      |
| The UMD global `ConnectTheThings`           | The UMD global `Arclace`             |
| Types `CTTOptionsType`, `CTTSideType`, ...  | `ArcOptionsType`, `ArcSideType`, ... |
| Classes `.ctt-connection`, `.ctt-path`, ... | `.arc-connection`, `.arc-path`, ...  |
| Custom properties `--ctt-color`, ...        | `--arc-color`, ...                   |
| The attribute `data-ctt-id`                 | `data-arc-id`                        |
| Generated ids `ctt-_...`                    | `arc-_...`                           |

Before:

```ts no-run
import { ConnectTheThings } from '@phun-ky/connect-the-things';
import '@phun-ky/connect-the-things/style.css';

const ctt = new ConnectTheThings({ container: '#diagram' });
```

```css no-run
.ctt-connection.important {
  --ctt-color: crimson;
}
```

After:

```ts
import { Arclace } from '@phun-ky/arclace';
import '@phun-ky/arclace/style.css';

const arclace = new Arclace({ container: '#diagram' });
```

```css
.arc-connection.important {
  --arc-color: crimson;
}
```

With a script tag, `new ConnectTheThings.ConnectTheThings()` becomes
`new Arclace.Arclace()`, loaded from `https://unpkg.com/@phun-ky/arclace`.

`@phun-ky/connect-the-things` is deprecated on npm and gets no more releases.

### From 0.2 {#from-0-2}

0.3.0 came out of the
[API review for 1.0](https://github.com/phun-ky/arclace/issues/20). Most of it
makes mistakes fail straight away instead of drawing the wrong line.

#### stop is now end

The end of a line is `end` everywhere, as in `arrow: 'end'`:

| 0.2                                  | 0.3 and 1.0                        |
| ------------------------------------ | ---------------------------------- |
| `stopElement` (option, property)     | `endElement`                       |
| `stopSide`                           | `endSide`                          |
| `geometry.stop`, `geometry.stopSide` | `geometry.end`, `geometry.endSide` |
| `.arc-anchor-stop`                   | `.arc-anchor-end`                  |
| `data-stop-side`                     | `data-end-side`                    |

Before:

```ts no-run
arclace.connect('#a', '#b', { stopSide: 'left' });
arclace.connectAll([{ startElement: '#a', stopElement: '#b' }]);
```

After:

```ts
arclace.connect('#a', '#b', { endSide: 'left' });
arclace.connectAll([{ startElement: '#a', endElement: '#b' }]);
```

::: warning An old name is ignored, not rejected Options Arclace doesn't know
are ignored, so `{ stopSide: 'left' }` still draws a line, on the side Arclace
picks. TypeScript reports the old names in object literals; elsewhere, search
your code for `stop`. :::

#### Options are checked

Every option is checked before anything is added. A wrong type throws a
`TypeError`, a value out of range a `RangeError`, and the message names the
option. 0.2 drew both of these lines:

```ts
arclace.connect('#a', '#b', { strokeWidth: '3' }); // throws TypeError
arclace.connect('#a', '#b', { type: 'wavy' }); // throws RangeError
```

The first says `arclace: options.strokeWidth must be a finite number, not "3"`,
the second
`arclace: options.type must be one of "bezier", "straight", "orthogonal", not "wavy"`.

The same goes for `label` (a string), `arrow`, the sides, a negative
`strokeWidth`, `spacing`, `radius` or `offset`, and an empty `id`. On the
instance, `autoUpdate` must be `true`, `false` or `'frame'`, and `defaults`
can't set an `id`, since ids belong to single connections.

#### ArclaceError instead of Error

Failures that aren't about a type or a range throw `ArclaceError`, which is
exported: a selector that matches nothing, an id that is taken, an instance that
was destroyed. It extends `Error`, so existing `catch` blocks keep working. An
invalid selector throws an `ArclaceError` with the browser's `SyntaxError` as
its `cause`, instead of the `SyntaxError` itself.

Before:

```ts no-run
try {
  arclace.connect('#a', '#b', { id: 'a-to-b' });
} catch (error) {
  if (error.message.includes('exists')) reuse();
}
```

After:

```ts
import { ArclaceError } from '@phun-ky/arclace';

try {
  arclace.connect('#a', '#b', { id: 'a-to-b' });
} catch (error) {
  if (error instanceof ArclaceError) reuse();
  else throw error;
}
```

#### find() returns an empty array

`find()` with a selector that matches nothing returns `[]` instead of throwing.
Remove a `try` around it that only caught that case:

```ts
const lines = arclace.find('#maybe-gone'); // [] when nothing matches
```

An invalid selector, or a target that is neither an element nor a string, still
throws.

#### disconnect() checks its target

`disconnect()` ignores `null`, `undefined` and targets that match nothing, as
before, but throws a `TypeError` for any other kind of value, such as a number.
0.2 passed it to `querySelector`, which threw a `SyntaxError`.

#### connectAll() adds all or nothing

`connectAll()` checks every definition before adding any, so a bad definition
leaves the instance as it was. 0.2 kept the lines before the bad one. An id used
twice in the same call is an error too. `createConnections()` destroys the
instance it made when a definition fails, so no overlay is left behind.

#### setOptions() after removing a connection

`connection.setOptions()` throws an `ArclaceError` after the connection was
removed or its instance destroyed, and a `TypeError` when given an `id`. 0.2
ignored both. Keep the connection from `connect()` only while it's on the page,
or check `arclace.get(id)` first.

#### Frozen defaults and geometry

`DEFAULT_CONNECTION_OPTIONS` is frozen. To change the defaults, pass `defaults`
to the instance:

```ts
// Before: DEFAULT_CONNECTION_OPTIONS.strokeWidth = 3;
const arclace = new Arclace({ defaults: { strokeWidth: 3 } });
```

`connection.geometry` is a read-only, frozen object. Copy it to change it.

#### Connections come from connect()

The `Connection` constructor is private in the types: connections come from
`connect()` and `connectAll()`. `ArcConnectionParamsType` and
`ArcOptionalKeysType` are no longer exported. `instanceof Connection` still
works.

#### The path builders check their points

`bezierPath`, `straightPath` and `orthogonalPath` throw a `TypeError` for a
point whose `x` or `y` isn't a finite number, where 0.2 returned path data with
`NaN` in it. `bezierPath` and `orthogonalPath` throw a `RangeError` for an
unknown side.

### From 0.3 {#from-0-3}

Nothing to change. 1.0.0 is 0.3.0 with the promise that nothing breaks before
2.0.
