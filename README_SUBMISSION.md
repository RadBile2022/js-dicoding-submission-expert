# Forum API — Automation Testing & Clean Architecture

Proyek ini dikembangkan dari **Forum API Starter Project** dan dilengkapi fitur wajib serta fitur opsional balasan komentar.

## Cakupan Fitur

| Fitur | Method & Route | Auth | Status sukses |
|---|---|---|---|
| Registrasi | `POST /users` | Tidak | 201 |
| Login | `POST /authentications` | Tidak | 201 |
| Refresh token | `PUT /authentications` | Tidak | 200 |
| Logout | `DELETE /authentications` | Tidak | 200 |
| Tambah thread | `POST /threads` | Bearer token | 201 |
| Detail thread | `GET /threads/{threadId}` | Tidak | 200 |
| Tambah komentar | `POST /threads/{threadId}/comments` | Bearer token | 201 |
| Hapus komentar | `DELETE /threads/{threadId}/comments/{commentId}` | Bearer token | 200 |
| Tambah reply | `POST /threads/{threadId}/comments/{commentId}/replies` | Bearer token | 201 |
| Hapus reply | `DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}` | Bearer token | 200 |

## Clean Architecture

Struktur mengikuti empat lapisan utama:

- **Entities / Domain** — validasi struktur data dan kontrak repository.
- **Use Case** — orkestrasi serta business logic.
- **Interface Adapter** — HTTP handler/router dan implementasi repository PostgreSQL.
- **Framework** — Express, PostgreSQL, JWT, bcrypt, dan dependency container.

Autentikasi resource forum dilakukan di level interface (`Interfaces/http/api/threads/auth.js`) agar use case tidak bergantung pada mekanisme autentikasi HTTP.

## Perilaku Penting

- Thread, komentar, dan reply yang tidak ditemukan menghasilkan `404`.
- Resource terbatas tanpa access token atau token tidak valid menghasilkan `401`.
- Hanya pemilik komentar/reply yang dapat menghapus; selain pemilik menghasilkan `403`.
- Payload tidak lengkap atau tipe data salah menghasilkan `400`.
- Komentar dan reply menggunakan **soft delete**.
- Komentar yang dihapus ditampilkan sebagai `**komentar telah dihapus**`.
- Reply yang dihapus ditampilkan sebagai `**balasan telah dihapus**`.
- Komentar dan reply diurutkan ascending berdasarkan waktu pembuatan.

## Automation Testing

Pengujian disediakan pada tiga level:

1. **Unit test** untuk entity dan use case.
2. **Integration test** untuk repository PostgreSQL, termasuk validasi bahwa insert/update benar-benar mengubah database.
3. **Functional/server test** untuk resource thread, comment, dan reply melalui HTTP.

Mock pada use case diverifikasi dengan assertion seperti `toHaveBeenCalledWith()` sehingga test tidak hanya memeriksa nilai akhir, tetapi juga memastikan dependency dipanggil sesuai alur bisnis.

## Menjalankan Proyek

```bash
npm install
npm run migrate
npm start
```

Untuk database test, buat database `forumapi_test`, lalu:

```bash
npm run migrate:test up
npm test
npm run test:coverage
```

Jika konfigurasi lokal berbeda, sesuaikan `.env` dan `.test.env`.

## Checklist Sebelum Submission

- Pastikan PostgreSQL aktif.
- Jalankan migration development dan test.
- Jalankan seluruh unit/integration/functional test.
- Jalankan Postman Collection Forum API secara berurutan.
- Pastikan tidak ada data test lama yang mengganggu pengujian.
- Pastikan `node_modules` tidak ikut di ZIP submission.
- Pastikan `package.json` berada di root proyek.
- Gunakan Node.js LTS v22.

## Rujukan Implementasi

Implementasi disusun dengan mengacu pada dua materi yang diberikan bersama tugas:

1. **Kriteria Forum API** — spesifikasi route, response, status code, soft delete, detail thread, automation testing, Clean Architecture, fitur reply opsional, dan ketentuan submission.
2. **Tips Dalam Mengerjakan Submission** — mock harus menggunakan data netral, semua fungsi mock harus diverifikasi, business logic berada di entity/use case, integration test harus mengecek perubahan external agency/database, dan autentikasi ditempatkan di level interface.

Dengan demikian, struktur proyek tidak hanya menargetkan keberhasilan endpoint, tetapi juga mengikuti pola arsitektur dan testing yang diminta pada modul.

## Submission V2 - CI/CD & Security

Versi ini menambahkan kebutuhan submission lanjutan tanpa menghapus fitur Forum API sebelumnya:

- CI GitHub Actions pada pull request ke `main`/`master` dengan PostgreSQL service container.
- CD GitHub Actions pada push ke `main`/`master` melalui SSH.
- `nginx.conf` pada root proyek untuk HTTPS reverse proxy dan rate limit `/threads` sebesar 90 request per menit.
- Fitur opsional like/unlike komentar melalui `PUT /threads/{threadId}/comments/{commentId}/likes`.
- `likeCount` pada setiap komentar di response detail thread.

Langkah deployment, GitHub Secrets, pembuatan riwayat CI gagal/berhasil, HTTPS, dan verifikasi akhir dijelaskan di `CICD_SECURITY_GUIDE.md`.

## Submission V3 — Reviewer Fix (IDCloudHost)

Perbaikan deployment/security pada paket ini:

- Port produksi diseragamkan ke `127.0.0.1:3000`, sesuai upstream NGINX, sehingga API tidak perlu mengekspos port Node secara langsung.
- NGINX final menyediakan redirect HTTP→HTTPS dan limit `/threads` sebesar `90r/m` dengan HTTP 429 untuk excess request.
- Tersedia bootstrap Ubuntu/Debian untuk VM IDCloudHost + PostgreSQL pada VM yang sama.
- CD melakukan clone/pull repository public, migration, PM2 reload, dan smoke test.
- Tersedia verifier deployment dan template deskripsi submission agar URL repository serta URL HTTPS tidak terlupa.
- `.env` production dan coverage hasil test tidak disertakan dalam repository/ZIP final.

Baca `CICD_SECURITY_GUIDE.md` dan `SUBMISSION_READY_CHECKLIST.md` sebelum submit ulang.
