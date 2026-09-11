const API = {
    // 1. AMBIL DATA AWAL (KELAS & MAPEL) DARI GOOGLE APPS SCRIPT
    async getInitialData() {
        try {
            const response = await fetch(`${CONFIG.GAS_URL}?action=getInitialData`);
            if (!response.ok) throw new Error("Gagal terhubung ke server Google Sheets");
            return await response.json();
        } catch (error) {
            console.error("API Error (getInitialData):", error);
            throw error;
        }
    },

    // 2. AMBIL DAFTAR SISWA BERDASARKAN KELAS
    async getSiswaByKelas(kelas) {
        try {
            const response = await fetch(`${CONFIG.GAS_URL}?action=getSiswa&kelas=${encodeURIComponent(kelas)}`);
            if (!response.ok) throw new Error("Gagal mengambil data siswa");
            return await response.json();
        } catch (error) {
            console.error("API Error (getSiswaByKelas):", error);
            throw error;
        }
    },

    // 3. AMBIL TOKEN BERDASARKAN MAPEL
    async getTokenByMapel(mapel) {
        try {
            const response = await fetch(`${CONFIG.GAS_URL}?action=getToken&mapel=${encodeURIComponent(mapel)}`);
            if (!response.ok) throw new Error("Gagal mengambil data token");
            return await response.json();
        } catch (error) {
            console.error("API Error (getTokenByMapel):", error);
            throw error;
        }
    },

    // 4. AMBIL BERKAS SOAL JSON DARI REPOSITORI GITHUB (FUNGSI PERBAIKAN)
    async fetchSoal(tingkat, mapel) {
        try {
            const pathSoal = `./Soal_Kelas_${tingkat}/soal_${tingkat}_${mapel.toUpperCase()}.json`;
            const response = await fetch(pathSoal);

            if (!response.ok) {
                throw new Error(`Berkas soal tidak ditemukan pada jalur: ${pathSoal}`);
            }

            return await response.json();
        } catch (error) {
            console.error("API Error (fetchSoal):", error);
            throw error;
        }
    },

    // 5. KIRIM JAWABAN SISWA KE GOOGLE SHEETS
    async submitJawaban(dataSiswa) {
        try {
            const response = await fetch(CONFIG.GAS_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify(dataSiswa)
            });

            if (!response.ok) throw new Error("Gagal mengirim jawaban ke server");
            return await response.json();
        } catch (error) {
            console.error("API Error (submitJawaban):", error);
            throw error;
        }
    }
};
