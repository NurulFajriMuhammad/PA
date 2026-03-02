import React, { useState } from 'react';
import { 
  BsGlobe, BsSearch, BsFileEarmarkText, 
  BsClipboardData, BsPersonBadge, BsExclamationCircle,
  BsDownload, BsArrowRight, BsFunnel
} from 'react-icons/bs';

const ExternalAudit = () => {
  const [dataEksternal] = useState([
    {
      id: "EXT-2026-001",
      lembaga: "KAP Tanudiredja (PwC)",
      perihal: "Audit Laporan Keuangan Tahunan 2025",
      kontak: "Sarah Johnson",
      status: "Fieldwork",
      deadline: "30 Mar 2026",
      prioritas: "Sangat Penting"
    },
    {
      id: "EXT-2026-002",
      lembaga: "Kantor Pajak (DJP)",
      perihal: "Pemeriksaan Lapangan PPN 2024",
      kontak: "Bpk. Heru",
      status: "Request Data",
      deadline: "15 Mar 2026",
      prioritas: "Tinggi"
    },
    {
      id: "EXT-2026-003",
      lembaga: "ISO Certification Body",
      perihal: "Surveillance Audit ISO 9001:2015",
      kontak: "Rudi Ananda",
      status: "Completed",
      deadline: "20 Feb 2026",
      prioritas: "Sedang"
    }
  ]);

  return (
    <div className="p-6 bg-[#fcfcfd] min-h-screen">
      {/* Header Halaman */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg text-white">
              <BsGlobe size={20} />
            </div>
            Eksternal Audit
          </h1>
          <p className="text-slate-500 mt-2">Manajemen koordinasi dan dokumentasi pemeriksaan oleh auditor pihak ketiga.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-all font-semibold shadow-lg text-sm">
          <BsFileEarmarkText /> Register Audit Baru
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Audit Aktif</p>
              <h3 className="text-3xl font-black text-slate-800 mt-1">02</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><BsClipboardData size={20} /></div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-medium text-blue-600">
            <span>Lihat jadwal pemeriksaan</span> <BsArrowRight />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Permintaan Data</p>
              <h3 className="text-3xl font-black text-slate-800 mt-1">14</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><BsExclamationCircle size={20} /></div>
          </div>
          <p className="mt-4 text-[11px] text-slate-400 tracking-tight font-medium">5 permintaan melewati deadline</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Laporan Final</p>
              <h3 className="text-3xl font-black text-slate-800 mt-1">08</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><BsDownload size={20} /></div>
          </div>
          <p className="mt-4 text-[11px] text-slate-400 tracking-tight font-medium">Tahun buku 2025/2026</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center bg-white">
          <h3 className="text-slate-800 font-bold">Log Pemeriksaan Eksternal</h3>
          <div className="flex gap-2">
            <div className="relative">
              <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari lembaga..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-slate-800 outline-none w-64"
              />
            </div>
            <button className="p-2 bg-slate-50 text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-100">
              <BsFunnel />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Lembaga & Deskripsi</th>
                <th className="px-6 py-4">Kontak / Auditor</th>
                <th className="px-6 py-4">Prioritas</th>
                <th className="px-6 py-4">Deadline Lap.</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataEksternal.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-all group">
                  <td className="px-6 py-5">
                    <div className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{item.lembaga}</div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 font-medium">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] uppercase">{item.id}</span>
                      <span>{item.perihal}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <BsPersonBadge className="text-slate-400" />
                      {item.kontak}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${
                      item.prioritas === 'Sangat Penting' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                      item.prioritas === 'Tinggi' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                      'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {item.prioritas}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-500 font-medium">
                    {item.deadline}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-tight">
                      <div className={`w-2 h-2 rounded-full ${
                        item.status === 'Completed' ? 'bg-emerald-500' : 
                        item.status === 'Fieldwork' ? 'bg-blue-500 animate-pulse' : 'bg-amber-500'
                      }`}></div>
                      <span className={
                        item.status === 'Completed' ? 'text-emerald-600' : 
                        item.status === 'Fieldwork' ? 'text-blue-600' : 'text-amber-600'
                      }>{item.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button className="text-slate-400 hover:text-slate-800 transition-colors p-2 rounded-full hover:bg-slate-200">
                      <BsDownload />
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

export default ExternalAudit;