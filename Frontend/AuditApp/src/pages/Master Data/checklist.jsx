import React, { useState } from 'react';
import { 
  BsListCheck, BsSearch, BsPlusLg, 
  BsThreeDots, BsEye, BsPencilSquare, 
  BsShieldCheck, BsLayers 
} from 'react-icons/bs';

const ChecklistPemeriksaan = () => {
  const [checklists] = useState([
    {
      id: "CHK-001",
      judul: "Audit Kas Opname & Bank",
      kategori: "Keuangan",
      jumlahLangkah: 12,
      status: "Aktif",
      lastUpdate: "20 Jan 2026"
    },
    {
      id: "CHK-002",
      judul: "Review Pengadaan Barang & Jasa",
      kategori: "Operasional",
      jumlahLangkah: 25,
      status: "Aktif",
      lastUpdate: "05 Feb 2026"
    },
    {
      id: "CHK-003",
      judul: "Audit Keamanan Server & Database",
      kategori: "IT Audit",
      jumlahLangkah: 18,
      status: "Draft",
      lastUpdate: "12 Feb 2026"
    },
    {
      id: "CHK-004",
      judul: "Checklist Kepatuhan Pajak PPN",
      kategori: "Kepatuhan",
      jumlahLangkah: 10,
      status: "Aktif",
      lastUpdate: "18 Feb 2026"
    }
  ]);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BsShieldCheck className="text-cyan-600" /> Checklist Pemeriksaan
          </h1>
          <p className="text-slate-500 mt-1">Daftar langkah kerja standar untuk konsistensi pengujian audit.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-all font-semibold shadow-md text-sm border-none cursor-pointer">
          <BsPlusLg /> Tambah Checklist
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatSmall label="Total Library" value="42" icon={<BsLayers />} />
        <StatSmall label="Checklist Aktif" value="38" icon={<BsListCheck />} />
        <StatSmall label="Update Bulan Ini" value="04" icon={<BsPencilSquare />} />
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-wrap justify-between items-center bg-white gap-4">
          <div className="relative w-full md:w-80">
            <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari judul checklist..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <select className="border border-slate-200 rounded-lg text-sm p-2 outline-none text-slate-600">
              <option>Semua Kategori</option>
              <option>Keuangan</option>
              <option>Operasional</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Judul & ID Checklist</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Langkah Kerja</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Terakhir Diubah</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {checklists.map((item) => (
                <tr key={item.id} className="hover:bg-cyan-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-700 text-sm">{item.judul}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                      {item.kategori}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-cyan-600">{item.jumlahLangkah} Poin</div>
                    <div className="text-[10px] text-slate-400 italic">Audit Steps</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      item.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {item.lastUpdate}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="p-2 text-slate-400 hover:text-cyan-600 transition-colors">
                        <BsEye size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-700 transition-colors">
                        <BsThreeDots size={16} />
                      </button>
                    </div>
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

const StatSmall = ({ label, value, icon }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
    <div className="p-3 bg-cyan-50 text-cyan-600 rounded-lg text-xl">{icon}</div>
    <div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">{label}</p>
      <p className="text-xl font-black text-slate-800">{value}</p>
    </div>
  </div>
);

export default ChecklistPemeriksaan;