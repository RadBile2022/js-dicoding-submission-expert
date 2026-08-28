# Checklist Final Sebelum Submit Ulang

> Kode ZIP saja **tidak cukup** untuk memenuhi reviewer. Repository dan deployment harus benar-benar online.

## 1. Repository & CI

- [ ] Project sudah di-push ke repository GitHub **public**.
- [ ] Branch utama adalah `main` atau `master`.
- [ ] Buat Pull Request agar workflow `Continuous Integration` berjalan.
- [ ] Riwayat Actions memperlihatkan **minimal satu CI gagal**, lalu commit perbaikan menghasilkan **CI sukses**.
- [ ] Final branch utama tidak dalam kondisi rusak.

Cara aman membuat riwayat gagal/sukses: lakukan di feature branch/PR, buat satu perubahan test sementara yang gagal, tunggu Actions merah, kembalikan/fix perubahan tersebut, push lagi sampai hijau, kemudian merge.

## 2. VM IDCloudHost & CD

- [ ] VM memakai Ubuntu/Debian dan dapat diakses via SSH.
- [ ] Node.js 22, PostgreSQL, NGINX, PM2, dan Certbot tersedia (bootstrap script dapat menyiapkannya).
- [ ] PostgreSQL dapat berada di VM yang sama; port 5432 tidak perlu dibuka ke internet.
- [ ] `.env` production hanya ada di VM, tidak di repository.
- [ ] GitHub Actions secrets sudah dibuat:
  - `SSH_HOST` = IP/hostname VM
  - `SSH_USER` = user SSH VM
  - `SSH_PRIVATE_KEY` = private key untuk login non-interaktif dari GitHub Actions
  - `APP_DIR` = path repo di VM, contoh `/home/ubuntu/forum-api`
- [ ] Setelah merge/push ke main/master, workflow `Continuous Deployment` sukses (hijau).

## 3. Domain, HTTPS, Limit Access

- [ ] URL publik menggunakan hostname/domain dan dapat dibuka melalui `https://`.
- [ ] HTTP port 80 mengalihkan ke HTTPS.
- [ ] Sertifikat TLS valid/publicly trusted.
- [ ] `/threads` dan child path dibatasi oleh NGINX `90r/m` dan request berlebih menghasilkan `429`.
- [ ] Aplikasi Node hanya listen di `127.0.0.1:3000`; port 3000 tidak dibuka ke internet.
- [ ] Jalankan `bash scripts/verify-deployment.sh https://DOMAIN` dan pastikan PASS.

Jika belum punya domain, bootstrap dapat memakai hostname berbasis IP dari `sslip.io`; untuk submission resmi, domain milik sendiri tetap lebih rapi bila tersedia.

## 4. Fitur Lama

- [ ] Jalankan migration database production/test.
- [ ] Semua test project sukses.
- [ ] Forum API V2 Postman Collection sukses terhadap **URL HTTPS deployment**, bukan localhost.
- [ ] Users/authentications/threads/comments/replies/soft-delete tetap bekerja.
- [ ] Like/unlike comment dan `likeCount` tetap bekerja.

## 5. Deskripsi Submission

- [ ] Salin `SUBMISSION_DESCRIPTION_TEMPLATE.md` ke kolom deskripsi submission.
- [ ] Ganti URL placeholder dengan **repository GitHub public yang nyata**.
- [ ] Ganti URL placeholder dengan **URL HTTPS deployment yang nyata**.

Dua URL nyata tersebut adalah bagian yang tidak dapat diselesaikan hanya dengan ZIP lokal; reviewer akan memeriksa layanan yang benar-benar berjalan.
