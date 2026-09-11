const Proctor = {
    tabSwitchCount: 0,

    init() {
        if (!CONFIG.PROCTOR) return;

        if (CONFIG.PROCTOR.ENABLE_DISABLE_RIGHT_CLICK) {
            this.disableRightClick();
        }

        if (CONFIG.PROCTOR.ENABLE_DISABLE_DEVTOOLS_KEYS) {
            this.disableDevToolsKeys();
        }

        if (CONFIG.PROCTOR.ENABLE_ANTI_TAB_SWITCH) {
            this.initTabSwitchMonitoring();
        }
    },

    // Mematikan Klik Kanan
    disableRightClick() {
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            UI.showAlert("Peringatan Proctor:\nKlik kanan dilarang selama berada di sistem ujian!");
        });
    },

    // Mematikan Tombol Inspeksi Elemen (F12, Ctrl+Shift+I/J/C, Ctrl+U)
    disableDevToolsKeys() {
        document.addEventListener('keydown', (e) => {
            const isF12 = e.key === 'F12';
            const isInspectShortcut = e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase());
            const isViewSource = e.ctrlKey && e.key.toUpperCase() === 'U';

            if (isF12 || isInspectShortcut || isViewSource) {
                e.preventDefault();
                UI.showAlert("Peringatan Proctor:\nAkses Developer Tools / Inspeksi Elemen dilarang!");
            }
        });
    },

    // Deteksi Pindah Tab / Buka Aplikasi Lain
    initTabSwitchMonitoring() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.tabSwitchCount++;
                sessionStorage.setItem('cbt_tab_switches', this.tabSwitchCount);

                const max = CONFIG.PROCTOR.MAX_TAB_SWITCH_WARNINGS || 3;
                if (this.tabSwitchCount >= max) {
                    UI.showAlert(`PERINGATAN KERAS PROCTOR!\nAnda telah meninggalkan halaman ujian sebanyak ${this.tabSwitchCount} kali.\nTindakan ini dicatat sebagai pelanggaran!`);
                } else {
                    UI.showAlert(`PERINGATAN PROCTOR (${this.tabSwitchCount}/${max}):\nDilarang berpindah tab atau membuka aplikasi lain!`);
                }
            }
        });
    }
};
