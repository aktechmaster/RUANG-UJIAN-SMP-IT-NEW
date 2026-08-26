# Dokumentasi Sistem Ujian Online CBT (SMP IT)

Sistem Ujian Berbasis Komputer (CBT) berbasis web ringan untuk pelaksanaan ujian sekolah. Sistem ini memuat soal secara dinamis dari repositori GitHub, mendukung format teks Bahasa Arab dan rumus Matematika, serta mengintegrasikan pengiriman hasil ke Google Sheets.

## Fitur Utama

- **Render Soal Dinamis:** Memuat bank soal JSON berdasarkan tingkat kelas dan mata pelajaran dari GitHub.
- **Dukungan Teks Arab & MathJax:** Otomatis mendeteksi teks Arab (arah bacaan Right-to-Left / RTL) serta merender rumus matematika via MathJax 3.
- **Timer Mengambang (Floating Timer):** Penghitung waktu mundur 2 jam yang otomatis mengumpulkan jawaban saat waktu habis.
- **Perkakas Keamanan Sesi:** Menyimpan jawaban sementara di `sessionStorage` agar jawaban tidak hilang saat halaman ter-refresh.
- **Penilaian Otomatis:** Menghitung jumlah jawaban benar, salah, dan skor akhir langsung di sisi klien (*client-side*).
- **Pengiriman Hasil Ujian:** Mengirimkan rekap data dan rinci jawaban ke Google Sheets melalui REST API Google Apps Script.

## Struktur File & Dependensi

- `index.html` / `ujian.html`: Antarmuka utama ujian.
- `floating-cogs.svg` & `smpit.png`: Aset visual UI.
- `MathJax 3`: Perpustakaan render ekspresi matematika.
- `Google Apps Script (GAS)`: Endpoint backend penyimpan data hasil ujian.
