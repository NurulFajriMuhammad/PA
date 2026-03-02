import React, { useState } from 'react';
import { 
  BsFileEarmarkPdf, BsSearch, BsFolder2Open, 
  BsDownload, BsEye, BsFileEarmarkText, BsCalendar3 
} from 'react-icons/bs';

const DocumentRepository = () => {
  const [activeCategory, setActiveCategory] = useState('Semua');

  const documents = [
    { id: 1, title: 'SOP Pengadaan Barang & Jasa v.2', category: 'SOP', date: '2025-10-12', size: '2.4 MB' },
    { id: 2, title: 'UU No. 19 Tahun 2023 tentang BUMN', category: 'Regulasi', date: '2023-05-20', size: '1.1 MB' },
    { id: 3, title: 'Laporan Audit Tahunan 2024 - Final', category: 'Arsip LHA', date: '2025-01-05', size: '5.8 MB' },
    { id: 4, title: 'SOP Manajemen Risiko Operasional', category: 'SOP', date: '2024-02-15', size: '1.8 MB' },
    { id: 5, title: 'Peraturan Menteri Keuangan No. 12', category: 'Regulasi', date: '2025-11-30', size: '0.9 MB' },
  ];

  const categories = ['Semua', 'SOP', 'Regulasi', 'Arsip LHA'];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <BsFolder2Open className="text-amber-500" /> Document Repository
        </h2>
        <p className="text-sm text-slate-500">Pusat referensi dokumen regulasi, SOP, dan arsip laporan audit.</p>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all border-none cursor-pointer ${
                activeCategory === cat ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari dokumen..." 
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
          />
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents
          .filter(doc => activeCategory === 'Semua' || doc.category === activeCategory)
          .map(doc => (
            <div key={doc.id} className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-all group">
              <div className="flex items-start gap-4">
                <div className="bg-red-50 p-3 rounded-xl text-red-500">
                  <BsFileEarmarkPdf size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                    {doc.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    <span className="bg-slate-100 px-2 py-0.5 rounded">{doc.category}</span>
                    <span className="flex items-center gap-1"><BsCalendar3 /> {doc.date}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">{doc.size}</span>
                <div className="flex gap-2">
                  <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg border-none cursor-pointer bg-transparent transition-colors">
                    <BsEye size={16} />
                  </button>
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg border-none cursor-pointer bg-transparent transition-colors">
                    <BsDownload size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default DocumentRepository;