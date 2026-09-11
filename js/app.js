document.addEventListener("DOMContentLoaded", async function() {
    // 1. Jalankan pengawas keamanan
    if (typeof Proctor !== 'undefined') {
        Proctor.init();
    }

    const btnSubmit = document.getElementById("btnMasuk") || document.querySelector("button[type='submit']") || document.querySelector("button");

    // 2. Set status loading pada tombol
    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerText = "Memuat Sistem...";
    }

    try {
        // 3. Ambil data awal dari Spreadsheet
        const data = await API.getInitialData();

        if (!data || !data.kelas || !data.mapel) {
            throw new Error("Format data awal dari server tidak sesuai.");
        }

        // 4. Isi dropdown Kelas dan Mapel
        UI.populateKelas(data.kelas);
        UI.populateMapel(data.mapel);

        // 5. Kembalikan tombol ke status siap
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerText = "Masuk Ujian";
        }

    } catch (error) {
        console.error("Error Inisialisasi:", error);
        
        // Buka kembali tombol dan tampilkan pesan error eksplisit
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerText = "⚡ Muat Ulang Sistem";
            btnSubmit.onclick = function() {
                location.reload();
            };
        }

        alert("⚠️ GAGAL MEMUAT DATA SISWA & MAPEL!\n\nDetail Error: " + error.message + "\n\nSilakan periksa SPREADSHEET_API_URL di js/config.js atau izin Google Apps Script Anda.");
    }
});
