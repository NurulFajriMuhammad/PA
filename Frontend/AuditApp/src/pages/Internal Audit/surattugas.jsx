import React, { useState } from 'react';
import { 
  BsPlusLg, BsSearch, BsFileEarmarkPdf, 
  BsPencilSquare, BsTrash, BsEye 
} from 'react-icons/bs';

const SuratTugas = () => {
  // Data dummy untuk tampilan
  const [dataSurat] = useState([
    {
      id: "ST/2026/001",
      judul: "Audit Kepatuhan Operasional Cabang Surabaya",
      auditee: "Divisi Operasional",
      tanggal: "15 Feb 2026",
      status: "Berjalan",
      tim: ["Budi (Ketua)", "Andi", "Siti"]
    },
    {
      id: "ST/2026/002",
      judul: "Review Pengadaan Barang & Jasa IT",
      auditee: "Divisi IT & Infrastruktur",
      tanggal: "10 Feb 2026",
      status: "Selesai",
      tim: ["Rina (Ketua)", "Joko"]
    },
    {
      id: "ST/2026/003",
      judul: "Audit Investigasi Klaim Vendor",
      auditee: "Logistik",
      tanggal: "20 Feb 2026",
      status: "Draft",
      tim: ["Budi (Ketua)", "Rina"]
    }
  ]);

  return (
    <div style={{ padding: '25px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header Halaman */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '25px' 
      }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', fontWeight: 700 }}>Surat Tugas</h2>
          <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Manajemen dan monitoring penugasan audit internal.
          </p>
        </div>
        <button style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          fontWeight: 600,
          boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)'
        }}>
          <BsPlusLg /> Tambah Surat Tugas
        </button>
      </div>

      {/* Bar Filter & Pencarian */}
      <div style={{
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '12px',
        display: 'flex',
        gap: '15px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <BsSearch style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Cari nomor atau judul surat..." 
            style={{
              width: '100%',
              padding: '10px 10px 10px 40px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              outline: 'none'
            }}
          />
        </div>
        <select style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#475569' }}>
          <option>Semua Status</option>
          <option>Draft</option>
          <option>Berjalan</option>
          <option>Selesai</option>
        </select>
      </div>

      {/* Tabel Data */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>
            <tr>
              <th style={{ padding: '15px' }}>No. Surat</th>
              <th style={{ padding: '15px' }}>Judul Penugasan</th>
              <th style={{ padding: '15px' }}>Auditee</th>
              <th style={{ padding: '15px' }}>Tim Audit</th>
              <th style={{ padding: '15px' }}>Status</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: '0.9rem', color: '#1e293b' }}>
            {dataSurat.map((item, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '15px', fontWeight: 600 }}>{item.id}</td>
                <td style={{ padding: '15px' }}>
                  <div style={{ fontWeight: 500 }}>{item.judul}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Tgl: {item.tanggal}</div>
                </td>
                <td style={{ padding: '15px' }}>{item.auditee}</td>
                <td style={{ padding: '15px' }}>
                  <div style={{ fontSize: '0.8rem' }}>
                    {item.tim.join(', ')}
                  </div>
                </td>
                <td style={{ padding: '15px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: 
                      item.status === 'Berjalan' ? '#dcfce7' : 
                      item.status === 'Selesai' ? '#f1f5f9' : '#fef9c3',
                    color: 
                      item.status === 'Berjalan' ? '#166534' : 
                      item.status === 'Selesai' ? '#475569' : '#854d0e',
                  }}>
                    {item.status}
                  </span>
                </td>
                <td style={{ padding: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <button title="Lihat" style={actionBtnStyle}><BsEye /></button>
                    <button title="Edit" style={actionBtnStyle}><BsPencilSquare /></button>
                    <button title="Cetak PDF" style={{...actionBtnStyle, color: '#ef4444'}}><BsFileEarmarkPdf /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const actionBtnStyle = {
  background: 'none',
  border: 'none',
  color: '#64748b',
  fontSize: '1.1rem',
  cursor: 'pointer',
  padding: '5px',
  display: 'flex',
  alignItems: 'center',
  transition: '0.2s'
};

export default SuratTugas;