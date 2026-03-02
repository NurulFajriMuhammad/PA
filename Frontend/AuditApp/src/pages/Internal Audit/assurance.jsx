import React, { useState } from 'react';
import { 
  BsShieldCheck, BsSearch, BsFilter, 
  BsClipboardCheck, BsClockHistory, BsCheck2Circle,
  BsThreeDotsVertical, BsArrowRightShort
} from 'react-icons/bs';

const Assurance = () => {
  const [dataAssurance] = useState([
    {
      id: 1,
      noST: "ST/2026/012",
      objek: "Pengadaan Inventaris Kantor 2025",
      tipe: "Kepatuhan",
      progress: 75,
      status: "In Progress",
      auditor: "Budi Santoso",
      deadline: "10 Mar 2026"
    },
    {
      id: 2,
      noST: "ST/2026/015",
      objek: "Manajemen Risiko Kredit",
      tipe: "Operasional",
      progress: 100,
      status: "Completed",
      auditor: "Rina Wijaya",
      deadline: "01 Mar 2026"
    },
    {
      id: 3,
      noST: "ST/2026/018",
      objek: "Laporan Keuangan Semester II",
      tipe: "Keuangan",
      progress: 30,
      status: "Planning",
      auditor: "Andi Hakim",
      deadline: "25 Mar 2026"
    }
  ]);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header Halaman */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <BsShieldCheck className="text-blue-600" /> Audit Assurance
          </h1>
          <p className="text-slate-500 mt-1">Monitoring pengujian pengendalian dan efektivitas sistem.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-all text-sm font-medium">
            <BsFilter /> Filter
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-semibold shadow-md shadow-blue-200">
            Export Data
          </button>
        </div>
      </div>

      {/* Statistik Ringkas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Penugasan" value="12" icon={<BsClipboardCheck />} color="blue" />
        <StatCard title="Sedang Berjalan" value="08" icon={<BsClockHistory />} color="orange" />
        <StatCard title="Selesai (Q1)" value="04" icon={<BsCheck2Circle />} color="green" />
      </div>

      {/* Tabel Utama */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-700">Daftar Pengujian Assurance</h3>
          <div className="relative">
            <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari objek audit..." 
              className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
            />
          </div>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
              <th className="px-6 py-4">Objek Audit & No. ST</th>
              <th className="px-6 py-4">Tipe Audit</th>
              <th className="px-6 py-4">Auditor</th>
              <th className="px-6 py-4">Progress KKA</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dataAssurance.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-700 text-sm">{item.objek}</div>
                  <div className="text-xs text-slate-400">{item.noST}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.tipe}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.auditor}</td>
                <td className="px-6 py-4">
                  <div className="w-full bg-slate-100 rounded-full h-1.5 max-w-[100px] mb-1">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full" 
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">{item.progress}% Selesai</span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-6 py-4 text-center">
                  <button className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                    <BsThreeDotsVertical className="text-slate-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="p-4 bg-slate-50/30 border-t border-slate-50 text-center">
          <button className="text-blue-600 text-sm font-semibold flex items-center gap-1 mx-auto hover:underline">
            Lihat Semua Riwayat Assurance <BsArrowRightShort size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Sub-komponen agar kode rapi
const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-green-50 text-green-600",
  };
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-lg text-xl ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <div className="text-sm text-slate-500 font-medium">{title}</div>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    "Completed": "bg-green-100 text-green-700",
    "In Progress": "bg-blue-100 text-blue-700",
    "Planning": "bg-slate-100 text-slate-700",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-tight ${styles[status]}`}>
      {status}
    </span>
  );
};

export default Assurance;