# Deskripsi Submission — WAJIB DIISI SEBELUM SUBMIT

Repository GitHub (public):
https://github.com/USERNAME/REPOSITORY

Deployment Forum API (HTTPS):
https://DOMAIN-ANDA

CI/CD:
- Continuous Integration dijalankan otomatis pada Pull Request ke branch main/master.
- Riwayat GitHub Actions memiliki minimal satu run CI gagal dan satu run CI berhasil setelah perbaikan.
- Continuous Deployment dijalankan otomatis pada push/merge ke main/master dan berhasil melakukan deploy ke VM IDCloudHost.

Security:
- HTTP dialihkan ke HTTPS melalui NGINX.
- TLS menggunakan sertifikat publik yang valid.
- Route /threads dan seluruh turunannya dibatasi 90 request/menit pada NGINX; request berlebih mendapat HTTP 429.
- Aplikasi hanya listen pada 127.0.0.1:3000 sehingga akses publik harus melewati NGINX.

Fitur submission sebelumnya tetap tersedia, termasuk users, authentications, threads, comments, replies, soft delete, dan fitur like/unlike comment.
