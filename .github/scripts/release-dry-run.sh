#!/usr/bin/env bash
# Shows what merging would release: the release guard's decision, then the
# version and changelog release-it plans, with the version a Release-As footer
# asks for. Run it as npm run release:dry-run.
set -euo pipefail

output=$(mktemp)
trap 'rm -f "$output"' EXIT

GITHUB_OUTPUT=$output "$(dirname "$0")/should-release.sh"
version=$(sed -n 's/^version=//p' "$output")

release-it ${version:+"$version"} --ci --dry-run --github.release=false \
  --no-git.requireCleanWorkingDir --no-git.requireUpstream
