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
    }
};
