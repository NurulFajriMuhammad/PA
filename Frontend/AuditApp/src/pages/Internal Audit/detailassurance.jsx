import React, { useState } from 'react';
import { 
  BsInfoCircle, BsClipboardCheck, BsSearch, 
  BsFileEarmarkPdf, BsArrowLeft, BsCheckCircleFill, 
  BsCloudUpload, BsPlusLg 
} from 'react-icons/bs';
import { useParams, useNavigate } from 'react-router-dom';

const InternalAuditDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('umum');

  // Tab Menu Configuration
  const tabs = [
    { id: 'umum', label: 'Informasi Umum', icon: <BsInfoCircle /> },
    { id: 'kka', label: 'Pelaksanaan (KKA)', icon: <BsClipboardCheck /> },
    { id: 'temuan', label: 'Daftar Temuan', icon: <BsSearch /> },
    { id: 'lha', label: 'Laporan (LHA)', icon: <BsFileEarmarkPdf /> },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Tombol Kembali & Header */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-500 hover:text-rose-600 font-bold text-xs mb-4 transition-colors"
      >
        <BsArrowLeft /> KEMBALI KE DAFTAR ASSURANCE
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header Header Detail */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Project ID: {slug?.toUpperCase() || 'AUDIT-2026'}</span>
              <h1 className="text-2xl font-bold text-white mt-1">Audit Operasional Pengadaan Barang & Jasa</h1>
              <p className="text-slate-400 text-sm mt-1">Periode Pemeriksaan: Semester I - 2026</p>
            </div>
            <span className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-full text-[11px] font-black uppercase">
              Status: Fieldwork
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-8 py-4 text-sm font-bold transition-all relative ${
                activeTab === tab.id 
                ? 'text-rose-600' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.icon} {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-rose-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Dynamic Content Based on Tab */}
        <div className="p-8">
          {activeTab === 'umum' && <TabInformasiUmum />}
          {activeTab === 'kka' && <TabKKA />}
          {activeTab === 'temuan' && <TabTemuan />}
          {activeTab === 'lha' && <TabLHA />}
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS UNTUK TIAP TAB ---

const TabInformasiUmum = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Detail Tim Audit</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-slate-400 text-sm">Penanggung Jawab</span>
          <span className="text-slate-700 font-semibold text-sm">Dr. Ahmad Auditor, CIA</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400 text-sm">Ketua Tim</span>
          <span className="text-slate-700 font-semibold text-sm">Siska Wijaya, M.Acc</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400 text-sm">Anggota</span>
          <span className="text-slate-700 font-semibold text-sm">Budi Doremi, Reza Rahadian</span>
        </div>
      </div>
    </div>
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Jadwal & Lokasi</h3>
      <div className="p-4 bg-slate-50 rounded-xl space-y-3">
        <p className="text-sm text-slate-600"><strong>Objek Audit:</strong> Biro Sarana & Prasarana</p>
        <p className="text-sm text-slate-600"><strong>Entry Meeting:</strong> 01 Feb 2026</p>
        <p className="text-sm text-slate-600"><strong>Exit Meeting:</strong> 28 Feb 2026</p>
      </div>
    </div>
  </div>
);

const TabKKA = () => (
  <div className="space-y-4 animate-fadeIn">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-bold text-slate-800">Kertas Kerja Audit (Working Papers)</h3>
      <button className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-all">
        <BsPlusLg /> TAMBAH KKA
      </button>
    </div>
    <div className="border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500 font-bold">
          <tr>
            <th className="px-6 py-3 border-b">Prosedur Audit</th>
            <th className="px-6 py-3 border-b text-center">Status</th>
            <th className="px-6 py-3 border-b text-center">Lampiran</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          <tr>
            <td className="px-6 py-4">Pemeriksaan fisik aset kendaraan dinas operasional</td>
            <td className="px-6 py-4 text-center">
              <span className="text-emerald-500 font-bold flex items-center justify-center gap-1"><BsCheckCircleFill /> Selesai</span>
            </td>
            <td className="px-6 py-4 text-center">
              <button className="text-rose-600 hover:underline">Lampiran_A1.pdf</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

const TabTemuan = () => (
  <div className="text-center py-12 animate-fadeIn">
    <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
      <BsSearch size={24} />
    </div>
    <h3 className="text-slate-800 font-bold">Belum Ada Temuan Mayor</h3>
    <p className="text-slate-500 text-sm mt-1">Semua hasil observasi masih dalam tahap klarifikasi di KKA.</p>
  </div>
);

const TabLHA = () => (
  <div className="max-w-2xl mx-auto p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center animate-fadeIn">
    <BsFileEarmarkPdf size={48} className="text-slate-300 mx-auto mb-4" />
    <h3 className="text-lg font-bold text-slate-800">Draft Laporan Hasil Audit</h3>
    <p className="text-slate-500 text-sm mb-6">Laporan final akan otomatis ter-generate setelah seluruh KKA disetujui oleh Reviewer.</p>
    <button className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all flex items-center gap-2 mx-auto">
      <BsCloudUpload /> GENERATE DRAFT PDF
    </button>
  </div>
);

export default InternalAuditDetail;