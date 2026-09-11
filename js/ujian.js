let bankSoalData = null;
let timerInterval = null;

document.addEventListener("DOMContentLoaded", async function() {
    // 1. Inisialisasi Fitur Pengawasan
    Proctor.init();

    // 2. Ambil Data Session
    let kelasSiswa = sessionStorage.getItem('cbt_kelas');
    let mapelUjian = sessionStorage.getItem('cbt_mapel');
    let namaSiswa = sessionStorage.getItem('cbt_siswa') || "Siswa Contoh";
    let emailSiswa = sessionStorage.getItem('cbt_email') || "Tidak ada email";

    if (!kelasSiswa || !mapelUjian) {
        kelasSiswa = "9 Al-Quran";
        mapelUjian = "MTK";
    }

    // Deteksi Pergantian Siswa
    let siswaTerakhir = sessionStorage.getItem('cbt_siswa_aktif');
    let mapelTerakhir = sessionStorage.getItem('cbt_mapel_aktif');

    if (siswaTerakhir !== namaSiswa || mapelTerakhir !== mapelUjian) {
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith('soal_') || key === 'exam_time_left' || key === 'exam_start_time') {
                sessionStorage.removeItem(key);
            }
        });
        sessionStorage.setItem('cbt_siswa_aktif', namaSiswa);
        sessionStorage.setItem('cbt_mapel_aktif', mapelUjian);
        sessionStorage.setItem('exam_start_time', Date.now());
    }

    document.getElementById('infoEmail').innerText = emailSiswa;

    const tingkatKelas = kelasSiswa.charAt(0);

    // 3. Load Soal dari JSON
    try {
        const data = await API.fetchSoal(tingkatKelas, mapelUjian);
        bankSoalData = data;

        document.getElementById('judulMapel').innerText = "Sumatif Tengah Semester Ganjil | " + (data.metadata ? data.metadata.mata_pelajaran : mapelUjian);
        document.getElementById('infoNama').innerText = namaSiswa;
        document.getElementById('infoKelas').innerText = kelasSiswa;

        // Inisialisasi Timer
        initTimer(data, mapelUjian);

        // Render Soal ke DOM
        renderSoal(data.bank_soal);

        // Render Formula MathJax jika ada
        setTimeout(() => {
            if (typeof MathJax !== 'undefined' && typeof MathJax.typesetPromise === 'function') {
                MathJax.typesetPromise();
            }
        }, 1000);

        // Pasang Autosave Jawaban
        initAutosave();

    } catch (error) {
        document.getElementById('lembar-soal').innerHTML = `<p style='color:red;'><b>Gagal memuat soal! Pastikan berkas soal sudah ada di repositori Anda.</b></p>`;
        console.error("Error memuat soal:", error);
    }
});

// LOGIKA TIMER
function initTimer(data, mapelUjian) {
    let durasiMenit = (data.metadata && data.metadata.durasi_menit) 
                      ? data.metadata.durasi_menit 
                      : (CONFIG.DURASI_MAPEL[mapelUjian] || 120);

    if (!sessionStorage.getItem('exam_time_left')) {
        sessionStorage.setItem('exam_time_left', durasiMenit * 60);
    }

    let timeLeft = parseInt(sessionStorage.getItem('exam_time_left'));

    timerInterval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            let jedaAcak = Math.floor(Math.random() * 4000); 
            
            setTimeout(() => {
                alert("Waktu habis! Ujian akan dikumpulkan.");
                selesaiUjian();
            }, jedaAcak);
        } else {
            timeLeft--;
            sessionStorage.setItem('exam_time_left', timeLeft);
            let hours = Math.floor(timeLeft / 3600);
            let minutes = Math.floor((timeLeft % 3600) / 60);
            let seconds = timeLeft % 60;
            document.getElementById('timer-display').innerText = 
                (hours < 10 ? "0" : "") + hours + ":" +
                (minutes < 10 ? "0" : "") + minutes + ":" +
                (seconds < 10 ? "0" : "") + seconds;
        }
    }, 1000);
}

