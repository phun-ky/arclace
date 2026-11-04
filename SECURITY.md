# Security Policy

`@phun-ky/connect-the-things` has no runtime dependencies. How development
dependencies are chosen, tracked and kept clear of known vulnerabilities is
described under [Dependencies](#dependencies).

## Supported Versions

| Release                  | Supported |
| ------------------------ | --------- |
| The latest `0.x` release | ✅        |
| Earlier `0.x` releases   | ❌        |

- **Only the latest release gets fixes.** A fix is released as a new version; to
  get it, upgrade to the newest release.
- **Before 1.0, a minor release may break your code.** While the version is
  `0.x`, breaking changes bump the minor version (0.1 to 0.2) and fixes and
  features bump the patch version. The release notes say what changed.
- **Security comes first.** If a vulnerability can't be fixed without changing
  an API, the fix changes it, and the advisory and the release notes say what
  changed and why.

## Reporting a Vulnerability

Report vulnerabilities privately, either with GitHub's
[private vulnerability reporting](https://github.com/phun-ky/connect-the-things/security/advisories/new)
or by email to <security@phun-ky.net>. Please don't open a public issue for a
security problem.

## How Reports Are Handled

1. **Acknowledgement:** you'll get a reply within 7 days confirming the report
   was received.
2. **Assessment:** the maintainer reproduces the issue and judges its severity,
   and may ask you for details.
3. **Fix:** a fix is developed in a private GitHub security advisory and
   released as a new version. The aim is a fix within 30 days for serious
   issues.
4. **Disclosure:** the advisory is published when the fix is released, with a
   CVE where one applies. Please keep the issue private until then.
5. **Credit:** reporters are credited in the advisory and the release notes,
   unless they ask to stay anonymous.

## Security Expectations

`connect-the-things` draws SVG lines between elements you give it. It reads
their positions and writes one SVG overlay into the container you choose.

What you can rely on:

- **No data collection and no network access.** The package sends nothing
  anywhere and loads nothing.
- **No HTML from options.** Labels are set as text (`textContent`), never as
  HTML. Class names, colours and ids are set as attributes, classes and the
  `color` style, so an option can't add elements or scripts to the page.
- **No dynamic code.** No `eval`, `new Function` or `innerHTML`.
- **It only changes what it draws.** Besides its overlay, it changes one thing
  in your page: a container other than `document.body` with `position: static`
  gets `position: relative`, and `destroy()` restores it.
- **Releases are traceable** from 0.1.1 on (see below).

What you can't rely on:

- **Sanitising your selectors.** Strings you pass as elements or containers are
  CSS selectors for `document.querySelector`. Don't build them from untrusted
  input.
- **Label content.** A label is shown as given. Text from an untrusted source
  can't run as code, but it is shown to your users as it is.
- **Unguessable ids.** Generated connection ids use `Math.random()`. They tell
  connections apart; they are not secrets.

## Verifying Releases

Releases are published from GitHub Actions with npm trusted publishing, and
carry a signed provenance attestation (Sigstore) that links them to the commit
and workflow run that built them. The exception is 0.1.0, the first release,
which was published by hand: it has npm's registry signatures, but no
provenance.

To verify the packages you've installed:

```shell
npm audit signatures
```

The provenance must name the repository `phun-ky/connect-the-things` and the
workflow `.github/workflows/publish.yml`. The package's page on npm shows this
under "Provenance", and
`npm view @phun-ky/connect-the-things@<version> dist.attestations` lists the
attestations.

Each GitHub release also has a software bill of materials attached, in CycloneDX
format (`connect-the-things-<version>.cdx.json`), listing the runtime
dependencies, which today are none.

## Dependencies

**Choosing them.** The package has no runtime dependencies, and a new one is
discussed in an issue first. It must be widely used, actively maintained and
under an OSI-approved licence compatible with MIT; strong copyleft licences
(GPL, AGPL) are not accepted. A runtime dependency is declared in `dependencies`
and never bundled into the ES module build; only the UMD build for script tags
may include it. Development dependencies follow the same rules, judged more
loosely.

**Obtaining them.** Packages come only from the npm registry, with exact
versions locked in `package-lock.json` and installed with `npm ci` in CI. GitHub
Actions are pinned to commit SHAs.

**Tracking them.** Dependabot proposes version updates weekly, once a release is
14 days old, and security updates as soon as an advisory is published. Every
pull request runs
[dependency review](https://github.com/phun-ky/connect-the-things/blob/main/.github/workflows/dependency-review.yml),
and every release runs `npm audit` on runtime dependencies first.

**Fixing known vulnerabilities.** Findings are checked against the GitHub
Advisory Database:

| Finding                    | Where                  | What happens                                                                                     |
| -------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------ |
| Critical or high           | Runtime dependency     | Blocks merging (dependency review) and releasing (`npm audit`); fixed and released within 7 days |
| Critical or high           | Development dependency | Blocks merging when introduced; an existing one is fixed within 30 days                          |
| Moderate or low            | Any dependency         | Fixed with the next update, within 90 days, or as soon as a fix exists                           |
| Licence outside the policy | New dependency         | Not merged                                                                                       |

**Accepted exceptions.** A high or critical vulnerability that can't be fixed
yet and can't be exploited through this project may be allowed in dependency
review. Each one is listed here with the reason, and removed as soon as a fix is
reachable. There are none today.

## Code Scanning

CodeQL analyses every pull request and every push to `main`. The ruleset on
`main` blocks merging while CodeQL reports an error, or a security alert of high
or critical severity. OpenSSF Scorecard runs on every push to `main` and weekly.

## Secrets

The project keeps as few secrets as possible:

| Secret          | Used by       | For                                                   |
| --------------- | ------------- | ----------------------------------------------------- |
| `GH_TOKEN`      | `publish.yml` | Pushing release commits and tags, and GitHub releases |
| `CODECOV_TOKEN` | `check.yml`   | Uploading coverage reports                            |

Publishing to npm needs no secret: it uses short-lived OIDC tokens from GitHub.

- **Storage:** secrets are kept only as encrypted GitHub Actions secrets, never
  in the repository. Secret scanning with push protection blocks commits that
  contain one.
- **Access:** only the maintainer can view or change them, and they are not
  available to workflows run from forks.
- **Rotation:** at least once a year, and immediately if one may have been
  exposed.
