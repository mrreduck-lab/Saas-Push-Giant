#!/usr/bin/env sh
set -eu

APP_DIR="${1:-/srv/apps/saas-push-giant}"
REPO_URL="${REPO_URL:-https://github.com/mrreduck-lab/Saas-Push-Giant.git}"

mkdir -p "$APP_DIR"
if [ ! -d "$APP_DIR/.git" ]; then
  git clone "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"
git fetch origin main
git checkout main
git reset --hard origin/main

if [ ! -f .env ]; then
  cp deploy/env.production.example .env
  echo "Created $APP_DIR/.env. Fill real values before first deploy."
fi

echo "Bootstrap complete: $APP_DIR"
