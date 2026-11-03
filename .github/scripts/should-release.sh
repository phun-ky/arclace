#!/usr/bin/env bash
# Decides whether there is anything to release since the last release tag.
#
# @release-it/conventional-changelog looks at every commit since the last tag,
# so a feat/fix that only touches CI or tooling would still publish a version.
# Here only commits that touch published files count, and only feat/fix/perf/
# revert or breaking changes trigger a release. The version increment itself is
# left to @release-it/conventional-changelog.
#
# Prints the decision and, in GitHub Actions, writes release=true|false to
# $GITHUB_OUTPUT.
set -euo pipefail

# Everything that ends up in the tarball, or shapes the build. The lockfile
# counts because it pins the build tools that produce dist. Tests are not
# published.
published_files=(
  src
  ':(exclude,glob)src/**/__tests__/**'
  vite.config.js
  rollup.config.js
  tsconfig.build.json
  package.json
  package-lock.json
  README.md
  LICENSE
)

decide() {
  echo "$2"
  if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    echo "release=$1" >> "$GITHUB_OUTPUT"
  fi
  exit 0
}

if [[ "$(git rev-parse --is-shallow-repository)" == "true" ]]; then
  echo "error: shallow clone, cannot find the last release tag." >&2
  echo "Check out with fetch-depth: 0." >&2
  exit 1
fi

last_tag=$(git describe --tags --abbrev=0 \
  --match '[0-9]*.[0-9]*.[0-9]*' HEAD 2> /dev/null || true)

# The first release (0.1.0) is published by hand and tagged, so CI never
# releases without a tag to start from
if [[ -z "$last_tag" ]]; then
  decide false "Skipping release: no release tag found. The first release is published by hand."
fi

echo "Commits since $last_tag touching published files:"

# A commit and its revert both after the last tag cancel out, as they do in
# the changelog, so neither counts
range_shas=$(git log --format=%H "$last_tag..HEAD")
cancelled=()

while read -r sha; do
  [[ -z "$sha" ]] && continue
  reverted=$(git log -1 --format=%b "$sha" |
    sed -nE 's/^This reverts commit ([0-9a-f]{40})\.?$/\1/p')
  if [[ -n "$reverted" ]] && grep -qx "$reverted" <<< "$range_shas"; then
    cancelled+=("$sha" "$reverted")
  fi
done <<< "$range_shas"

release=false

while read -r sha; do
  [[ -z "$sha" ]] && continue

  subject=$(git log -1 --format=%s "$sha")
  body=$(git log -1 --format=%b "$sha")
  reason=""

  if [[ " ${cancelled[*]} " == *" $sha "* ]]; then
    echo "  ${sha:0:7} ${subject}  <- reverted in this release, ignored"
    continue
  fi

  if [[ "$subject" =~ ^[A-Za-z]+(\([^\)]*\))?!: ]] ||
    grep -qE '^BREAKING[ -]CHANGE:' <<< "$body"; then
    reason="breaking"
  elif [[ "$subject" =~ ^(feat|fix|perf|revert)(\([^\)]*\))?: ]] ||
    [[ "$subject" =~ ^Revert\ \" ]]; then
    reason="releasable"
  fi

  echo "  ${sha:0:7} ${subject}${reason:+  <- $reason}"
  [[ -n "$reason" ]] && release=true
done < <(git log --no-merges --format=%H "$last_tag..HEAD" -- "${published_files[@]}")

if [[ "$release" == "true" ]]; then
  decide true "Release: found feat/fix/perf/revert or breaking changes."
fi

decide false "Skipping release: no feat/fix/perf/revert or breaking changes to published files since $last_tag."
