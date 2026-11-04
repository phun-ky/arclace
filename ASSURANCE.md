# Assurance Case

Why the [security expectations](SECURITY.md#security-expectations) of
`@phun-ky/arclace` hold, what they rest on, and where they don't hold yet. It is
kept short because the package is small: a class that draws SVG into one
container, no runtime dependencies, and a build and release pipeline.

## What is being protected

- **Users of the package and their pages:** Arclace must draw lines and change
  nothing else: no network access, no HTML or scripts added from options, and no
  changes to the page outside its own overlay, apart from the container's
  `position` (restored by `destroy()`).
- **The published package:** what users install from npm or load from a CDN must
  be exactly what this repository built, with nothing added on the way.
- **The repository and its release pipeline:** the source, the workflows, the
  docs site and the credentials that publish releases.

## Threat model

| Threat                                | Where                                    | How it is countered                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Script or markup injected via options | Labels, class names, colours, ids        | Labels are set with `textContent`; class names, ids and path data are set as attributes and the colour as the `color` style. No `innerHTML`, `eval` or `new Function` anywhere in the package                                                                                                                                                                         |
| A tampered or substituted release     | npm, CDNs                                | Releases are built and published only from GitHub Actions with npm trusted publishing (no long-lived token) and carry Sigstore-signed provenance, verifiable with `npm audit signatures`; each GitHub release has a CycloneDX SBOM                                                                                                                                    |
| A malicious or vulnerable dependency  | Development dependencies, GitHub Actions | No runtime dependencies; `npm audit` blocks releases on high or critical runtime advisories; dependency review blocks pull requests; Dependabot proposes updates weekly, after a 14-day cooldown; Actions are pinned to commit SHAs                                                                                                                                   |
| A malicious change to the source      | Pull requests                            | Pull requests only, with required checks (tests, lint, packaging, dependency review, CodeQL, the DCO) on `main`; no force pushes or deletion of `main`                                                                                                                                                                                                                |
| Abuse of CI credentials               | Workflows                                | Read-only default permissions in every workflow, write only per job; pull requests from forks get no secrets; no untrusted value is interpolated into a script; secret scanning with push protection; the docs site deploys only from `main` to the `github-pages` environment                                                                                        |
| Unexpected input                      | Callers of `connect()` and the options   | Every option is checked against an allowlist of types, values and ranges before anything is added: wrong types throw a `TypeError`, values out of range a `RangeError`, and elements that can't be found an `ArclaceError`. A call that throws adds nothing, so it can't break the lines already drawn. Property-based tests feed random values to every option in CI |

## Trust boundaries

1. **Caller to Arclace:** the elements, selectors and options come from the
   application, which may pass user input. Arclace resolves selectors with
   `document.querySelector`, reads element boxes, and writes only into its own
   SVG overlay and the container's `position`. It never parses options as HTML
   or code, and it makes no network requests.
2. **Repository to npm:** only the publish workflow, after a merge to `main` and
   the release guard, can publish, through npm trusted publishing.
3. **npm or CDN to the user:** the user's package manager or browser fetches the
   package; provenance and the npm registry's integrity hashes link it to this
   repository and build.

## Secure design principles

- **Economy of mechanism:** one overlay per instance, one SVG group per line,
  path data built by pure functions in `src/utils/`.
- **Fail-safe defaults:** an invalid option, a selector that matches nothing, a
  target that isn't an element or a duplicate id throws before anything is
  added, instead of drawing something unexpected; the defaults are frozen; the
  overlay ignores the pointer, so it can't block the page.
- **Least privilege:** the package touches only its overlay and the container's
  `position`; CI tokens are read-only by default and write only where a job
  needs it.
- **Open design:** everything is public, including the release pipeline and this
  document.
- **No dynamic code:** no `eval`, `new Function`, `innerHTML` or loading of
  code.
- **Minimal dependencies:** no runtime dependencies at all.

## Common weaknesses countered

| Weakness                                           | Status                                                                                                                                                                                    |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CWE-79 cross-site scripting                        | Labels are text, never HTML; every other option is set as an attribute, a class or the `color` style                                                                                      |
| CWE-94 code injection                              | No dynamic code anywhere in the package                                                                                                                                                   |
| CWE-1321 prototype pollution                       | Options are merged with object spread into new objects, never deep-merged or assigned by path; lookup tables are frozen, and sides are checked against an allowlist before they index one |
| CWE-20 improper input validation                   | Every option, element, selector and id is checked against an allowlist; the public path builders check their points and sides                                                             |
| CWE-829 inclusion from an untrusted control sphere | No runtime dependencies, provenance on releases, Actions pinned to SHAs                                                                                                                   |
| CWE-494 download of code without integrity check   | npm verifies integrity hashes; releases carry signed provenance                                                                                                                           |

## Known gaps

- **Selectors:** strings are passed to `document.querySelector` as they are.
  Don't build them from untrusted input; see the
  [security expectations](SECURITY.md#security-expectations).
- **Assistive technology:** the overlay is `aria-hidden`, so what the lines show
  must also be in the page's own HTML
  ([#60](https://github.com/phun-ky/arclace/issues/60)).
- **One maintainer:** pull requests by the maintainer get no second review, and
  access to the repository and the package rests on one person; see
  [governance](GOVERNANCE.md#continuity).
- **Tags are not signed;** releases are verified through npm provenance instead.
- **0.1.0 and 0.2.0 were published by hand**, so they have npm's registry
  signatures but no provenance; see
  [verifying releases](SECURITY.md#verifying-releases).
