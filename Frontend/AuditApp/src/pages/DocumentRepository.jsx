import React, { useEffect, useState, useCallback } from 'react';
import {
  BsFileEarmarkPdf, BsSearch, BsFolder2Open,
  BsEye, BsFileEarmarkText, BsCalendar3,
  BsBoxArrowUpRight, BsX, BsFileEarmarkWord,
  BsFileEarmarkImage, BsFileEarmarkZip,
  BsChevronLeft, BsChevronRight, BsGrid, BsListUl
} from 'react-icons/bs';
import apiClient from '../../../Shared/api/apiClient';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

const CATEGORY_COLORS = {
  'Profil SPI':             'bg-violet-100 text-violet-700 border-violet-200',
  'Dokumen Auditee':        'bg-sky-100 text-sky-700 border-sky-200',
  'Laporan Hasil Audit':    'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Temuan Audit Internal':  'bg-rose-100 text-rose-700 border-rose-200',
  'Analisis Penyebab':      'bg-orange-100 text-orange-700 border-orange-200',
  'Tindak Lanjut':          'bg-amber-100 text-amber-700 border-amber-200',
  'Temuan Audit Eksternal': 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

const CATEGORY_BG = {
  'Profil SPI':             'bg-violet-50',
  'Dokumen Auditee':        'bg-sky-50',
  'Laporan Hasil Audit':    'bg-emerald-50',
  'Temuan Audit Internal':  'bg-rose-50',
  'Analisis Penyebab':      'bg-orange-50',
  'Tindak Lanjut':          'bg-amber-50',
  'Temuan Audit Eksternal': 'bg-indigo-50',
};

const MODULE_LABELS = {
  'internal_audit_charter': 'Profil SPI',
  'auditee_document':       'Auditee',
  'lhe_file':               'LHE',
  'pemeriksaan_temuan':     'Pelaksanaan',
  'analisis_temuan':        'Analisis',
  'tindak_lanjut':          'Tindak Lanjut',
  'external_audit_temuan':  'Eksternal',
};

const getFileIcon = (fileType, fileName) => {
  const ext = (fileName || '').split('.').pop()?.toLowerCase();
  const t   = (fileType || ext || '').toLowerCase();
  if (t === 'pdf' || ext === 'pdf') return { icon: BsFileEarmarkPdf, color: 'text-red-500 bg-red-50' };
  if (['doc','docx','word'].includes(ext) || t.includes('word')) return { icon: BsFileEarmarkWord, color: 'text-blue-500 bg-blue-50' };
  if (['jpg','jpeg','png','gif','webp'].includes(ext)) return { icon: BsFileEarmarkImage, color: 'text-green-500 bg-green-50' };
  if (['zip','rar','7z'].includes(ext)) return { icon: BsFileEarmarkZip, color: 'text-yellow-600 bg-yellow-50' };
  return { icon: BsFileEarmarkText, color: 'text-slate-500 bg-slate-100' };
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ============================================================
// KOMPONEN UTAMA
// ============================================================
const DocumentRepository = () => {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchTerm, setSearchTerm]         = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [documents, setDocuments]           = useState([]);
  const [categories, setCategories]         = useState([]);
  const [modules, setModules]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [statistics, setStatistics]         = useState(null);
  const [currentPage, setCurrentPage]       = useState(1);
  const [totalPages, setTotalPages]         = useState(1);
  const [total, setTotal]                   = useState(0);
  const [previewFile, setPreviewFile]       = useState(null);
  const [viewMode, setViewMode]             = useState('grid'); // 'grid' | 'list'

  const fetchDocuments = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page });
      if (searchTerm) params.set('search', searchTerm);
      if (activeCategory !== 'Semua') params.set('category', activeCategory);
      if (selectedModule) params.set('module', selectedModule);

      const res = await apiClient.get(`/api/document-repository?${params}`);
      const data = res.data.data;
      setDocuments(data.data || []);
      setTotal(data.total || 0);
      setCurrentPage(data.current_page || 1);
      setTotalPages(data.last_page || 1);
      setCategories(['Semua', ...(res.data.categories || [])]);
      setModules(res.data.modules || []);
    } catch (err) {
      console.error(err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, activeCategory, selectedModule]);

  const fetchStatistics = async () => {
    try {
      const res = await apiClient.get('/api/document-repository/statistics');
      setStatistics(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchDocuments(1); fetchStatistics(); }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchDocuments(1), 300);
    return () => clearTimeout(t);
  }, [searchTerm, activeCategory, selectedModule]);

  // ---- Preview modal ----
  const renderPreview = () => {
    if (!previewFile) return null;
    const { icon: FileIcon, color } = getFileIcon(previewFile.file_type, previewFile.file_name);
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setPreviewFile(null)} />
        <div className="relative bg-white w-full max-w-6xl h-[95vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`p-2.5 rounded-xl ring-4 ring-slate-100 ${color}`}>
                <FileIcon size={22} />
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-slate-800 text-base uppercase tracking-tight truncate max-w-[300px] md:max-w-xl">
                  {previewFile.title || previewFile.file_name}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[previewFile.category] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                    {previewFile.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{previewFile.sub_category}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <a
                href={`${BACKEND_URL}/storage/${previewFile.file_path}`}
                target="_blank" rel="noreferrer"
                className="px-5 py-2 bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-900 flex items-center gap-2 transition-all"
              >
                <BsBoxArrowUpRight /> Buka Tab Baru
              </a>
              <button onClick={() => setPreviewFile(null)} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-colors border border-red-100">
                <BsX size={22} />
              </button>
            </div>
          </div>
          {/* iframe */}
          <div className="flex-1 p-4 overflow-hidden bg-slate-200/60">
            <div className="bg-white w-full h-full rounded-2xl border border-slate-300 overflow-hidden relative shadow-sm">
              <iframe
                src={`${BACKEND_URL}/storage/${previewFile.file_path}`}
                className="absolute inset-0 w-full h-full border-0"
                title="Document Preview"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ---- Card dokumen (grid) ----
  const DocCard = ({ doc }) => {
    const { icon: FileIcon, color } = getFileIcon(doc.file_type, doc.file_name);
    const catColor  = CATEGORY_COLORS[doc.category] || 'bg-slate-100 text-slate-500 border-slate-200';
    const catBg     = CATEGORY_BG[doc.category]     || 'bg-slate-50';
    return (
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col group">
        <div className={`${catBg} px-4 pt-4 pb-3 flex items-start gap-3`}>
          <div className={`p-2.5 rounded-xl ${color} shrink-0 mt-0.5`}>
            <FileIcon size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors" title={doc.title}>
              {doc.title || doc.file_name || 'Dokumen'}
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">{doc.sub_category || doc.module}</p>
          </div>
        </div>
        <div className="px-4 py-3 flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${catColor}`}>{doc.category}</span>
            <span className="text-[10px] text-slate-400 font-mono">{doc.formatted_size}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <BsCalendar3 size={10} /> {formatDate(doc.created_at)}
          </div>
        </div>
        <div className="border-t border-slate-100 px-4 py-2 flex justify-end gap-1">
          <button
            onClick={() => setPreviewFile(doc)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <BsEye size={13} /> Preview
          </button>
        </div>
      </div>
    );
  };

  // ---- Row dokumen (list) ----
  const DocRow = ({ doc, index }) => {
    const { icon: FileIcon, color } = getFileIcon(doc.file_type, doc.file_name);
    const catColor = CATEGORY_COLORS[doc.category] || 'bg-slate-100 text-slate-500 border-slate-200';
    return (
      <tr className="hover:bg-blue-50/30 transition-colors group">
        <td className="px-4 py-3 text-center text-xs text-slate-400 font-mono">{index + 1}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg ${color}`}><FileIcon size={16} /></div>
            <div>
              <p className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600">{doc.title || doc.file_name}</p>
              <p className="text-[10px] text-slate-400">{doc.sub_category}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${catColor}`}>{doc.category}</span>
        </td>
        <td className="px-4 py-3 text-xs text-slate-500">{MODULE_LABELS[doc.module] || doc.module}</td>
        <td className="px-4 py-3 text-xs text-slate-400">{formatDate(doc.created_at)}</td>
        <td className="px-4 py-3 text-xs text-slate-400 font-mono">{doc.formatted_size}</td>
        <td className="px-4 py-3">
          <button
            onClick={() => setPreviewFile(doc)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <BsEye size={12} /> Preview
          </button>
        </td>
      </tr>
    );
  };

  // =====================================================================
  // RENDER UTAMA
  // =====================================================================
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* ---- HEADER ---- */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-black text-slate-800 uppercase tracking-tight">
              <BsFolder2Open className="text-amber-500" /> Document Repository
            </h1>
            <p className="text-slate-500 text-sm mt-1">Pusat referensi dokumen dari seluruh modul aplikasi audit</p>
          </div>
        </div>

        {/* Statistik */}
        {statistics && (
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {Object.entries(statistics.categories || {}).map(([cat, count]) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat === activeCategory ? 'Semua' : cat)}
                className={`text-left p-3 rounded-xl border transition-all hover:shadow-md ${
                  activeCategory === cat
                    ? (CATEGORY_COLORS[cat] || 'bg-blue-100 text-blue-700 border-blue-200') + ' shadow-md'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-blue-200'
                }`}
              >
                <div className="text-xl font-black">{count}</div>
                <div className="text-[10px] font-bold uppercase tracking-wide leading-tight mt-0.5">{cat}</div>
              </button>
            ))}
            <div className="text-left p-3 rounded-xl border bg-slate-800 text-white border-slate-700">
              <div className="text-xl font-black">{statistics.total_documents}</div>
              <div className="text-[10px] font-bold uppercase tracking-wide leading-tight mt-0.5">Total Dokumen</div>
            </div>
          </div>
        )}
      </div>

      {/* ---- FILTER BAR ---- */}
      <div className="mb-6 flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Cari nama dokumen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category pills */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 flex-wrap">
          {['Semua', ...categories.filter(c => c !== 'Semua')].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                activeCategory === cat
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Module filter */}
        <select
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Semua Modul</option>
          {modules.map(m => (
            <option key={m} value={m}>{MODULE_LABELS[m] || m}</option>
          ))}
        </select>

        {/* View mode toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 ml-auto">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>
            <BsGrid size={16} />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>
            <BsListUl size={16} />
          </button>
        </div>
      </div>

      {/* ---- KONTEN ---- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Memuat dokumen...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-24">
          <BsFolder2Open size={56} className="mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 font-medium">Tidak ada dokumen ditemukan</p>
          <p className="text-slate-400 text-sm mt-1">Coba ubah filter atau kata pencarian</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {documents.map((doc, i) => <DocCard key={`${doc.module}-${doc.id}-${i}`} doc={doc} />)}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-4 py-3 text-center">No</th>
                <th className="px-4 py-3">Dokumen</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Modul</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Ukuran</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {documents.map((doc, i) => <DocRow key={`${doc.module}-${doc.id}-${i}`} doc={doc} index={i} />)}
            </tbody>
          </table>
        </div>
      )}

      {/* ---- PAGINATION ---- */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <p className="text-sm text-slate-500">
            Menampilkan <span className="font-bold text-slate-700">{documents.length}</span> dari <span className="font-bold text-slate-700">{total}</span> dokumen
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchDocuments(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-all"
            >
              <BsChevronLeft size={14} />
            </button>
            <span className="px-3 py-1.5 text-sm font-bold text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => fetchDocuments(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-all"
            >
              <BsChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ---- PREVIEW MODAL ---- */}
      {renderPreview()}
    </div>
  );
};

export default DocumentRepository;