// RENDER SOAL
function renderSoal(daftarSoal) {
    let htmlSoal = "";
    daftarSoal.forEach((soal, index) => {
        htmlSoal += `<div class="soal-box">`;
        
        let bagianTeks = soal.teks_pertanyaan.split('\n\n');
        let teksPertanyaanBersih = "";

        if (bagianTeks.length > 1) {
            let bacaan = bagianTeks[0];
            bacaan = bacaan.replace(/ • /g, "\n• "); 
            bacaan = bacaan.replace(/ (\d+\.) /g, "\n$1 "); 
            bacaan = bacaan.replace(/Materials:/g, "\nMaterials:\n");
            bacaan = bacaan.replace(/Steps:/g, "\nSteps:\n");

            const adaArabBacaan = /[\u0600-\u06FF]/.test(bacaan);
            const kelasBacaan = adaArabBacaan ? "teks-arab font-khusus-arab" : "";

            htmlSoal += `<div class="bacaan ${kelasBacaan}">${bacaan.trim()}</div>`;
            teksPertanyaanBersih = bagianTeks[1];
        } else {
            teksPertanyaanBersih = soal.teks_pertanyaan;
        }

        teksPertanyaanBersih = teksPertanyaanBersih.replace(/^\d+\.\s*/, '');

        const adaArabPertanyaan = /[\u0600-\u06FF]/.test(teksPertanyaanBersih);
        const kelasPertanyaan = adaArabPertanyaan ? "teks-arab font-khusus-arab" : "";

        htmlSoal += `
            <div class="pertanyaan">
                <span style="font-weight:bold;">${index + 1}.</span>
                <span class="${kelasPertanyaan}">${teksPertanyaanBersih}</span>
            </div>`;
        
        htmlSoal += `<div class="opsi-container">`;
        
        soal.pilihan_jawaban.forEach((opsi, i) => {
            let nilaiOpsi = String.fromCharCode(65 + i);
            
            const adaArabOpsi = /[\u0600-\u06FF]/.test(opsi);
            const kelasOpsi = adaArabOpsi ? "teks-arab font-khusus-arab" : "";

            htmlSoal += `
                <div class="opsi">
                    <label>
                        <input type="radio" name="soal_${soal.id_soal}" value="${nilaiOpsi}"> 
                        <span class="${kelasOpsi}">${opsi}</span>
                    </label>
                </div>`;
        });
        htmlSoal += `</div></div>`;
    });

    document.getElementById('lembar-soal').innerHTML = htmlSoal;
}

// AUTOSAVE JAWABAN
function initAutosave() {
    document.querySelectorAll('input[type="radio"]').forEach(input => {
        let savedValue = sessionStorage.getItem(input.name);
        if (savedValue && input.value === savedValue) {
            input.checked = true;
        }

        input.addEventListener('change', function() {
            sessionStorage.setItem(this.name, this.value);
        });
    });
}

// VALIDASI DAN SUBMIT JAWABAN
function sebelumSubmit() {
    if (!bankSoalData) return;

    let belumTerjawab = [];
    
    bankSoalData.bank_soal.forEach((soal, index) => {
        let opsiDipilih = document.querySelector(`input[name="soal_${soal.id_soal}"]:checked`);
        if (!opsiDipilih) {
            belumTerjawab.push(index + 1);
        }
    });

    if (belumTerjawab.length > 0) {
        alert("Ada soal yang belum terjawab! Silakan periksa nomor: " + belumTerjawab.join(', '));
        return;
    }

    if (confirm("Apakah Anda yakin ingin mengumpulkan jawaban?")) {
        selesaiUjian();
    }
}

