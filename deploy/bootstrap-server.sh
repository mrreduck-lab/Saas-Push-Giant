#!/usr/bin/env bash
set -euo pipefail

APP_ROOT=/srv/apps/pushgiant
REPO_URL=git@github.com:mrreduck-lab/Saas-Push-Giant.git
DEPLOY_USER=deploy

if [ "$(id -u)" -ne 0 ]; then
  echo "Run as root" >&2
  exit 1
fi

install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" -m 0750 "$APP_ROOT"
install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" -m 0750 "$APP_ROOT/shared"
install -d -m 0755 /var/www/letsencrypt

if [ ! -d "$APP_ROOT/.git" ]; then
  sudo -u "$DEPLOY_USER" git clone "$REPO_URL" "$APP_ROOT"
else
  sudo -u "$DEPLOY_USER" git -C "$APP_ROOT" fetch --prune origin main
  sudo -u "$DEPLOY_USER" git -C "$APP_ROOT" checkout main
  sudo -u "$DEPLOY_USER" git -C "$APP_ROOT" reset --hard origin/main
fi

if [ ! -f "$APP_ROOT/.env" ]; then
  echo "Create $APP_ROOT/.env from .env.example before first deploy." >&2
  exit 2
fi

chown -R "$DEPLOY_USER:$DEPLOY_USER" "$APP_ROOT"

cp "$APP_ROOT/deploy/nginx/pushgiant.conf" /etc/nginx/sites-available/pushgiant
ln -sfn /etc/nginx/sites-available/pushgiant /etc/nginx/sites-enabled/pushgiant
nginx -t

echo "Bootstrap complete. Issue TLS certificate, then reload nginx and enable GitHub Actions secrets."
