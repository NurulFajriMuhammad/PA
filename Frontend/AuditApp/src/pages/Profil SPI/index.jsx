import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';

// --- (A) PUSAT DATA KONTEN ANDA ---
// Ganti isi 'content' dengan data Anda yang sebenarnya.
// Anda bisa menggunakan JSX di sini, termasuk <img>, <ul>, dll.

const contentDatabase = {
  'visi-misi': {
    title: 'Visi, Misi, Core Values, & Code of Ethics',
    content: (
      <>
        <h3>Visi SPI</h3>
        <p>
          Menjadi Satuan Pengawasan Intern (SPI) yang profesional, independen, 
          dan objektif dalam mengawal terwujudnya tata kelola universitas yang 
          baik (Good University Governance).
        </p>
        
        <h3>Misi SPI</h3>
        <ul>
          <li>Melaksanakan kegiatan audit internal yang sistematis dan terarah.</li>
          <li>Memberikan rekomendasi perbaikan yang bernilai tambah.</li>
          <li>Mengembangkan kompetensi dan profesionalisme auditor internal.</li>
        </ul>

        <h3>Core Values</h3>
        <p>
          Isi konten untuk Core Values di sini... (Contoh: Integritas, Profesionalisme, Objektivitas).
        </p>

        <h3>Code of Ethics</h3>
        <p>
          Isi konten untuk Code of Ethics di sini...
        </p>
      </>
    )
  },
  'piagam-audit': {
    title: 'Piagam Audit Internal',
    content: (
      <>
        <p>
          Isi lengkap Piagam Audit Internal Anda di sini. Anda bisa 
          menambahkan paragraf sebanyak yang Anda perlukan.
        </p>
        <p>
          Piagam Audit Internal (Internal Audit Charter) adalah dokumen resmi
          yang mendefinisikan tujuan, wewenang, dan tanggung jawab...
        </p>
        {/* Anda bisa juga menautkan ke PDF jika ada */}
        <a href="/dokumen/piagam-audit.pdf" target="_blank" rel="noopener noreferrer">
          Unduh Piagam Audit (PDF)
        </a>
      </>
    )
  },
  'struktur-organisasi': {
    title: 'Struktur Organisasi dan Tugas Fungsi',
    content: (
      <>
        <p>
          Berikut adalah struktur organisasi Satuan Pengawasan Intern (SPI) kami.
        </p>
        {/* Ganti 'src' dengan path gambar struktur organisasi Anda */}
        <img 
          src="https://via.placeholder.com/800x500?text=Contoh+Bagan+Struktur+Organisasi" 
          alt="Struktur Organisasi SPI" 
          style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', marginTop: '16px' }} 
        />
        <h3 style={{ marginTop: '24px' }}>Tugas dan Fungsi</h3>
        <p>
          Isi penjelasan mengenai tugas dan fungsi masing-masing bagian di sini...
        </p>
      </>
    )
  },
  'profil-pengawas': {
    title: 'Profil Pengawas',
    content: (
      <>
        <p>
          Tim kami terdiri dari para profesional yang berdedikasi...
        </p>
        {/* Anda bisa mengulang blok ini untuk setiap profil */}
        <div className="profile-card-simple">
          <img 
            src="https://via.placeholder.com/150?text=Foto+Profil" 
            alt="Foto Profil Pengawas" 
          />
          <div className="profile-info">
            <h4>Nama Lengkap Pengawas, S.E., M.Ak.</h4>
            <strong>Ketua SPI</strong>
            <p>
              Isi biografi singkat, kualifikasi, atau keahlian pengawas di sini...
            </p>
          </div>
        </div>
        <div className="profile-card-simple">
          <img 
            src="https://via.placeholder.com/150?text=Foto+Profil" 
            alt="Foto Profil Pengawas" 
          />
          <div className="profile-info">
            <h4>Nama Anggota Pengawas Lain, S.Kom.</h4>
            <strong>Anggota Auditor</strong>
            <p>
              Isi biografi singkat anggota tim lainnya di sini...
            </p>
          </div>
        </div>
      </>
    )
  },
  'achievement': {
    title: 'Achievement',
    content: (
      <>
        <p>
          Beberapa pencapaian dan penghargaan yang telah diraih oleh SPI:
        </p>
        <ul>
          <li>Pencapaian A (Tahun 2024): ...</li>
          <li>Pencapaian B (Tahun 2023): ...</li>
          <li>Sertifikasi Profesional Auditor Internal (Tahun 2022): ...</li>
        </ul>
      </>
    )
  },
  // Data fallback jika slug tidak ditemukan
  'not-found': {
    title: 'Halaman Tidak Ditemukan',
    content: (
      <p>
        Konten yang Anda cari tidak dapat ditemukan. Silakan kembali ke 
        menu sebelumnya.
      </p>
    )
  }
};


