import React, { useState } from 'react';
import { 
  BsArrowRepeat, BsSearch, BsClock, 
  BsCheckCircleFill, BsExclamationTriangleFill,
  BsFileEarmarkArrowUp, BsFilterRight, BsCalendar4Week,
  BsEye, BsX
} from 'react-icons/bs';
import { notifySuccess } from '../../../Shared/utils/notifier';

const FollowUp = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null); // Untuk Modal

  const [dataFollowUp] = useState([
    {
      id: "TL-001",
      temuan: "Kekurangan Dokumentasi Invoice Vendor",
      unit: "Logistik",
      deadline: "10 Mar 2026",
      prioritas: "Medium",
      progress: 100,
      status: "Selesai",
      rekomendasi: "Lakukan digitalisasi arsip invoice.",
      pic: "Andi Saputra",
      tglUpdate: "20 Feb 2026"
    },
    {
      id: "TL-002",
      temuan: "Selisih Kas Kecil Cabang Surabaya",
      unit: "Keuangan",
      deadline: "01 Mar 2026",
      prioritas: "High",
      progress: 45,
      status: "Proses",
      rekomendasi: "Rekonsiliasi harian wajib dilakukan.",
      pic: "Siti Aminah",
      tglUpdate: "25 Feb 2026"
    },
    {
      id: "TL-003",
      temuan: "Akses User IT Tidak Dicabut (Resign)",
      unit: "IT & Infrastruktur",
      deadline: "25 Feb 2026",
      prioritas: "Critical",
      progress: 0,
      status: "Terlambat",
      rekomendasi: "Cabang akses user maksimal 1x24 jam.",
      pic: "Budi IT",
      tglUpdate: "10 Feb 2026"
    }
  ]);

  const handleUpload = (id) => {
    notifySuccess(`Modul upload untuk ${id} berhasil dibuka`);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-lg">
              <BsArrowRepeat className="text-rose-600" />
            </div> 
            Monitoring Tindak Lanjut
          </h1>
          <p className="text-slate-500 mt-1">Pantau realisasi perbaikan dari hasil rekomendasi audit.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:shadow-md transition-all">
          <BsCalendar4Week /> LAPORAN REALISASI
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <MiniCard label="Total Temuan" value="28" sub="Aktif" color="blue" />
        <MiniCard label="Belum Selesai" value="12" sub="Perlu Tindakan" color="amber" />
        <MiniCard label="Terlambat" value="03" sub="High Risk" color="rose" />
        <MiniCard label="Selesai" value="13" sub="Closed" color="emerald" />
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4 bg-white">
          <div className="relative w-full md:w-96">
            <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari ID, unit, atau deskripsi..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all">
              <BsFilterRight size={16} /> FILTER STATUS
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.1em] border-b border-slate-100">
                <th className="px-6 py-4">ID & Deskripsi</th>
                <th className="px-6 py-4">Unit Kerja</th>
                <th className="px-6 py-4">Target Selesai</th>
                <th className="px-6 py-4">Prioritas</th>
                <th className="px-6 py-4">Realisasi</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {dataFollowUp.filter(item => item.temuan.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 max-w-xs">
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full mb-2 inline-block">#{item.id}</span>
                    <div className="text-sm font-bold text-slate-700 leading-snug group-hover:text-rose-600 transition-colors">{item.temuan}</div>
                    <div className="text-[11px] text-slate-400 mt-1 line-clamp-1 italic">Rec: {item.rekomendasi}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-slate-600">{item.unit}</div>
                    <div className="text-[10px] text-slate-400">PIC: {item.pic}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-2 text-sm font-bold ${item.status === 'Terlambat' ? 'text-rose-500' : 'text-slate-600'}`}>
                      <BsClock /> {item.deadline}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <PriorityTag priority={item.prioritas} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="w-24 bg-slate-100 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-1000 ${item.status === 'Selesai' ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-black text-slate-400">{item.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusTag status={item.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => setSelectedItem(item)}
                        className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all" 
                        title="Lihat Detail"
                      >
                        <BsEye size={14} />
                      </button>
                      <button 
                        onClick={() => handleUpload(item.id)}
                        className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all" 
                        title="Upload Bukti"
                      >
                        <BsFileEarmarkArrowUp size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETAIL (Fitur Tambahan) */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-slate-800">Detail Tindak Lanjut #{selectedItem.id}</h2>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-slate-600"><BsX size={24}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Temuan</label>
                <p className="text-sm font-bold text-slate-700">{selectedItem.temuan}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Rekomendasi Auditor</label>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border-l-4 border-rose-500 italic">{selectedItem.rekomendasi}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">PIC Unit</label>
                  <span className="font-semibold">{selectedItem.pic}</span>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Update Terakhir</label>
                  <span className="font-semibold">{selectedItem.tglUpdate}</span>
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 rounded-b-2xl flex justify-end">
              <button onClick={() => setSelectedItem(null)} className="px-6 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs">TUTUP</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-components
const MiniCard = ({ label, value, sub, color }) => {
  const styles = {
    blue: "border-l-blue-500",
    amber: "border-l-amber-500",
    rose: "border-l-rose-500",
    emerald: "border-l-emerald-500"
  };
  return (
    <div className={`bg-white p-5 rounded-2xl border border-slate-200 border-l-4 ${styles[color]} shadow-sm transition-transform hover:scale-[1.02]`}>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <h3 className="text-2xl font-black text-slate-800 mt-1">{value}</h3>
      <p className="text-[10px] text-slate-400 mt-1 font-bold italic">{sub}</p>
    </div>
  );
};

const PriorityTag = ({ priority }) => {
  const style = priority === 'Critical' ? 'bg-rose-600 text-white' : priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600';
  return <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${style}`}>{priority}</span>;
};

const StatusTag = ({ status }) => {
  if (status === 'Selesai') return <span className="flex items-center gap-1.5 text-emerald-600 font-black text-[11px] bg-emerald-50 px-2 py-1 rounded-md tracking-tighter"><BsCheckCircleFill /> {status.toUpperCase()}</span>;
  if (status === 'Terlambat') return <span className="flex items-center gap-1.5 text-rose-600 font-black text-[11px] bg-rose-50 px-2 py-1 rounded-md animate-pulse tracking-tighter"><BsExclamationTriangleFill /> {status.toUpperCase()}</span>;
  return <span className="flex items-center gap-1.5 text-amber-600 font-black text-[11px] bg-amber-50 px-2 py-1 rounded-md tracking-tighter"><BsClock /> {status.toUpperCase()}</span>;
};

export default FollowUp;