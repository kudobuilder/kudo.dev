#!/usr/bin/env bash
cd /app
yarn install
yarn docs:lint
yarn docs:dev