// --- (B) KODE KOMPONEN UTAMA ---
// (Anda tidak perlu mengubah apa pun di bawah ini)

export default function ProfilSpiPage() {
  const { slug } = useParams(); // Mengambil 'slug' dari URL (cth: 'visi-misi')
  const [pageContent, setPageContent] = useState(null);

  useEffect(() => {
    // Setiap kali 'slug' berubah, cari konten yang sesuai
    const data = contentDatabase[slug] || contentDatabase['not-found'];
    setPageContent(data);
  }, [slug]);

  // Jika konten belum dimuat (meskipun cepat), jangan tampilkan apa-apa
  if (!pageContent) {
    return null; 
  }

  return (
    <>
      {/* --- (C) GAYA TAMPILAN (CSS) --- */}
      <style>
        {`
          .page-content-container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 24px 32px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid #e7e7e7;
          }

          .page-content-header {
            font-size: 1.8em; /* 28px */
            font-weight: 700;
            color: #2c3e50; /* Warna biru tua dari sidebar */
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 16px;
            margin-top: 0;
            margin-bottom: 24px;
            line-height: 1.3;
          }

          .page-content-body {
            color: #333;
            font-size: 1em; /* 16px */
            line-height: 1.7;
          }

          .page-content-body h3 {
            font-size: 1.4em; /* 22px */
            font-weight: 600;
            color: #34495e;
            margin-top: 32px;
            margin-bottom: 12px;
          }

          .page-content-body p {
            margin-bottom: 16px;
          }

          .page-content-body ul {
            margin-left: 20px;
            margin-bottom: 16px;
          }
          
          .page-content-body li {
            margin-bottom: 8px;
          }

          .page-content-body a {
            color: #3498db;
            text-decoration: none;
            font-weight: 600;
          }
          
          .page-content-body a:hover {
            text-decoration: underline;
          }

          /* CSS khusus untuk kartu profil */
          .profile-card-simple {
            display: flex;
            align-items: flex-start;
            gap: 20px;
            padding: 20px;
            border: 1px solid #eee;
            border-radius: 8px;
            background-color: #fcfcfc;
            margin-bottom: 20px;
          }
          
          .profile-card-simple img {
            width: 150px;
            height: 150px;
            object-fit: cover;
            border-radius: 50%;
            border: 3px solid #fff;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          }
          
          .profile-card-simple .profile-info {
            flex: 1;
          }
          
          .profile-card-simple h4 {
            margin-top: 0;
            margin-bottom: 4px;
            font-size: 1.25em;
            color: #2c3e50;
          }
          
          .profile-card-simple strong {
            display: block;
            font-size: 0.95em;
            color: #3498db;
            margin-bottom: 12px;
          }
          
          .profile-card-simple p {
            font-size: 0.9em;
            color: #555;
            margin-bottom: 0;
          }

          /* Responsif untuk mobile */
          @media (max-width: 768px) {
            .page-content-container {
              padding: 20px;
            }
            .page-content-header {
              font-size: 1.5em;
            }
            .profile-card-simple {
              flex-direction: column;
              align-items: center;
              text-align: center;
            }
          }
        `}
      </style>

      {/* --- (D) JSX TAMPILAN --- */}
      <div className="page-content-container">
        <h2 className="page-content-header">
          {pageContent.title}
        </h2>
        <div className="page-content-body">
          {pageContent.content}
        </div>
      </div>
    </>
  );
}