import React, { useState } from 'react';
import { 
  BsChatLeftText, BsSearch, BsPatchCheck, 
  BsLightningCharge, BsFileEarmarkText, 
  BsPeople, BsCalendar3 
} from 'react-icons/bs';

const AdvisoryService = () => {
  const [dataAdvisory] = useState([
    {
      id: "ADV-2026-001",
      topik: "Review Draft SOP Manajemen Aset",
      pemohon: "Divisi GA",
      tglMasuk: "12 Feb 2026",
      prioritas: "High",
      status: "On Review",
      pic: "Andi Saputra"
    },
    {
      id: "ADV-2026-002",
      topik: "Konsultasi Mitigasi Risiko Vendor Baru",
      pemohon: "Logistik",
      tglMasuk: "18 Feb 2026",
      prioritas: "Medium",
      status: "Closed",
      pic: "Siti Aminah"
    },
    {
      id: "ADV-2026-003",
      topik: "Pendampingan Implementasi ISO 27001",
      pemohon: "Divisi IT",
      tglMasuk: "25 Feb 2026",
      prioritas: "Urgent",
      status: "Drafting Report",
      pic: "Budi Santoso"
    }
  ]);

  return (
    <div className="p-6 bg-[#f9fafb] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BsChatLeftText className="text-indigo-600" /> Advisory Service
          </h1>
          <p className="text-slate-500 mt-1">Layanan konsultasi dan pemberian saran independen bagi unit kerja.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm font-medium">
          <BsFileEarmarkText /> Buat Rekomendasi
        </button>
      </div>

      {/* Grid Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><BsLightningCharge /></div>
            <span className="text-sm font-medium text-slate-500">Total Request</span>
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">24</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 text-orange-600">
            <div className="p-2 bg-orange-50 rounded-lg"><BsCalendar3 /></div>
            <span className="text-sm font-medium text-slate-500">Active Review</span>
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">07</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 text-green-600">
            <div className="p-2 bg-green-50 rounded-lg"><BsPatchCheck /></div>
            <span className="text-sm font-medium text-slate-500">Solved</span>
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">17</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 text-blue-600">
            <div className="p-2 bg-blue-50 rounded-lg"><BsPeople /></div>
            <span className="text-sm font-medium text-slate-500">Advisors</span>
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">05</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center bg-white">
          <div className="relative">
            <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari topik atau pemohon..." 
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-80"
            />
          </div>
          <div className="flex gap-2">
            <select className="border border-slate-200 rounded-lg text-sm p-2 outline-none">
              <option>Semua Prioritas</option>
              <option>Urgent</option>
              <option>High</option>
            </select>
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Topik & ID</th>
              <th className="px-6 py-4">Pemohon</th>
              <th className="px-6 py-4">Prioritas</th>
              <th className="px-6 py-4">PIC Advisor</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dataAdvisory.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-all cursor-pointer">
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-slate-700">{item.topik}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{item.id}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-600">{item.pemohon}</div>
                  <div className="text-[11px] text-slate-400 font-medium italic">{item.tglMasuk}</div>
                </td>
                <td className="px-6 py-4">
                  <PriorityBadge priority={item.prioritas} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-[10px] flex items-center justify-center font-bold">
                      {item.pic.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-sm text-slate-600 font-medium">{item.pic}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-indigo-600 text-xs font-bold hover:text-indigo-800 transition-colors uppercase tracking-widest">
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PriorityBadge = ({ priority }) => {
  const colors = {
    Urgent: "bg-red-50 text-red-600 border-red-100",
    High: "bg-orange-50 text-orange-600 border-orange-100",
    Medium: "bg-blue-50 text-blue-600 border-blue-100",
  };
  return (
    <span className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase ${colors[priority]}`}>
      {priority}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    "Closed": "text-green-600",
    "On Review": "text-indigo-600",
    "Drafting Report": "text-amber-600",
  };
  return (
    <div className="flex items-center gap-1.5 font-semibold">
      <div className={`w-1.5 h-1.5 rounded-full bg-current ${styles[status]}`}></div>
      <span className={`text-[12px] ${styles[status]}`}>{status}</span>
    </div>
  );
};

export default AdvisoryService;