#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-}"
[ -n "$BASE_URL" ] || { echo "Usage: bash scripts/verify-deployment.sh https://your-domain" >&2; exit 2; }
BASE_URL="${BASE_URL%/}"
HTTP_URL="${BASE_URL/https:\/\//http://}"

echo "[1/4] TLS certificate / HTTPS connectivity"
https_code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 "$BASE_URL/threads/verification-does-not-exist")"
[ "$https_code" != "000" ] || { echo "HTTPS tidak dapat diakses" >&2; exit 1; }
echo "HTTPS reachable, status=$https_code (404 normal untuk ID dummy)"

echo "[2/4] HTTP -> HTTPS redirect"
redirect_code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 "$HTTP_URL/threads/verification-does-not-exist")"
case "$redirect_code" in
  301|302|307|308) echo "Redirect OK, status=$redirect_code" ;;
  *) echo "Redirect gagal, status=$redirect_code" >&2; exit 1 ;;
esac

echo "[3/4] Rate limit /threads"
tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT
seq 1 110 | xargs -I{} -P20 sh -c \
  'curl -sS -o /dev/null -w "%{http_code}\n" --max-time 10 "$1/threads/rate-limit-test-{}" || echo 000' _ "$BASE_URL" >> "$tmp"
count_429="$(grep -c '^429$' "$tmp" || true)"
if [ "$count_429" -lt 1 ]; then
  echo "Rate limit belum terbukti: tidak ada response 429" >&2
  sort "$tmp" | uniq -c >&2
  exit 1
fi
echo "Rate limit OK: $count_429 response(s) mendapat 429"

echo "[4/4] Summary"
echo "PASS: HTTPS aktif, HTTP redirect aktif, dan /threads terkena limit access."
