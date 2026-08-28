# CI/CD & Security — IDCloudHost VM

Project ini sudah disiapkan untuk memenuhi catatan reviewer: repository GitHub + CI/CD nyata, deployment publik, HTTPS, NGINX limit access, serta mempertahankan Forum API sebelumnya.

## A. Push ke GitHub public

Buat repository GitHub public, lalu dari root project:

```bash
git init
git add .
git commit -m "Forum API CI CD security submission"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

`.env` production sengaja tidak ada di ZIP/repository. File tersebut dibuat hanya di VM.

## B. Siapkan akses SSH untuk GitHub Actions

CD perlu kredensial non-interaktif untuk masuk ke VM. Untuk deployment SSH, private key adalah pilihan standar dan lebih tepat daripada password interaktif.

Buat key khusus deployment pada komputer Anda, pasang public key ke `~/.ssh/authorized_keys` user VM, lalu simpan **private key** tersebut hanya sebagai GitHub Actions secret `SSH_PRIVATE_KEY`.

Tambahkan secrets repository:

- `SSH_HOST`: public IP/hostname VM IDCloudHost.
- `SSH_USER`: user SSH, misalnya `ubuntu`.
- `SSH_PRIVATE_KEY`: private key deployment.
- `APP_DIR`: contoh `/home/ubuntu/forum-api`.

Jangan commit private key.

## C. Bootstrap VM satu kali

Setelah repository ada di GitHub, clone sekali ke VM:

```bash
git clone https://github.com/USERNAME/REPOSITORY.git ~/forum-api
cd ~/forum-api
```

Jalankan bootstrap (Ubuntu/Debian):

```bash
sudo \
  DOMAIN=api.domainanda.com \
  LETSENCRYPT_EMAIL=emailanda@example.com \
  DB_PASSWORD='PASSWORD_DATABASE_KUAT' \
  ACCESS_TOKEN_KEY='ACCESS_KEY_PANJANG_ACAK' \
  REFRESH_TOKEN_KEY='REFRESH_KEY_PANJANG_ACAK_BERBEDA' \
  bash scripts/bootstrap-idcloudhost-vm.sh
```

Jika `DOMAIN` tidak diberikan, script mencoba menggunakan `<public-ip>.sslip.io`. Hostname ini mengarah ke public IP VM dan dapat digunakan untuk TLS HTTP-01. Domain milik sendiri lebih rapi bila tersedia.

Bootstrap menyiapkan Node.js 22, PostgreSQL lokal, PM2, NGINX, sertifikat Let's Encrypt, `.env` production, migration, dan aplikasi. NGINX mem-proxy ke `127.0.0.1:3000`; PostgreSQL juga lokal sehingga tidak perlu dipublikasikan.

## D. Uji security deployment

```bash
bash scripts/verify-deployment.sh https://DOMAIN-ANDA
```

Script memeriksa:

1. HTTPS dapat diakses dengan sertifikat valid.
2. HTTP mengalihkan ke HTTPS.
3. Burst ke `/threads` menghasilkan HTTP 429 setelah limit terlampaui.

## E. Buat riwayat CI gagal lalu sukses

CI berjalan pada Pull Request. Reviewer meminta bukti proses CI, bukan sekadar file workflow.

1. Buat feature branch dan Pull Request ke `main`.
2. Pada commit pertama, buat satu test sementara gagal dan push sampai Actions menunjukkan CI merah.
3. Perbaiki/kembalikan test tersebut pada commit berikutnya dan push sampai CI hijau.
4. Merge PR hanya setelah CI sukses.

Riwayat gagal tetap terlihat, sedangkan final code tetap benar.

## F. CD

Merge/push ke `main` otomatis menjalankan `.github/workflows/cd.yml`. Workflow:

- SSH ke VM.
- Sinkronisasi exact branch dari GitHub.
- `npm ci`.
- Migration production.
- Prune dev dependency.
- Reload PM2.
- Smoke test lokal; workflow gagal bila aplikasi tidak merespons.

Pastikan run `Continuous Deployment` terakhir berstatus sukses.

## G. Yang harus ditulis saat submit

Reviewer secara eksplisit meminta dua hal yang harus nyata dan online:

- URL repository GitHub public.
- URL deployment Forum API HTTPS.

Gunakan `SUBMISSION_DESCRIPTION_TEMPLATE.md` dan ganti semua placeholder sebelum submit.
