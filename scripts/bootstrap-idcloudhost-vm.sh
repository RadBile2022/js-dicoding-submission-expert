#!/usr/bin/env bash
set -euo pipefail

# One-time bootstrap for an Ubuntu/Debian IDCloudHost VM.
# Run from the repository after it has been cloned on the VM:
#   sudo DOMAIN=api.example.com LETSENCRYPT_EMAIL=you@example.com \
#     DB_PASSWORD='...' ACCESS_TOKEN_KEY='...' REFRESH_TOKEN_KEY='...' \
#     bash scripts/bootstrap-idcloudhost-vm.sh
#
# If DOMAIN is omitted, the script uses <public-ip>.sslip.io as a public hostname.

APP_DIR="${APP_DIR:-$(pwd)}"
APP_USER="${APP_USER:-${SUDO_USER:-$USER}}"
APP_PORT="${APP_PORT:-3000}"
DB_USER="${DB_USER:-forumapi}"
DB_NAME="${DB_NAME:-forumapi}"
DB_PASSWORD="${DB_PASSWORD:-}"
ACCESS_TOKEN_KEY="${ACCESS_TOKEN_KEY:-}"
REFRESH_TOKEN_KEY="${REFRESH_TOKEN_KEY:-}"
LETSENCRYPT_EMAIL="${LETSENCRYPT_EMAIL:-}"
DOMAIN="${DOMAIN:-}"

fail() { echo "ERROR: $*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || fail "jalankan script ini dengan sudo/root"
[[ "$DB_USER" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || fail "DB_USER hanya boleh huruf/angka/underscore"
[[ "$DB_NAME" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || fail "DB_NAME hanya boleh huruf/angka/underscore"
[ -n "$DB_PASSWORD" ] || fail "DB_PASSWORD wajib diisi"
[ -n "$ACCESS_TOKEN_KEY" ] || fail "ACCESS_TOKEN_KEY wajib diisi"
[ -n "$REFRESH_TOKEN_KEY" ] || fail "REFRESH_TOKEN_KEY wajib diisi"
[ -n "$LETSENCRYPT_EMAIL" ] || fail "LETSENCRYPT_EMAIL wajib diisi"

if [ -z "$DOMAIN" ]; then
  PUBLIC_IP="$(curl -4fsS https://api.ipify.org || true)"
  [[ "$PUBLIC_IP" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]] || fail "gagal mendeteksi public IPv4; isi DOMAIN secara manual"
  DOMAIN="${PUBLIC_IP}.sslip.io"
fi

echo "Using domain: $DOMAIN"

apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y \
  ca-certificates curl git nginx postgresql postgresql-contrib certbot

if ! command -v node >/dev/null 2>&1 || [ "$(node -p 'process.versions.node.split(`.`)[0]' 2>/dev/null || echo 0)" != "22" ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs
fi

npm install -g pm2

# PostgreSQL local-only database/user.
ESCAPED_DB_PASSWORD="${DB_PASSWORD//\'/\'\'}"
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
  sudo -u postgres psql -v ON_ERROR_STOP=1 -c "CREATE ROLE \"$DB_USER\" LOGIN PASSWORD '$ESCAPED_DB_PASSWORD';"
else
  sudo -u postgres psql -v ON_ERROR_STOP=1 -c "ALTER ROLE \"$DB_USER\" WITH LOGIN PASSWORD '$ESCAPED_DB_PASSWORD';"
fi

if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
  sudo -u postgres createdb -O "$DB_USER" "$DB_NAME"
fi

# Production environment; readable only by the app user.
cat > "$APP_DIR/.env" <<ENV
NODE_ENV=production
HOST=127.0.0.1
PORT=$APP_PORT
PGHOST=127.0.0.1
PGPORT=5432
PGUSER=$DB_USER
PGDATABASE=$DB_NAME
PGPASSWORD=$DB_PASSWORD
ACCESS_TOKEN_KEY=$ACCESS_TOKEN_KEY
REFRESH_TOKEN_KEY=$REFRESH_TOKEN_KEY
ACCESS_TOKEN_AGE=3000
ENV
chown "$APP_USER":"$APP_USER" "$APP_DIR/.env"
chmod 600 "$APP_DIR/.env"

cd "$APP_DIR"
sudo -u "$APP_USER" npm ci
sudo -u "$APP_USER" npm run migrate -- up
sudo -u "$APP_USER" npm prune --omit=dev
sudo -u "$APP_USER" pm2 startOrReload ecosystem.config.cjs --env production
sudo -u "$APP_USER" pm2 save
pm2 startup systemd -u "$APP_USER" --hp "$(getent passwd "$APP_USER" | cut -d: -f6)" >/tmp/forum-api-pm2-startup.txt 2>&1 || true

# NGINX HTTP bootstrap so Let's Encrypt can validate the hostname.
mkdir -p /var/www/certbot
sed "s/__DOMAIN__/$DOMAIN/g" "$APP_DIR/deploy/nginx-http-bootstrap.conf" > /etc/nginx/sites-available/forum-api
ln -sfn /etc/nginx/sites-available/forum-api /etc/nginx/sites-enabled/forum-api
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# Obtain a trusted certificate through HTTP-01.
certbot certonly \
  --webroot -w /var/www/certbot \
  -d "$DOMAIN" \
  --email "$LETSENCRYPT_EMAIL" \
  --agree-tos --no-eff-email --non-interactive

# Install final HTTPS + rate-limit configuration.
sed "s/__DOMAIN__/$DOMAIN/g" "$APP_DIR/nginx.conf" > /etc/nginx/sites-available/forum-api
nginx -t
systemctl reload nginx

# Reload NGINX automatically after certificate renewal.
mkdir -p /etc/letsencrypt/renewal-hooks/deploy
cat > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh <<'HOOK'
#!/usr/bin/env sh
systemctl reload nginx
HOOK
chmod 755 /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh

# Keep application/DB ports private; expose only SSH, HTTP, HTTPS when UFW exists.
if command -v ufw >/dev/null 2>&1; then
  ufw allow OpenSSH || true
  ufw allow 'Nginx Full' || true
fi

cat <<OUT

Bootstrap selesai.
HTTPS URL : https://$DOMAIN
App local : http://127.0.0.1:$APP_PORT
DB local  : 127.0.0.1:5432/$DB_NAME

Jalankan verifikasi:
  cd $APP_DIR
  bash scripts/verify-deployment.sh https://$DOMAIN
OUT
