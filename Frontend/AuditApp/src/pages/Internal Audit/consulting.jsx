import React, { useState } from 'react';
import { 
  BsLightbulb, BsSearch, BsFolder2Open, 
  BsArrowRepeat, BsPeopleFill, BsJournalText,
  BsFillBookmarkStarFill, BsLink45Deg
} from 'react-icons/bs';

const Consulting = () => {
  const [dataConsulting] = useState([
    {
      id: "CON-2026-004",
      proyek: "Penyusunan Fraud Risk Management Framework",
      klien: "Divisi Compliance",
      tahap: "Designing",
      deadline: "15 April 2026",
      tim: 4,
      prioritas: "Strategis"
    },
    {
      id: "CON-2026-007",
      proyek: "Optimasi Proses Procurement End-to-End",
      klien: "Logistik & Purchasing",
      tahap: "Implementation",
      deadline: "20 Maret 2026",
      tim: 3,
      prioritas: "Penting"
    },
    {
      id: "CON-2026-009",
      proyek: "Fasilitasi Risk Assessment Tahunan",
      klien: "Seluruh Unit Bisnis",
      tahap: "Reporting",
      deadline: "05 Maret 2026",
      tim: 5,
      prioritas: "Rutin"
    }
  ]);

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-violet-600 rounded-lg text-white">
              <BsLightbulb />
            </div>
            Internal Consulting
          </h1>
          <p className="text-slate-500 mt-2 text-sm">Proyek pendampingan strategis untuk peningkatan nilai tambah organisasi.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all flex items-center gap-2">
            <BsJournalText /> Log Aktivitas
          </button>
          <button className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700 shadow-md shadow-violet-200 border-none transition-all flex items-center gap-2">
            <BsLink45Deg size={18} /> Proyek Baru
          </button>
        </div>
      </div>

      {/* Grid Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatusCard label="Proyek Aktif" value="06" icon={<BsArrowRepeat className="text-violet-500" />} />
        <StatusCard label="Total Jam Konsultasi" value="120h" icon={<BsPeopleFill className="text-blue-500" />} />
        <StatusCard label="Proyek Strategis" value="02" icon={<BsFillBookmarkStarFill className="text-amber-500" />} />
        <StatusCard label="Dokumen Selesai" value="15" icon={<BsFolder2Open className="text-emerald-500" />} />
      </div>

      {/* Consulting Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="font-bold text-slate-800 tracking-tight">Monitoring Penugasan Consulting</h2>
          <div className="relative w-full md:w-72">
            <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari proyek konsultasi..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr className="text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                <th className="px-8 py-4">Nama Proyek & Klien</th>
                <th className="px-6 py-4">Prioritas</th>
                <th className="px-6 py-4">Tahapan</th>
                <th className="px-6 py-4">Deadline</th>
                <th className="px-6 py-4">Tim</th>
                <th className="px-8 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataConsulting.map((item) => (
                <tr key={item.id} className="hover:bg-violet-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="font-bold text-slate-800 text-sm">{item.proyek}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono uppercase">{item.id}</span>
                      <span className="text-xs text-slate-400 font-medium">{item.klien}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                      item.prioritas === 'Strategis' ? 'text-violet-600 bg-violet-50 border-violet-100' : 
                      item.prioritas === 'Penting' ? 'text-blue-600 bg-blue-50 border-blue-100' : 
                      'text-slate-500 bg-slate-50 border-slate-100'
                    }`}>
                      {item.prioritas}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${
                        item.tahap === 'Implementation' ? 'bg-blue-500' : 
                        item.tahap === 'Designing' ? 'bg-violet-500' : 'bg-emerald-500'
                      }`}></div>
                      <span className="text-sm text-slate-600 font-semibold">{item.tahap}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm text-slate-600 font-medium">{item.deadline}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex -space-x-2">
                      {[...Array(item.tim)].map((_, i) => (
                        <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                          {String.fromCharCode(65 + i)}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <button className="text-violet-600 font-bold text-xs hover:bg-violet-600 hover:text-white px-4 py-2 rounded-lg border border-violet-100 transition-all">
                      Kelola
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatusCard = ({ label, value, icon }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <h3 className="text-2xl font-black text-slate-800 mt-1">{value}</h3>
    </div>
    <div className="text-2xl opacity-80">{icon}</div>
  </div>
);

export default Consulting;