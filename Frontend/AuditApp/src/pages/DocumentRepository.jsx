import React, { useEffect, useState, useCallback } from 'react';
import useRealTime from '../hooks/useRealTime';
import {
  BsFileEarmarkPdf, BsSearch, BsFolder2Open,
  BsEye, BsFileEarmarkText, BsCalendar3,
  BsBoxArrowUpRight, BsX, BsFileEarmarkWord,
  BsFileEarmarkImage, BsFileEarmarkZip,
  BsChevronLeft, BsChevronRight, BsGrid, BsListUl, BsChevronDown,
  BsPersonVcard, BsBuilding, BsShieldCheck, BsGraphUpArrow, BsArrowRepeat, BsShare
} from 'react-icons/bs';
import apiClient from '../../../Shared/api/apiClient';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

const CATEGORY_THEMES = {
  'Profil SPI':             { color: 'violet',  icon: <BsPersonVcard /> },
  'Dokumen Auditee':        { color: 'sky',     icon: <BsBuilding /> },
  'Laporan Hasil Audit':    { color: 'emerald', icon: <BsFileEarmarkPdf /> },
  'Temuan Audit Internal':  { color: 'rose',    icon: <BsShieldCheck /> },
  'Analisis Penyebab':      { color: 'orange',  icon: <BsGraphUpArrow /> },
  'Tindak Lanjut':          { color: 'amber',   icon: <BsArrowRepeat /> },
  'Temuan Audit Eksternal': { color: 'indigo',  icon: <BsShare /> },
};

const THEME_STYLES = {
  violet:  'bg-violet-50 text-violet-600 border-violet-100',
  sky:     'bg-sky-50 text-sky-600 border-sky-100',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  rose:    'bg-rose-50 text-rose-600 border-rose-100',
  orange:  'bg-orange-50 text-orange-600 border-orange-100',
  amber:   'bg-amber-50 text-amber-600 border-amber-100',
  indigo:  'bg-indigo-50 text-indigo-600 border-indigo-100',
  slate:   'bg-slate-50 text-slate-600 border-slate-100',
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

  // Sinkronisasi Real-Time
  useRealTime('document_repositories', () => {
    fetchDocuments(currentPage);
    fetchStatistics();
  });

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
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${THEME_STYLES[CATEGORY_THEMES[previewFile.category]?.color] || THEME_STYLES.slate}`}>
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
    const theme = CATEGORY_THEMES[doc.category] || { color: 'slate' };
    const catColor = THEME_STYLES[theme.color] || THEME_STYLES.slate;
    const catBg = `bg-${theme.color}-50/40`;
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
    const theme = CATEGORY_THEMES[doc.category] || { color: 'slate' };
    const catColor = THEME_STYLES[theme.color] || THEME_STYLES.slate;
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
    <div className="px-4 sm:px-8 py-4 font-sans">
      <div className="w-full">
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
          <div className="mt-8 flex flex-col lg:flex-row gap-6">
            {/* Total Documents Side */}
            <button 
              onClick={() => setActiveCategory('Semua')}
              className={`relative overflow-hidden w-full lg:w-72 p-6 rounded-3xl border transition-all duration-500 hover:shadow-2xl group ${
                activeCategory === 'Semua' 
                  ? 'bg-slate-900 border-slate-800 text-white shadow-xl scale-[1.02]' 
                  : 'bg-white border-slate-100 text-slate-800 shadow-sm hover:border-blue-200'
              }`}
            >
              <div className="absolute -right-6 -top-6 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                <BsFolder2Open size={160} />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-2xl ${activeCategory === 'Semua' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
                    <BsFolder2Open size={24} />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${activeCategory === 'Semua' ? 'text-slate-400' : 'text-slate-400'}`}>Summary</span>
                </div>
                
                <div className="text-5xl font-black mb-2 tabular-nums">{statistics.total_documents}</div>
                <div className="text-sm font-bold opacity-70">Total File Repository</div>
                <div className={`mt-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full ${activeCategory === 'Semua' ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {activeCategory === 'Semua' ? 'Menampilkan Semua' : 'Klik untuk Reset'}
                </div>
              </div>
            </button>

            {/* Categories Grid */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(statistics.categories || {}).map(([cat, count]) => {
                const isActive = activeCategory === cat;
                const theme = CATEGORY_THEMES[cat] || { color: 'blue', icon: <BsFolder2Open /> };
                
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat === activeCategory ? 'Semua' : cat)}
                    className={`relative group p-4 rounded-2xl border transition-all duration-300 hover:shadow-xl ${
                      isActive
                        ? 'bg-white border-blue-600 ring-2 ring-blue-600 ring-offset-2'
                        : 'bg-white border-slate-100 hover:border-blue-200'
                    }`}
                  >
                    <div className={`mb-3 p-2.5 rounded-xl w-fit transition-transform group-hover:scale-110 duration-300 ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : (THEME_STYLES[theme.color] || 'bg-slate-50 text-slate-400')}`}>
                      {theme.icon}
                    </div>
                    
                    <div className="text-xl font-black text-slate-800 mb-1">{count}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-snug group-hover:text-slate-600">
                      {cat}
                    </div>
                    
                    {isActive && (
                      <div className="absolute top-4 right-4">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping" />
                      </div>
                    )}
                  </button>
                );
              })}
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



        {/* Module filter */}
        <div className="relative group">
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="appearance-none pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-600 min-w-[150px]"
          >
            <option value="">Semua Modul</option>
            {modules.map(m => (
              <option key={m} value={m}>{MODULE_LABELS[m] || m}</option>
            ))}
          </select>
          {selectedModule ? (
            <button 
              onClick={() => setSelectedModule("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"
              title="Hapus Filter Modul"
            >
              <BsX size={16} />
            </button>
          ) : (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <BsChevronDown size={14} />
            </div>
          )}
        </div>

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
    </div>
  );
};

export default DocumentRepository;
