# Roadmap

What Arclace intends to do, and not do, from November 2026 to November 2027.
It's a plan, not a promise: priorities can change, and changes to this file are
made in pull requests like any other. Individual pieces of work are tracked as
[GitHub issues](https://github.com/phun-ky/arclace/issues), grouped in
milestones.

## Planned

### 1.0

Arclace is at `0.x`, so a minor release may still break the API; see the
[security policy](SECURITY.md#supported-versions). Before 1.0:

- **An API review**: validation that throws `TypeError` and `RangeError` for bad
  input, one error class, frozen lookup tables, which exports stay public, and
  property-based tests for the geometry
  ([#20](https://github.com/phun-ky/arclace/issues/20)).
- **Release notes and policies for 1.0**: from then on, no breaking changes
  within a major, deprecations that keep working through one full major, and
  high and critical security fixes for the previous major for 6 months
  ([#21](https://github.com/phun-ky/arclace/issues/21)).

### Project health

- **OpenSSF Best Practices:** the passing badge, then silver and OSPS Baseline
  ([#19](https://github.com/phun-ky/arclace/issues/19)).
- **A second maintainer**, so that pull requests get a review from someone other
  than the author and access to the project doesn't rest on one person; see
  [governance](GOVERNANCE.md#continuity).

## Considered, not scheduled

Ideas that fit the project but have no date. Each would be discussed in an issue
first, and any breaking change after 1.0 waits for the next major with an
upgrading guide.

- **Accessibility guidance**: the overlay is hidden from assistive technology,
  so the docs should say how to convey the relationships it draws in the page's
  own HTML, and whether clickable lines need an accessible alternative
  ([#60](https://github.com/phun-ky/arclace/issues/60)).

## Not planned

- **Runtime dependencies.** The package has none. A new one would be discussed
  in an issue first, declared in `dependencies` and never bundled into the ES
  module build; only the UMD build for script tags may include one.
- **Framework-specific packages.** Arclace works with any framework that gives
  it DOM elements; the [README](README.md#with-frameworks) shows how.
- **Collecting data.** The package doesn't collect, store or send data anywhere.
