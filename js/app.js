// Fungsi Inisialisasi Utama
async function initApp() {
    if (typeof Proctor !== 'undefined') {
        Proctor.init();
    }

    const btnSubmit = document.getElementById("btnSubmit");

    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerText = "Memuat Sistem...";
    }

    try {
        // Ambil data awal dari Spreadsheet
        const data = await API.getInitialData();

        if (!data || !data.kelas || !data.mapel) {
            throw new Error("Format data awal dari server tidak sesuai.");
        }

        // Isi Pilihan Kelas & Mapel
        if (typeof UI !== 'undefined') {
            UI.populateKelas(data.kelas);
            UI.populateMapel(data.mapel);
        }

        // Aktifkan tombol masuk
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerText = "Masuk Ujian";
        }

    } catch (error) {
        console.error("Error Inisialisasi App:", error);

        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerText = "⚡ Muat Ulang Sistem";
            btnSubmit.onclick = function(e) {
                e.preventDefault();
                location.reload();
            };
        }

        alert("⚠️ GAGAL MEMUAT DATA SISWA & MAPEL!\n\nDetail Error: " + error.message + "\n\nSilakan periksa jaringan Anda atau pastikan URL Apps Script di-Deploy sebagai 'Anyone'.");
    }
}

// Jalankan aplikasi langsung jika DOM sudah siap
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}

// Event Intip Token Ujian (Fitur Mata)
document.addEventListener("DOMContentLoaded", function() {
    const toggleToken = document.getElementById("toggleToken");
    const tokenInput = document.getElementById("tokenUjian");
    
    if (toggleToken && tokenInput) {
        toggleToken.addEventListener("click", function() {
            const isPassword = tokenInput.type === "password";
            tokenInput.type = isPassword ? "text" : "password";
            toggleToken.innerText = isPassword ? "🙈" : "👁️";
        });
    }
});
