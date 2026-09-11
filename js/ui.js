const UI = {
    elements: {
        get kelasSelect() { return document.getElementById('pilihKelas'); },
        get siswaSelect() { return document.getElementById('pilihSiswa'); },
        get mapelSelect() { return document.getElementById('pilihMapel'); },
        get loadingText() { return document.getElementById('loadingSiswa'); },
        get form() { return document.getElementById('loginForm'); },
        get submitBtn() { return document.getElementById('btnSubmit'); },
        get tokenInput() { return document.getElementById('tokenUjian'); },
        get toggleToken() { return document.getElementById('toggleToken'); },
        get kelasContainer() { return document.getElementById('kelasContainer'); },
        get mapelContainer() { return document.getElementById('mapelContainer'); },
        get alertModal() { return document.getElementById('exambroAlertModal'); },
        get alertMessage() { return document.getElementById('exambroAlertMessage'); },
        get emailInput() { return document.getElementById('emailSiswa'); }
    },

    initUI() {
        // Toggle password/token visibility
        if (this.elements.toggleToken && this.elements.tokenInput) {
            this.elements.toggleToken.addEventListener('click', () => {
                const isPassword = this.elements.tokenInput.getAttribute('type') === 'password';
                this.elements.tokenInput.setAttribute('type', isPassword ? 'text' : 'password');
                this.elements.toggleToken.textContent = isPassword ? '🙈' : '👁️';
            });
        }

        // Override window.alert bawaan browser ke modal custom
        window.alert = (message) => this.showAlert(message);
    },

    // Fungsi penghubung agar kompatibel dengan panggilan app.js
    populateKelas(kelasList, onSelectCallback) {
        this.renderKelasOptions(kelasList, onSelectCallback);
    },

    // Fungsi penghubung agar kompatibel dengan panggilan app.js
    populateMapel(mapelList) {
        this.renderMapelOptions(mapelList);
    },

    renderKelasOptions(kelasList, onSelectCallback) {
        const container = this.elements.kelasContainer;
        if (!container) return;

        container.innerHTML = '';
        if (kelasList && kelasList.length > 0) {
            kelasList.forEach(kelas => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn-opsi';
                btn.textContent = kelas;
                
                btn.onclick = () => {
                    document.querySelectorAll('#kelasContainer .btn-opsi').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    if (this.elements.kelasSelect) this.elements.kelasSelect.value = kelas;
                    sessionStorage.setItem('cbt_kelas', kelas);
                    if (onSelectCallback) onSelectCallback(kelas);
                };
                container.appendChild(btn);
            });
        }
    },

    renderMapelOptions(mapelList) {
        const container = this.elements.mapelContainer;
        if (!container) return;

        container.innerHTML = '';
        if (mapelList && mapelList.length > 0) {
            mapelList.forEach(mapel => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn-opsi';
                btn.textContent = mapel;

                btn.onclick = () => {
                    document.querySelectorAll('#mapelContainer .btn-opsi').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    if (this.elements.mapelSelect) this.elements.mapelSelect.value = mapel;
                    sessionStorage.setItem('cbt_mapel', mapel);
                };
                container.appendChild(btn);
            });
        }
    },

    updateSiswaDatalist(siswaList) {
        let datalist = document.getElementById('listSiswa');
        if (!datalist) {
            datalist = document.createElement('datalist');
            datalist.id = 'listSiswa';
            document.body.appendChild(datalist);
            if (this.elements.siswaSelect) this.elements.siswaSelect.setAttribute('list', 'listSiswa');
        }
        datalist.innerHTML = '';
        if (this.elements.siswaSelect) {
            if (siswaList && siswaList.length > 0) {
                siswaList.forEach(siswa => {
                    const option = document.createElement('option');
                    option.value = siswa;
                    datalist.appendChild(option);
                });
                this.elements.siswaSelect.placeholder = "Ketik nama lengkap siswa...";
                this.elements.siswaSelect.disabled = false;
            } else {
                this.elements.siswaSelect.placeholder = "Data siswa kosong / tidak ditemukan";
            }
        }
    },

    setLoadingSiswa(isLoading, message = "Memuat data siswa dari server...") {
        if (this.elements.siswaSelect) {
            this.elements.siswaSelect.value = '';
            this.elements.siswaSelect.placeholder = message;
            this.elements.siswaSelect.disabled = isLoading;
        }
        if (this.elements.loadingText) {
            this.elements.loadingText.style.display = isLoading ? 'block' : 'none';
        }
    },

    setSubmitButtonState(disabled, text) {
        if (this.elements.submitBtn) {
            this.elements.submitBtn.disabled = disabled;
            this.elements.submitBtn.textContent = text;
        }
    },

    showAlert(message) {
        if (this.elements.alertMessage && this.elements.alertModal) {
            this.elements.alertMessage.innerText = message;
            this.elements.alertModal.style.display = 'flex';
        } else {
            console.log("Alert:", message);
        }
    },

    hideAlert() {
        if (this.elements.alertModal) {
            this.elements.alertModal.style.display = 'none';
        }
    }
};

// Fungsi penutup modal alert
function tutupExambroAlert() {
    UI.hideAlert();
}
