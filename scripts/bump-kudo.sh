#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

KUDO_VERSION=${KUDO_VERSION:-v0.10.0}

cd kudo
git fetch
git checkout "$KUDO_VERSION"
