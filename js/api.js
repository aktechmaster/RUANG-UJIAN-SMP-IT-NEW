const API = {
    async getInitialData() {
        try {
            const response = await fetch(`${CONFIG.SPREADSHEET_API_URL}?action=getInitialData`);
            if (!response.ok) {
                throw new Error(`HTTP Error status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (err) {
            throw new Error("Gagal terhubung ke Google Sheets: " + err.message);
        }
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
    }
};
