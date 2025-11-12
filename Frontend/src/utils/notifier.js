import { toast } from 'react-hot-toast';

/**
 * Menampilkan notifikasi sukses kustom.
 * @param {string} message - Pesan yang ingin ditampilkan.
 */
export const notifySuccess = (message) => {
  toast.success(message, {
    // Kustomisasi notifikasi sukses jika perlu
    duration: 3000, 
  });
};

/**
 * Menampilkan notifikasi error kustom.
 * Fungsi ini cerdas: ia bisa membaca pesan error dari string biasa,
 * error Axios (dengan kode status), atau error JavaScript lainnya.
 * * @param {object|string} error - Objek error atau pesan string.
 */
export const notifyError = (error) => {
  let message = 'Terjadi kesalahan. Silakan coba lagi.'; // Pesan default

  if (typeof error === 'string') {
    // 1. Jika errornya hanya string
    message = error;
  } 
  // 2. Cek error validasi Laravel (paling spesifik)
  else if (error.response && error.response.data && error.response.data.errors) {
    const errors = error.response.data.errors;
    const firstErrorKey = Object.keys(errors)[0];
    message = errors[firstErrorKey][0]; // cth: "Email wajib diisi."
  } 
  // 3. Cek pesan error kustom dari server
  else if (error.response && error.response.data && error.response.data.message) {
    message = error.response.data.message; // cth: "Login gagal."
  } 
  // 4. Cek kode status HTTP jika tidak ada pesan di atas
  else if (error.response && error.response.status) {
    switch (error.response.status) {
      case 401:
        message = 'Sesi Anda telah habis. Silakan login kembali.';
        break;
      case 403:
        message = 'Anda tidak memiliki izin untuk melakukan aksi ini.'; // Forbidden
        break;
      case 404:
        message = 'Endpoint atau data yang Anda tuju tidak ditemukan.'; // Not Found
        break;
      case 419:
        message = 'Sesi Anda kadaluarsa (CSRF). Silakan refresh halaman.'; // Page expired
        break;
      case 422:
        message = 'Data yang Anda kirim tidak valid (Unprocessable).';
        break;
      case 500:
      case 501:
      case 502:
      case 503:
        message = 'Terjadi masalah di server. Coba lagi nanti.'; // Server Error
        break;
      default:
        // Untuk kode lain seperti 402, 405, dll.
        message = `Terjadi error HTTP: ${error.response.status}`;
    }
  } 
  // 5. Cek error JavaScript umum (cth: "Network Error" jika server mati)
  else if (error.message) {
    message = error.message;
  }
  // 6. Jika tidak ada yang cocok, pesan default akan digunakan.

  toast.error(message, {
    // Pastikan error tampil lebih lama agar sempat dibaca
    duration: 6000, 
  });
};