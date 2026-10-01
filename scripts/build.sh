#!/bin/bash

set -e

echo "Syncing package-lock version..."
npm install --package-lock-only

echo "Installing dependencies..."
npm ci

echo "Updating package info..."
sh scripts/update-pkg.sh

echo "Formatting code..."
npx biome format --write .

echo "Generating banner..."
npx tsx banner.ts

echo "Building with tsup..."
npx tsup

echo "Cleaning up temporary files..."
npx rimraf banner.txt

echo "Build complete! Your project is ready in the dist/ folder 🚀"
