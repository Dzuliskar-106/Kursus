// Ganti URL ini dengan URL Web App Apps Script Anda!
const API_URL = "https://script.google.com/macros/s/AKfycbxKQIwHJLeuz2emwJjuBdEu1WhNtNRUwhoibK0Apd2wr1XInrQLOJTGf2vH5RDIZ3U4/exec";

let allStudents = [];
let studentDetails = {};

// 1. Ambil Semua Nama Siswa Saat Pertama Kali Website Dibatasi (Auto Load)
document.addEventListener("DOMContentLoaded", () => {
  fetchStudentList();
});

function fetchStudentList() {
  const loading = document.getElementById("loading");
  loading.classList.remove("d-none");

  fetch(`${API_URL}?action=getAllData`)
    .then(response => response.json())
    .then(data => {
      loading.classList.add("d-none");
      if (data.students) {
        allStudents = data.students;
        studentDetails = data.details;
        populateDatalist(allStudents);
      }
    })
    .catch(error => {
      loading.classList.add("d-none");
      console.error("Gagal mengambil daftar siswa:", error);
      alert("Gagal terhubung ke Google Sheets!");
    });
}

// 2. Tampilkan Opsi Auto-complete Nama
function populateDatalist(students) {
  const datalist = document.getElementById("studentOptions");
  datalist.innerHTML = "";
  students.forEach(nama => {
    const option = document.createElement("option");
    option.value = nama;
    datalist.appendChild(option);
  });
}

// 3. Tombol Cari Diklik
document.getElementById("btnCari").addEventListener("click", () => {
  const namaInput = document.getElementById("searchNama").value.trim();
  if (!namaInput) {
    alert("Silakan masukkan atau pilih nama siswa terlebih dahulu.");
    return;
  }
  getRiwayatSiswa(namaInput);
});

// 4. Ambil Riwayat Pertemuan Siswa
function getRiwayatSiswa(nama) {
  const loading = document.getElementById("loading");
  const resultCard = document.getElementById("resultCard");
  const tableBody = document.getElementById("tableBody");
  const namaSiswaTitle = document.getElementById("namaSiswaTitle");

  loading.classList.remove("d-none");
  resultCard.classList.add("d-none");

  fetch(`${API_URL}?nama=${encodeURIComponent(nama)}`)
    .then(response => response.json())
    .then(data => {
      loading.classList.add("d-none");
      namaSiswaTitle.innerText = nama;
      tableBody.innerHTML = "";

      if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Belum ada riwayat pertemuan untuk siswa ini.</td></tr>`;
      } else {
        data.forEach(item => {
          const row = `
            <tr>
              <td>Pertemuan ${item.pertemuan}</td>
              <td>${item.tanggal}</td>
              <td><span class="badge ${item.statusPembayaran === 'Lunas' ? 'bg-success' : 'bg-warning'}">${item.statusPembayaran}</span></td>
              <td>Rp ${parseInt(item.nominal || 0).toLocaleString('id-ID')}</td>
              <td>${item.catatan}</td>
            </tr>
          `;
          tableBody.innerHTML += row;
        });
      }

      resultCard.classList.remove("d-none");
    })
    .catch(error => {
      loading.classList.add("d-none");
      console.error("Gagal mengambil data riwayat:", error);
      alert("Terjadi kesalahan saat memuat riwayat!");
    });
}
