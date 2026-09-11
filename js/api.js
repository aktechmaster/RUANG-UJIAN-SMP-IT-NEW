const API = {
    async getInitialData() {
        const response = await fetch(`${CONFIG.SPREADSHEET_API_URL}?action=getInitialData`);
        if (!response.ok) throw new Error('Gagal mengambil data awal dari server.');
        return await response.json();
    },

    async getSiswaByKelas(selectedKelas) {
        const response = await fetch(`${CONFIG.SPREADSHEET_API_URL}?action=getSiswa&kelas=${encodeURIComponent(selectedKelas)}`);
        if (!response.ok) throw new Error('Gagal mengambil data siswa.');
        return await response.json();
    },

    async getTokenByMapel(mapel) {
        const response = await fetch(`${CONFIG.SPREADSHEET_API_URL}?action=getToken&mapel=${encodeURIComponent(mapel)}`);
        if (!response.ok) throw new Error('Gagal memvalidasi token.');
        return await response.json();
    },

    // --- Khusus Ujian ---
    async fetchSoal(tingkatKelas, mapelUjian) {
        const namaFile = `soal_${tingkatKelas}_${mapelUjian}.json`;
        const urlJSON = `./Soal_Kelas_${tingkatKelas}/${namaFile}?t=` + new Date().getTime();
        const response = await fetch(urlJSON);
        if (!response.ok) throw new Error(`Gagal memuat berkas ${namaFile}`);
        return await response.json();
    },

    async submitJawaban(dataSiswa) {
        const response = await fetch(CONFIG.SUBMIT_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(dataSiswa)
        });
        if (!response.ok) throw new Error("Respon server bermasalah (Status: " + response.status + ")");
        return await response.json();
    }
};
