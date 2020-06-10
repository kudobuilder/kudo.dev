#!/usr/bin/env bash
cd /app
yarn install
yarn ${1:-docs:dev}
