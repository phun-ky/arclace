# Contributing to Arclace

First off, thanks for taking the time to contribute! ❤️

All types of contributions are encouraged and valued. See the
[Table of Contents](#table-of-contents) for different ways to help and details
about how this project handles them. Please read the relevant section before
making your contribution. It makes it a lot easier for the maintainer and
smooths out the experience for everyone involved.

> And if you like the project, but don't have time to contribute, that's fine.
> There are other easy ways to support the project and show your appreciation:
>
> - Star the project
> - Mention it in your project's readme
> - Tell your friends and colleagues about it

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [I Have a Question](#i-have-a-question)
- [I Want To Contribute](#i-want-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Contributing Code](#contributing-code)
    - [Architecture](#architecture)
    - [Development](#development)
    - [Coding Style](#coding-style)
    - [Tests](#tests)
    - [Documentation](#documentation)
    - [Developer Certificate of Origin](#developer-certificate-of-origin)
    - [Commits and Pull Requests](#commits-and-pull-requests)
    - [Releases](#releases)
- [Attribution](#attribution)

## Code of Conduct

This project and everyone participating in it is governed by the
[Arclace Code of Conduct](https://github.com/phun-ky/arclace/blob/main/CODE_OF_CONDUCT.md).
By participating, you are expected to uphold this code. Please report
unacceptable behaviour to <code-of-conduct@phun-ky.net>.

## I Have a Question

> If you want to ask a question, we assume that you have read the
> [README](https://github.com/phun-ky/arclace#readme) and the
> [documentation](https://phun-ky.net/arclace/).

Before you ask a question, search the existing
[issues](https://github.com/phun-ky/arclace/issues) that might help you. If you
find a suitable issue and still need clarification, write your question in that
issue.

If you still need to ask a question:

- Open an [issue](https://github.com/phun-ky/arclace/issues/new).
- Provide as much context as you can about what you're running into.
- Provide the version of the package, the browser, and your bundler or
  framework, as relevant.

## I Want To Contribute

> ### Legal Notice
>
> When contributing to this project, you must agree that you have authored 100%
> of the content, that you have the necessary rights to the content and that the
> content you contribute may be provided under the project licence. You confirm
> this on every commit by signing it off under the
> [Developer Certificate of Origin](#developer-certificate-of-origin).

### Reporting Bugs

#### Before Submitting a Bug Report

A good bug report shouldn't leave others needing to chase you up for more
information. Please:

- Make sure that you are using the latest version.
- Check that it's really a bug and not an error on your side, for example an
  element outside the container. Read the
  [README](https://github.com/phun-ky/arclace#readme) first.
- Search the
  [bug tracker](https://github.com/phun-ky/arclace/issues?q=label%3A%22problems%3A+%F0%9F%90%9B+bug%22)
  to see if the bug has already been reported.
- Collect information about the bug:
  - the error message and stack trace
  - the browser and its version, and your bundler or framework
  - how you load the package (`import`, `require` or a script tag)
  - the markup, CSS and options that draw the wrong line
  - whether you can reproduce it reliably, and with older versions

#### How Do I Submit a Good Bug Report?

> Never report security issues, vulnerabilities or bugs that include sensitive
> information in the issue tracker or elsewhere in public. Report them privately
> as described in the [security policy](SECURITY.md#reporting-a-vulnerability).

Bugs are tracked as GitHub issues. If you run into a problem:

- Open an [issue](https://github.com/phun-ky/arclace/issues/new) with the bug
  report template.
- Explain the behaviour you expected and the actual behaviour.
- Describe the steps to reproduce it, ideally as a small page or a CodePen with
  the elements and the `connect()` call that show the problem.
- Add the information you collected above.

Once it's filed, the maintainer labels it and tries to reproduce it. Without a
way to reproduce it, the issue is marked `pending: need repro` until there is
one. A reproduced bug is marked `🐛 needs fix`.

### Suggesting Enhancements

Enhancements, from new features to small improvements, are tracked as
[GitHub issues](https://github.com/phun-ky/arclace/issues).

Before suggesting one:

- Make sure that you are using the latest version, and read the
  [documentation](https://phun-ky.net/arclace/) to see if it's already possible,
  for example with an option or CSS.
- [Search](https://github.com/phun-ky/arclace/issues) for an existing
  suggestion, and add to it instead of opening a new one.
- Check that it fits the [roadmap](ROADMAP.md), including what is not planned.

A good suggestion has a clear title, describes the current behaviour and the
behaviour you'd like instead, and explains why it would be useful to most users.

### Contributing Code

Larger changes are best discussed in an issue first, so the work fits the
[roadmap](ROADMAP.md).

#### Architecture

The package draws SVG lines between DOM elements, with no runtime dependencies:

- **`src/Arclace.ts`** is the `Arclace` class: it adds one `aria-hidden` SVG
  overlay to the container, creates and removes connections, and redraws them
  when something moves (`ResizeObserver`, `MutationObserver`, scroll events, or
  every animation frame with `autoUpdate: 'frame'`). `destroy()` removes the
  overlay and restores the container's `position`.
- **`src/Connection.ts`** is one line: its options, its SVG elements (path,
  arrows, label, anchors) and how it updates them.
- **`src/utils/`** holds the pure parts: `measure.ts` converts element boxes
  into the overlay's coordinates (scroll and CSS transforms included),
  `sides.ts` picks the sides and anchor points, `paths.ts` builds the `bezier`,
  `straight` and `orthogonal` path data, `validate.ts` checks every option
  before anything is added, and `svg.ts`, `geometry.ts`, `id.ts` and
  `resolve-element.ts` are small helpers.
- **`src/errors.ts`** is `ArclaceError`, thrown when Arclace can't do what was
  asked. Arguments of the wrong type throw a `TypeError`, and values out of
  range a `RangeError`.
- **`src/style.css`** is the optional stylesheet, shipped as
  `@phun-ky/arclace/style.css`.
- **The build:** `vite.config.js` builds `dist/arclace.js` (ES module) and
  `dist/arclace.umd.cjs` (UMD, for script tags and CDNs) with source maps, and
  copies the stylesheet; `tsc -p tsconfig.build.json` writes the declarations to
  `dts/`, and `rollup.config.js` bundles them into `dist/arclace.d.ts`.
  `package.json` points `exports`, `main`, `module`, `types`, `unpkg` and
  `jsdelivr` at those files.
- **`scripts/check-pack.mjs`** packs the package, installs it in an empty
  project and loads it from every entry point. It then runs
  **`scripts/check-examples.mjs`**, which runs every code example in the README
  and the docs in headless Chrome against the packed package.
- **`docs/`** is the [docs site](https://phun-ky.net/arclace/) (VitePress), with
  the API reference in `docs/api/` generated from the source with TypeDoc.

#### Development

You need Node.js 24 and npm 11. `require()` of the package is checked on Node.js
22.12, the oldest version the package supports.

```shell-session
npm ci
npm run build
npm test
npm run check:pack
```

| Command                       | What it does                                                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                 | Starts the demo at <http://localhost:5173>                                                                                                        |
| `npm run build`               | Builds `dist`: the ES module, the UMD build, the stylesheet and the types                                                                         |
| `npm test`                    | Runs the tests with Node's test runner and jsdom                                                                                                  |
| `npm run test:ci`             | Runs the tests with coverage thresholds, as CI does                                                                                               |
| `npm run typecheck`           | Type-checks the source and the tests                                                                                                              |
| `npm run lint`                | Lints every file, Markdown included, with ESLint and Prettier                                                                                     |
| `npm run check:pack`          | Packs, installs and loads the package from every entry point, and runs every example in Chrome                                                    |
| `npm run check:bestpractices` | Checks `.bestpractices.json`, and that every file and heading it and `security-insights.yml` link to exists                                       |
| `npm run docs:gen`            | Generates the API reference in `docs/api/`                                                                                                        |
| `npm run docs:check`          | Checks the API documentation comments with TypeDoc, failing on any warning                                                                        |
| `npm run docs:dev`            | Starts the docs site at <http://localhost:5173/arclace/>                                                                                          |
| `npm run docs:build`          | Builds the docs site                                                                                                                              |
| `npm run docs:preview`        | Serves the built docs site                                                                                                                        |
| `npm run release:dry-run`     | Shows whether merging would release, and the planned version and changelog                                                                        |
| `npm run commit`              | Writes a conventional commit message with commitizen                                                                                              |
| `npm run bestpractices:url`   | Prints bestpractices.dev links that propose the answers in `.bestpractices.json` the site doesn't have yet, for the maintainer to review and save |

Run `npm run check:pack` after `npm run build`. It needs Google Chrome
(`google-chrome`); set `CHROME=/path/to/chrome` to use another binary.

#### Coding Style

Code follows the project's [ESLint](https://eslint.org/) configuration
(`eslint-config-phun-ky`), [Prettier](https://prettier.io/) formatting and
TypeScript in strict mode. A contribution must pass `npm run lint`,
`npm run typecheck` and `npm run docs:check` with no errors. All of them run in
CI on every pull request, and a pull request that fails them can't be merged.

#### Tests

- **New functionality must come with tests** in `src/__tests__`, run by
  `npm test` with Node's test runner in jsdom.
- **Bug fixes must come with a regression test** that fails without the fix.
- **Property-based tests** in `src/__tests__/properties.spec.ts` use
  [fast-check](https://fast-check.dev/) to run the geometry and the option
  checks with random input. A change that keeps a rule for every input, such as
  "orthogonal segments are horizontal or vertical", adds a property there. A
  failing property prints the smallest input that breaks it, and the seed to run
  it again.
- **A new option** gets a check in `src/utils/validate.ts` and tests for the
  values it rejects.
- **Packaging and examples** are tested by `npm run check:pack`, which runs in
  CI. A changed example in the README or the docs must still run, and a value in
  a `// 'value'` comment is checked.
- **Coverage must not drop.** `npm run test:ci` fails when the source falls
  below 99% of lines, 100% of functions or 95% of branches, and CI uploads a
  coverage report for every pull request.

#### Documentation

- Public functions, classes and options have TSDoc comments, which TypeDoc turns
  into the API reference. CI fails on any TypeDoc warning.
- `docs/api/` is committed. After changing a documentation comment or an export,
  run `npm run docs:gen` and commit the result; CI fails if it's out of date.
- A change in behaviour updates the README and the guide in `docs/guide/` in the
  same pull request.

#### Developer Certificate of Origin

Every commit must be signed off under the
[Developer Certificate of Origin](https://developercertificate.org/) (DCO): a
statement that you wrote the change, or otherwise have the right to submit it
under the project's licence. You agree to it by adding a `Signed-off-by` line
with your name and email to the commit message:

```text
Signed-off-by: Your Name <you@example.com>
```

- **Per commit:** `git commit -s` adds the line for you.
- **Always:** `npm ci` sets `core.hooksPath` to `.githooks`, and the hook in
  `.githooks/prepare-commit-msg` adds the line to every commit, including those
  made by `npm run commit` or your editor.
- **Forgot?** Sign off every commit on your branch and push again:
  `git rebase --signoff main` then `git push --force-with-lease`.

The DCO check on every pull request fails if a commit isn't signed off. Commits
by Dependabot are exempt.

#### Commits and Pull Requests

- Commits follow [Conventional Commits](https://www.conventionalcommits.org/)
  (`feat:`, `fix:`, `docs:`, ...). `npm run commit` helps write them. Releases
  and the changelog are generated from them (see [Releases](#releases)), so pick
  the type that matches the change. A breaking change needs a `type!:` and a
  `BREAKING CHANGE:` footer that says what to change.
- Before 1.0, a breaking change is released as a minor version (0.2 to 0.3).
- Deprecating an API isn't a breaking change, so it can land in any release.
  Mark it `@deprecated` with its replacement and the version it will be removed
  in. From 1.0 on, it keeps working through one full major: deprecated during
  1.x or at 2.0, it can be removed in 3.0 at the earliest.
- Open a pull request against `main`. The Checks workflow lints, type-checks,
  tests, builds, packs, runs the examples, and checks the API docs, the docs
  site and the OpenSSF answers; dependency review, CodeQL and the DCO check also
  run. All of them must pass.

#### Releases

The maintainer merges pull requests, and releases follow automatically from
GitHub Actions:

1. When a merged pull request changes what gets published, the publish workflow
   checks whether there is anything to release: a `feat`, `fix`, `perf` or
   `revert` commit, or a breaking change, that touches the published files.
   Other changes wait for the next release.
2. If so, it checks the runtime dependencies with `npm audit`, and release-it
   picks the version from the commits, updates the changelog, builds, checks and
   packs the package, regenerates the API reference, and publishes it to npm
   with trusted publishing and signed provenance.
3. The release commit and tag go to `main`, and a GitHub release is created with
   a software bill of materials attached.

Every push to `main` also rebuilds and deploys the docs site.
`npm run release:dry-run` shows what a merge would release.

## Attribution

This guide is based on
[contributing-gen](https://github.com/bttger/contributing-gen).
