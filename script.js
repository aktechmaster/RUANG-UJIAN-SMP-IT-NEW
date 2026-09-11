// Variable Global & Elemen DOM
const kelasSelect = document.getElementById('pilihKelas');
const siswaSelect = document.getElementById('pilihSiswa');
const mapelSelect = document.getElementById('pilihMapel');
const loadingText = document.getElementById('loadingSiswa');
const form = document.getElementById('loginForm');
const submitBtn = document.getElementById('btnSubmit');
const tokenInput = document.getElementById('tokenUjian');
const toggleToken = document.getElementById('toggleToken');
const kelasContainer = document.getElementById('kelasContainer');
const mapelContainer = document.getElementById('mapelContainer');

const SPREADSHEET_API_URL = "https://script.google.com/macros/s/AKfycbxF3g7LSwr61mNuVqOApDXnmjZsY5putWlumzL_GnJJN8hOPqhTk0MR9aPRnmbFJX1x/exec";

// Toggle Visibility Token Password
toggleToken.addEventListener('click', function () {
    const isPassword = tokenInput.getAttribute('type') === 'password';
    tokenInput.setAttribute('type', isPassword ? 'text' : 'password');
    this.textContent = isPassword ? '🙈' : '👁️';
});

// 1. KETIKA HALAMAN DIBUKA (AMBIL DATA KELAS & MAPEL)
document.addEventListener("DOMContentLoaded", async function() {
    try {
        const response = await fetch(`${SPREADSHEET_API_URL}?action=getInitialData`);
        const data = await response.json();

        // Render Tombol Kelas
        kelasContainer.innerHTML = '';
        if (data.kelas && data.kelas.length > 0) {
            data.kelas.forEach(kelas => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn-opsi';
                btn.textContent = kelas;
                
                btn.onclick = function() {
                    document.querySelectorAll('#kelasContainer .btn-opsi').forEach(b => b.classList.remove('selected'));
                    this.classList.add('selected');
                    
                    kelasSelect.value = kelas;
                    sessionStorage.setItem('cbt_kelas', kelas);
                    muatDaftarSiswa(kelas);
                };
                kelasContainer.appendChild(btn);
            });
        }

        // Render Tombol Mapel
        mapelContainer.innerHTML = '';
        if (data.mapel && data.mapel.length > 0) {
            data.mapel.forEach(mapel => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn-opsi';
                btn.textContent = mapel;

                btn.onclick = function() {
                    document.querySelectorAll('#mapelContainer .btn-opsi').forEach(b => b.classList.remove('selected'));
                    this.classList.add('selected');
                    
                    mapelSelect.value = mapel;
                    sessionStorage.setItem('cbt_mapel', mapel);
                };
                mapelContainer.appendChild(btn);
            });
        }

        submitBtn.textContent = "Lanjutkan Ujian";
        submitBtn.disabled = false;

    } catch (error) {
        console.error("Gagal mengambil data awal:", error);
        kelasContainer.innerHTML = '<span style="color:red; font-size:0.85rem;">Gagal memuat data kelas</span>';
        mapelContainer.innerHTML = '<span style="color:red; font-size:0.85rem;">Gagal memuat data mapel</span>';
        submitBtn.textContent = "Error Jaringan";
    }
});

// 2. FUNGSI AMBIL DAFTAR SISWA BERDASARKAN KELAS
async function muatDaftarSiswa(selectedKelas) {
    siswaSelect.value = '';
    siswaSelect.placeholder = "Memuat data siswa dari server...";
    siswaSelect.disabled = true;
    loadingText.style.display = 'block';

    try {
        const response = await fetch(`${SPREADSHEET_API_URL}?action=getSiswa&kelas=${encodeURIComponent(selectedKelas)}`);
        const data = await response.json();
        const daftarSiswa = data.siswa;

        if (daftarSiswa && daftarSiswa.length > 0) {
            let datalist = document.getElementById('listSiswa');
            if (!datalist) {
                datalist = document.createElement('datalist');
                datalist.id = 'listSiswa';
                document.body.appendChild(datalist);
                siswaSelect.setAttribute('list', 'listSiswa');
            }
            datalist.innerHTML = '';
            daftarSiswa.forEach(siswa => {
                const option = document.createElement('option');
                option.value = siswa;
                datalist.appendChild(option);
            });

            siswaSelect.placeholder = "Ketik nama lengkap siswa...";
            siswaSelect.disabled = false;
        } else {
            siswaSelect.placeholder = "Data siswa kosong / tidak ditemukan";
        }
    } catch (error) {
        console.error("Gagal mengambil data:", error);
        siswaSelect.placeholder = "Gagal memuat data. Cek koneksi internet.";
    } finally {
        loadingText.style.display = 'none';
    }
}

// 3. LOGIKA SUBMIT FORM & PENGECEKAN TOKEN
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const kelas = kelasSelect.value;
    const siswa = siswaSelect.value;
    const mapel = mapelSelect.value;
    const enteredToken = document.getElementById('tokenUjian').value.trim(); 

    if (!kelas || !mapel) {
        alert("Harap pilih Kelas dan Mata Pelajaran terlebih dahulu sebelum melanjutkan.");
        return;
    }

    submitBtn.textContent = "Memeriksa Token...";
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${SPREADSHEET_API_URL}?action=getToken&mapel=${encodeURIComponent(mapel)}`);
        const data = await response.json();
        const tokenBenar = data.password;

        if (tokenBenar) {
            if (enteredToken.toLowerCase() !== tokenBenar.toString().toLowerCase()) {
                alert(`MAAF!\nToken/Password yang Anda masukkan SALAH untuk mata pelajaran ${mapel}. \n\nSilakan cek kembali tulisan token Anda.`);
                submitBtn.textContent = "Lanjutkan Ujian";
                submitBtn.disabled = false;
                return;
            }
        } else {
            alert(`Sistem Error: Token untuk mapel ${mapel} belum diatur oleh admin di Spreadsheet.`);
            submitBtn.textContent = "Lanjutkan Ujian";
            submitBtn.disabled = false;
            return;
        }

        const emailInput = document.getElementById('emailSiswa').value;
        
        sessionStorage.setItem('cbt_kelas', kelas);
        sessionStorage.setItem('cbt_siswa', siswa);
        sessionStorage.setItem('cbt_mapel', mapel);
        sessionStorage.setItem('cbt_email', emailInput);

        alert(`Login Berhasil!\n\nSelamat Mengerjakan:\nNama: ${siswa}\nKelas: ${kelas}\nMapel: ${mapel}\n\nBerdoalah sebelum memulai ujian!`);
        
        window.location.href = "ujian.html"; 

    } catch (error) {
        console.error("Error validasi token:", error);
        alert("Terjadi kesalahan saat memvalidasi token. Pastikan link URL sudah benar dan koneksi internet lancar.");
        submitBtn.textContent = "Lanjutkan Ujian";
        submitBtn.disabled = false;
    }
});

// Custom Alert Modal Handler
window.alert = function(message) {
    document.getElementById('exambroAlertMessage').innerText = message;
    document.getElementById('exambroAlertModal').style.display = 'flex';
};

function tutupExambroAlert() {
    document.getElementById('exambroAlertModal').style.display = 'none';
}