function selesaiUjian() {
    if (!bankSoalData) return;

    let totalSoal = bankSoalData.bank_soal.length;
    let jumlahBenar = 0;
    let jumlahSalah = 0;

    bankSoalData.bank_soal.forEach((soal) => {
        let opsiDipilih = document.querySelector(`input[name="soal_${soal.id_soal}"]:checked`);
        let kunciJawaban = bankSoalData.kunci_jawaban_rahasia ? bankSoalData.kunci_jawaban_rahasia[soal.id_soal] : undefined;

        if (opsiDipilih && String(opsiDipilih.value).toUpperCase() === String(kunciJawaban).toUpperCase()) {
            jumlahBenar++;
        } else {
            jumlahSalah++;
        }
    });

    let skorAkhir = ((jumlahBenar / totalSoal) * 100).toFixed(2);
    let rekapJawaban = kumpulkanJawaban();

    simpanKeSpreadsheet(
        sessionStorage.getItem('cbt_siswa'),
        sessionStorage.getItem('cbt_kelas'),
        sessionStorage.getItem('cbt_mapel'),
        skorAkhir,
        jumlahBenar,
        jumlahSalah,
        rekapJawaban
    );
}

function kumpulkanJawaban() {
    let jawaban = [];
    const daftarSoal = document.querySelectorAll('.soal-box'); 
    
    daftarSoal.forEach((soal) => {
        const inputDipilih = soal.querySelector('input[type="radio"]:checked');
        jawaban.push(inputDipilih ? inputDipilih.value : "-");
    });
    
    return jawaban;
}

async function simpanKeSpreadsheet(nama, kelas, mapel, skor, benar, salah, arrayJawaban) {
    const btnSubmit = document.querySelector('button[onclick="sebelumSubmit()"]');
    if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerText = "⏳ Sedang Mengirim Jawaban... Mohon Tunggu";
        btnSubmit.style.background = "#94a3b8";
    }

    let email = sessionStorage.getItem('cbt_email') || "-"; 
    let startTime = parseInt(sessionStorage.getItem('exam_start_time')) || Date.now();
    let durasiMenit = Math.round((Date.now() - startTime) / 60000);
    let durasiFinal = durasiMenit <= 0 ? 1 : durasiMenit;

    let dataSiswa = {
        nama: nama,
        kelas: kelas,
        mapel: mapel,
        skor: skor,
        benar: benar,
        salah: salah,
        waktu: durasiFinal + " Menit",
        email: email,
        jawaban: arrayJawaban
    };

    try {
        const res = await API.submitJawaban(dataSiswa);
        if (res.status === "success") {
            document.getElementById('popupModal').style.display = 'flex';
        } else {
            throw new Error(res.message || "Database menolak menyimpan data.");
        }
    } catch (err) {
        alert("❌ GAGAL MENGIRIM JAWABAN!\n\nPenyebab: " + err.message + "\n\nJawaban Anda belum terkirim. Silakan periksa koneksi internet lalu klik tombol 'Kumpulkan Jawaban' sekali lagi.");
        if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerText = "Kumpulkan Jawaban";
            btnSubmit.style.background = "#007bff";
        }
    }
}

// Custom Modal Handler
window.alert = function(message) {
    document.getElementById('customAlertTitle').innerText = 'Informasi';
    document.getElementById('customAlertMessage').innerText = message;
    document.getElementById('customAlertBtnCancel').style.display = 'none';
    document.getElementById('customAlertBtnOk').innerText = 'OK';
    document.getElementById('customAlertBtnOk').onclick = function() {
        tutupCustomAlert();
    };
    document.getElementById('customAlertModal').style.display = 'flex';
};

window.confirm = function(message) {
    document.getElementById('customAlertTitle').innerText = 'Konfirmasi';
    document.getElementById('customAlertMessage').innerText = message;
    document.getElementById('customAlertBtnCancel').style.display = 'inline-block';
    document.getElementById('customAlertBtnOk').innerText = 'Ya';
    document.getElementById('customAlertBtnOk').onclick = function() {
        tutupCustomAlert();
        selesaiUjian();
    };
    document.getElementById('customAlertBtnCancel').onclick = function() {
        tutupCustomAlert();
    };
    document.getElementById('customAlertModal').style.display = 'flex';
    return false;
};

function tutupCustomAlert() {
    document.getElementById('customAlertModal').style.display = 'none';
}

function keluarKeLogin() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}
