document.addEventListener("DOMContentLoaded", async function() {
    // 1. Jalankan pengawas keamanan jika ada
    if (typeof Proctor !== 'undefined') {
        Proctor.init();
    }

    // 2. Inisialisasi Event UI (seperti toggle mata pada token)
    UI.initUI();

    const btnSubmit = UI.elements.submitBtn || document.getElementById("btnSubmit");

    // 3. Set status loading pada tombol awal
    UI.setSubmitButtonState(true, "Memuat Sistem...");

    try {
        // 4. Ambil data awal (daftar kelas & mapel) dari Google Sheets
        const data = await API.getInitialData();

        if (!data || !data.kelas || !data.mapel) {
            throw new Error("Format data awal dari server tidak sesuai.");
        }

        // 5. Render tombol Kelas dan hubungkan ke fungsi ambil siswa saat diklik
        UI.populateKelas(data.kelas, handleSelectKelas);

        // 6. Render tombol Mapel
        UI.populateMapel(data.mapel);

        // 7. Kembalikan tombol submit ke status aktif
        UI.setSubmitButtonState(false, "Masuk Ujian");

    } catch (error) {
        console.error("Error Inisialisasi App:", error);
        UI.setSubmitButtonState(false, "⚡ Muat Ulang Sistem");
        if (btnSubmit) {
            btnSubmit.onclick = () => location.reload();
        }
        alert("⚠️ GAGAL MEMUAT DATA KELAS & MAPEL!\n\nDetail Error: " + error.message);
    }

    // 8. Pasang listener saat form/tombol Masuk Ujian diklik
    const form = UI.elements.form || document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    } else if (btnSubmit) {
        btnSubmit.addEventListener('click', handleFormSubmit);
    }
});

// FUNGSI SAAT KELAS DIKLIK -> MENGAMBIL DAFTAR SISWA DARI SPREADSHEET
async function handleSelectKelas(selectedKelas) {
    try {
        UI.setLoadingSiswa(true, `Memuat data siswa kelas ${selectedKelas}...`);
        
        const siswaList = await API.getSiswaByKelas(selectedKelas);
        
        UI.updateSiswaDatalist(siswaList);
        UI.setLoadingSiswa(false);
    } catch (error) {
        console.error("Error memuat siswa:", error);
        UI.setLoadingSiswa(false, "Gagal memuat daftar siswa");
        alert("❌ Gagal memuat data siswa untuk kelas " + selectedKelas + ".\nDetail: " + error.message);
    }
}

// FUNGSI VERIFIKASI TOKEN & MASUK KE HALAMAN UJIAN
async function handleFormSubmit(e) {
    if (e) e.preventDefault();

    const kelas = sessionStorage.getItem('cbt_kelas') || UI.elements.kelasSelect?.value;
    const siswa = UI.elements.siswaSelect?.value;
    const mapel = sessionStorage.getItem('cbt_mapel') || UI.elements.mapelSelect?.value;
    const email = UI.elements.emailInput?.value;
    const token = UI.elements.tokenInput?.value;

    // Validasi Kelengkapan Isian
    if (!kelas) {
        alert("Silakan pilih Kelas terlebih dahulu!");
        return;
    }
    if (!siswa || siswa.trim() === "") {
        alert("Silakan pilih atau ketik Nama Siswa!");
        return;
    }
    if (!mapel) {
        alert("Silakan pilih Mata Pelajaran terlebih dahulu!");
        return;
    }
    if (!email || email.trim() === "") {
        alert("Silakan isi alamat Email Anda!");
        return;
    }
    if (!token || token.trim() === "") {
        alert("Silakan masukkan Token / Password Ujian!");
        return;
    }

    // Verifikasi Token
    try {
        UI.setSubmitButtonState(true, "Memvalidasi Token...");

        const tokenData = await API.getTokenByMapel(mapel);
        const tokenResmi = tokenData && tokenData.token ? String(tokenData.token).trim() : "";

        if (token.trim() === tokenResmi || token.trim().toUpperCase() === tokenResmi.toUpperCase()) {
            // Simpan ke Session Storage
            sessionStorage.setItem('cbt_kelas', kelas);
            sessionStorage.setItem('cbt_siswa', siswa.trim());
            sessionStorage.setItem('cbt_mapel', mapel);
            sessionStorage.setItem('cbt_email', email.trim());

            // Pindah ke Halaman Ujian
            window.location.href = 'ujian.html';
        } else {
            UI.setSubmitButtonState(false, "Masuk Ujian");
            alert("❌ TOKEN / PASSWORD UJIAN SALAH!\nSilakan tanyakan token yang benar kepada pengawas.");
        }
    } catch (error) {
        console.error("Error verifikasi token:", error);
        UI.setSubmitButtonState(false, "Masuk Ujian");
        alert("⚠️ GAGAL MEMVALIDASI TOKEN!\nDetail: " + error.message);
    }
}
