import React, { useState } from 'react';
import { 
  BsExclamationTriangle, BsPlusLg, BsPencil, 
  BsTrash, BsTags, BsFlagFill 
} from 'react-icons/bs';

const StatusTemuan = () => {
  const [categories] = useState([
    { id: 1, label: 'Mayor', color: '#ef4444', desc: 'Pelanggaran sistemik atau fatal terhadap prosedur.', deadline: '7 Hari' },
    { id: 2, label: 'Minor', color: '#f59e0b', desc: 'Penyimpangan non-sistemik yang perlu perbaikan.', deadline: '14 Hari' },
    { id: 3, label: 'Observasi', color: '#3b82f6', desc: 'Saran perbaikan untuk efisiensi operasional.', deadline: '30 Hari' },
    { id: 4, label: 'Kepatuhan', color: '#10b981', desc: 'Temuan terkait regulasi dan perundang-undangan.', deadline: '7 Hari' },
  ]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BsExclamationTriangle className="text-red-500" /> Status & Kategori Temuan
          </h2>
          <p className="text-sm text-slate-500">Definisikan klasifikasi temuan audit berdasarkan tingkat risiko.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all text-sm font-semibold border-none cursor-pointer shadow-sm">
          <BsPlusLg /> Tambah Kategori
        </button>
      </div>

      {/* Grid Kategori */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {categories.map((item) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 w-1 h-full" 
              style={{ backgroundColor: item.color }}
            />
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Kategori</span>
              <BsFlagFill style={{ color: item.color }} size={14} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">{item.label}</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4 min-h-[40px]">
              {item.desc}
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <BsTags /> SLA: {item.deadline}
              </span>
              <div className="flex gap-1">
                <button className="p-1.5 text-slate-400 hover:text-blue-600 bg-transparent border-none cursor-pointer"><BsPencil size={12}/></button>
                <button className="p-1.5 text-slate-400 hover:text-red-600 bg-transparent border-none cursor-pointer"><BsTrash size={12}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabel Detail Konfigurasi */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Matriks Risiko Temuan</h4>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Status Progress</th>
              <th className="px-6 py-4">Definisi Logika</th>
              <th className="px-6 py-4">Warna Badge</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <StatusRow label="Open" color="#ef4444" desc="Temuan baru yang belum ditindaklanjuti." />
            <StatusRow label="In Progress" color="#3b82f6" desc="Auditee sedang melakukan perbaikan." />
            <StatusRow label="Resolved" color="#10b981" desc="Temuan telah diperbaiki dan diverifikasi." />
            <StatusRow label="Closed" color="#94a3b8" desc="Temuan selesai dan tidak perlu aksi lagi." />
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Sub-komponen Row Tabel
const StatusRow = ({ label, color, desc }) => (
  <tr className="hover:bg-slate-50/50 transition-colors">
    <td className="px-6 py-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="font-bold text-slate-700 text-sm">{label}</span>
      </div>
    </td>
    <td className="px-6 py-4 text-xs text-slate-500">{desc}</td>
    <td className="px-6 py-4 font-mono text-[10px] text-slate-400 uppercase">{color}</td>
    <td className="px-6 py-4 text-center">
      <button className="text-xs text-blue-600 font-bold bg-transparent border-none cursor-pointer hover:underline">Edit</button>
    </td>
  </tr>
);

export default StatusTemuan;