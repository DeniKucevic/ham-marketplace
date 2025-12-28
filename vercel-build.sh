#!/bin/bash
# vercel-build.sh

echo "Setting up workspace..."

# First install dependencies
pnpm install --no-frozen-lockfile

# Manually link the shared package if needed
cd packages/shared
pnpm install
pnpm run build
cd ../..

# Now build the web app
cd apps/web
pnpm build