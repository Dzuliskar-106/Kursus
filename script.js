// ISI DENGAN URL WEB APP GOOGLE APPS SCRIPT ANDA
const API_URL = "https://script.google.com/macros/s/AKfycby9h1Lm_wIGNqIOe0BrODLdZnhrrzABpgvMvG2I910WH9KIoi3dk_9s-SfA_8Rkwi9u/exec";

let globalDetails = {};

// --- FUNGSI HALAMAN ORANG TUA ---
async function initOrangTua() {
  showStatus("statusBox", "Memuat daftar siswa...", "#fff3cd", "#856404");
  const data = await fetchData(`${API_URL}?action=getAllData`);

  if (data && data.students) {
    const select = document.getElementById("selectNama");
    select.innerHTML = '<option value="">-- Pilih Nama Siswa --</option>';
    data.students.forEach(nama => {
      select.innerHTML += `<option value="${nama}">${nama}</option>`;
    });
    hideStatus("statusBox");
  } else {
    showStatus("statusBox", "Gagal memuat data siswa!", "#f8d7da", "#721c24");
  }
}

async function cariRiwayat() {
  const nama = document.getElementById("selectNama").value;
  if (!nama) return alert("Pilih nama siswa terlebih dahulu!");

  showStatus("statusBox", "Mengambil riwayat...", "#fff3cd", "#856404");
  const data = await fetchData(`${API_URL}?nama=${encodeURIComponent(nama)}`);
  
  const tbody = document.getElementById("bodyTabel");
  tbody.innerHTML = "";

  if (data && data.length > 0) {
    data.forEach(item => {
      tbody.innerHTML += `
        <tr>
          <td>${item.pertemuan}</td>
          <td>${item.tanggal}</td>
          <td>${item.statusPembayaran}</td>
          <td>Rp ${Number(item.nominal).toLocaleString('id-ID')}</td>
          <td>${item.catatan}</td>
        </tr>`;
    });
    document.getElementById("tabelRiwayat").style.display = "table";
    hideStatus("statusBox");
  } else {
    document.getElementById("tabelRiwayat").style.display = "none";
    showStatus("statusBox", "Belum ada riwayat pertemuan untuk siswa ini.", "#d1ecf1", "#0c5460");
  }
}

// --- FUNGSI HALAMAN ADMIN ---
async function initAdmin() {
  document.getElementById("tanggal").valueAsDate = new Date();
  showStatus("statusBoxAdmin", "Memuat daftar siswa...", "#fff3cd", "#856404");

  const data = await fetchData(`${API_URL}?action=getAllData`);

  if (data && data.students) {
    globalDetails = data.details || {};
    const select = document.getElementById("selectNamaAdmin");
    select.innerHTML = '<option value="">-- Pilih Nama Siswa --</option>';
    data.students.forEach(nama => {
      select.innerHTML += `<option value="${nama}">${nama}</option>`;
    });
    hideStatus("statusBoxAdmin");
  } else {
    showStatus("statusBoxAdmin", "Gagal terhubung ke server!", "#f8d7da", "#721c24");
  }
}

function autoFillDetail() {
  const nama = document.getElementById("selectNamaAdmin").value;
  if (globalDetails[nama]) {
    const detail = globalDetails[nama];
    document.getElementById("pertemuan").value = (detail.maxPertemuan || 0) + 1;
    document.getElementById("nominal").value = detail.lastNominal || "100000";
    document.getElementById("statusPembayaran").value = detail.lastStatus || "Lunas";
  }
}

async function kirimLaporan(e) {
  e.preventDefault();
  const btn = document.getElementById("btnSubmit");
  btn.disabled = true;
  btn.innerText = "Menyimpan...";
  showStatus("statusBoxAdmin", "Mengirim data...", "#fff3cd", "#856404");

  const payload = {
    nama: document.getElementById("selectNamaAdmin").value,
    pertemuan: document.getElementById("pertemuan").value,
    tanggal: document.getElementById("tanggal").value,
    statusPembayaran: document.getElementById("statusPembayaran").value,
    nominal: document.getElementById("nominal").value,
    catatan: document.getElementById("catatan").value
  };

  try {
    await fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    showStatus("statusBoxAdmin", "Laporan berhasil disimpan!", "#d4edda", "#155724");
    document.getElementById("formInput").reset();
    document.getElementById("tanggal").valueAsDate = new Date();
  } catch (err) {
    showStatus("statusBoxAdmin", "Gagal menyimpan data!", "#f8d7da", "#721c24");
  } finally {
    btn.disabled = false;
    btn.innerText = "Simpan Laporan";
  }
}

// --- HELPER FUNCTION ---
async function fetchData(url) {
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow" });
    return await res.json();
  } catch (err) {
    console.error("Fetch error:", err);
    return null;
  }
}

function showStatus(id, msg, bgColor, textColor) {
  const box = document.getElementById(id);
  box.style.display = "block";
  box.style.backgroundColor = bgColor;
  box.style.color = textColor;
  box.innerText = msg;
}

function hideStatus(id) {
  document.getElementById(id).style.display = "none";
}
