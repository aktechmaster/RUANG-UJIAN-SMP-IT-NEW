const UI = {
    elements: {
        kelasSelect: document.getElementById('pilihKelas'),
        siswaSelect: document.getElementById('pilihSiswa'),
        mapelSelect: document.getElementById('pilihMapel'),
        loadingText: document.getElementById('loadingSiswa'),
        form: document.getElementById('loginForm'),
        submitBtn: document.getElementById('btnSubmit'),
        tokenInput: document.getElementById('tokenUjian'),
        toggleToken: document.getElementById('toggleToken'),
        kelasContainer: document.getElementById('kelasContainer'),
        mapelContainer: document.getElementById('mapelContainer'),
        alertModal: document.getElementById('exambroAlertModal'),
        alertMessage: document.getElementById('exambroAlertMessage'),
        emailInput: document.getElementById('emailSiswa')
    },

    initUI() {
        // Toggle password/token visibility
        this.elements.toggleToken.addEventListener('click', () => {
            const isPassword = this.elements.tokenInput.getAttribute('type') === 'password';
            this.elements.tokenInput.setAttribute('type', isPassword ? 'text' : 'password');
            this.elements.toggleToken.textContent = isPassword ? '🙈' : '👁️';
        });

        // Override window.alert bawaan browser ke modal custom
        window.alert = (message) => this.showAlert(message);
    },

    renderKelasOptions(kelasList, onSelectCallback) {
        this.elements.kelasContainer.innerHTML = '';
        if (kelasList && kelasList.length > 0) {
            kelasList.forEach(kelas => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn-opsi';
                btn.textContent = kelas;
                
                btn.onclick = () => {
                    document.querySelectorAll('#kelasContainer .btn-opsi').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    this.elements.kelasSelect.value = kelas;
                    sessionStorage.setItem('cbt_kelas', kelas);
                    if (onSelectCallback) onSelectCallback(kelas);
                };
                this.elements.kelasContainer.appendChild(btn);
            });
        }
    },

    renderMapelOptions(mapelList) {
        this.elements.mapelContainer.innerHTML = '';
        if (mapelList && mapelList.length > 0) {
            mapelList.forEach(mapel => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn-opsi';
                btn.textContent = mapel;

                btn.onclick = () => {
                    document.querySelectorAll('#mapelContainer .btn-opsi').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    this.elements.mapelSelect.value = mapel;
                    sessionStorage.setItem('cbt_mapel', mapel);
                };
                this.elements.mapelContainer.appendChild(btn);
            });
        }
    },

    updateSiswaDatalist(siswaList) {
        let datalist = document.getElementById('listSiswa');
        if (!datalist) {
            datalist = document.createElement('datalist');
            datalist.id = 'listSiswa';
            document.body.appendChild(datalist);
            this.elements.siswaSelect.setAttribute('list', 'listSiswa');
        }
        datalist.innerHTML = '';
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
    },

    setLoadingSiswa(isLoading, message = "Memuat data siswa dari server...") {
        this.elements.siswaSelect.value = '';
        this.elements.siswaSelect.placeholder = message;
        this.elements.siswaSelect.disabled = isLoading;
        this.elements.loadingText.style.display = isLoading ? 'block' : 'none';
    },

    setSubmitButtonState(disabled, text) {
        this.elements.submitBtn.disabled = disabled;
        this.elements.submitBtn.textContent = text;
    },

    showAlert(message) {
        this.elements.alertMessage.innerText = message;
        this.elements.alertModal.style.display = 'flex';
    },

    hideAlert() {
        this.elements.alertModal.style.display = 'none';
    }
};

// Fungsi penutup modal alert
function tutupExambroAlert() {
    UI.hideAlert();
}
