import React, { useState } from 'react';
import { 
  BsCalendar4Event, BsPlusLg, BsCheckCircle, 
  BsLockFill, BsUnlockFill, BsPencil, BsArchive 
} from 'react-icons/bs';

const PeriodeAudit = () => {
  const [periodes] = useState([
    { id: 1, tahun: '2024', nama: 'Audit Tahunan 2024', mulai: '01 Jan 2024', selesai: '31 Des 2024', status: 'Closed' },
    { id: 2, tahun: '2025', nama: 'Audit Semester I 2025', mulai: '01 Jan 2025', selesai: '30 Jun 2025', status: 'Active' },
    { id: 3, tahun: '2025', nama: 'Audit Semester II 2025', mulai: '01 Jul 2025', selesai: '31 Des 2025', status: 'Draft' },
  ]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BsCalendar4Event className="text-emerald-600" /> Periode Audit
          </h2>
          <p className="text-sm text-slate-500">Kelola kalender kerja dan masa berlaku penginputan data audit.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all text-sm font-semibold border-none cursor-pointer shadow-sm">
          <BsPlusLg /> Buka Periode Baru
        </button>
      </div>

      {/* Stats Singkat */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl">
            <BsCheckCircle />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Periode Aktif</p>
            <p className="text-sm font-bold text-slate-700">Semester I 2025</p>
          </div>
        </div>
      </div>

      {/* Tabel Periode */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Tahun</th>
              <th className="px-6 py-4">Nama Periode</th>
              <th className="px-6 py-4">Rentang Waktu</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {periodes.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-700">{item.tahun}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-slate-700">{item.nama}</div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                  {item.mulai} - {item.selesai}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight flex items-center gap-1.5 ${
                      item.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                      item.status === 'Closed' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                      'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}>
                      {item.status === 'Active' ? <BsUnlockFill size={10}/> : <BsLockFill size={10}/>}
                      {item.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-blue-600 bg-transparent border-none cursor-pointer"><BsPencil size={14}/></button>
                    <button className="p-2 text-slate-400 hover:text-amber-600 bg-transparent border-none cursor-pointer" title="Arsipkan"><BsArchive size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Warning Box */}
      <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3">
        <BsLockFill className="text-red-500 shrink-0 mt-1" />
        <div>
          <h5 className="text-xs font-bold text-red-800">Catatan Keamanan Data</h5>
          <p className="text-[11px] text-red-700 leading-relaxed mt-1">
            Menutup (Close) periode akan mengunci seluruh data KKA, Temuan, dan Laporan pada periode tersebut. Data yang sudah dikunci hanya bisa dibuka kembali oleh level Super Admin.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PeriodeAudit;