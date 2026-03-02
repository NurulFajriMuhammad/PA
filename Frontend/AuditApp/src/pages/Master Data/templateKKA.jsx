import React, { useState } from 'react';
import { 
  BsFileEarmarkSpreadsheet, BsSearch, BsCloudUpload, 
  BsDownload, BsTrash, BsFileEarmarkWord, 
  BsCollection, BsCheck2Square 
} from 'react-icons/bs';

const TemplateKKA = () => {
  const [templates] = useState([
    {
      id: "TPL-001",
      nama: "KKA Pengujian Kas & Bank",
      kategori: "Keuangan",
      format: "XLSX",
      tglUpdate: "10 Jan 2026",
      versi: "V.2.0"
    },
    {
      id: "TPL-002",
      nama: "Checklist Kepatuhan Pengadaan",
      kategori: "Operasional",
      format: "DOCX",
      tglUpdate: "15 Jan 2026",
      versi: "V.1.4"
    },
    {
      id: "TPL-003",
      nama: "Program Audit IT General Control",
      kategori: "IT Audit",
      format: "XLSX",
      tglUpdate: "05 Feb 2026",
      versi: "V.1.0"
    },
    {
      id: "TPL-004",
      nama: "Berita Acara Hasil Audit (BAHA)",
      kategori: "Reporting",
      format: "DOCX",
      tglUpdate: "20 Feb 2026",
      versi: "V.3.1"
    }
  ]);

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BsCollection className="text-blue-600" /> Template KKA
          </h1>
          <p className="text-slate-500 mt-1">Standarisasi format kertas kerja dan dokumen penunjang audit.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-md text-sm border-none cursor-pointer">
          <BsCloudUpload /> Upload Template Baru
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[300px]">
          <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari nama template..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="flex gap-2">
          <select className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 outline-none cursor-pointer">
            <option>Semua Kategori</option>
            <option>Keuangan</option>
            <option>Operasional</option>
            <option>IT Audit</option>
          </select>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {templates.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all group relative">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${item.format === 'XLSX' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                {item.format === 'XLSX' ? <BsFileEarmarkSpreadsheet size={24} /> : <BsFileEarmarkWord size={24} />}
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                {item.versi}
              </span>
            </div>
            
            <h3 className="font-bold text-slate-700 text-sm mb-1 leading-snug h-10 overflow-hidden">
              {item.nama}
            </h3>
            <p className="text-[11px] text-slate-400 mb-4 flex items-center gap-1">
              <BsCheck2Square className="text-blue-500" /> {item.kategori}
            </p>

            <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
              <div className="text-[10px] text-slate-400">
                Update: <span className="font-medium text-slate-600">{item.tglUpdate}</span>
              </div>
              <div className="flex gap-1">
                <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors bg-slate-50 rounded-lg border-none cursor-pointer">
                  <BsDownload size={16} />
                </button>
                <button className="p-2 text-slate-400 hover:text-red-600 transition-colors bg-slate-50 rounded-lg border-none cursor-pointer">
                  <BsTrash size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateKKA;