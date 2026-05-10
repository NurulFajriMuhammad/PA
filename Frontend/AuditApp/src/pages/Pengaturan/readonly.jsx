import React, { useState, useEffect, useMemo } from 'react';
import {
  BsShieldLock, BsSearch, BsPlusLg, BsTrash, BsX,
  BsLockFill, BsUnlockFill, BsChevronDown
} from 'react-icons/bs';
import { IoWater } from 'react-icons/io5';
import apiClient from "../../../../Shared/api/apiClient";
import { notifySuccess, notifyError, notifyConfirm } from "../../../../Shared/utils/notifier.jsx";

// ─── Daftar URL/Halaman yang tersedia (sesuai routes di App.jsx) ─────────────
const AVAILABLE_URLS = [
  { value: '/',                                label: 'Dashboard', group: 'Umum' },
  { value: '/internal/assurance',              label: 'Audit Assurance (Internal)', group: 'Audit Internal' },
  { value: '/internal/assurance/:id',          label: 'Detail Assurance (Internal)', group: 'Audit Internal' },
  { value: '/internal/surattugas',             label: 'Surat Tugas', group: 'Audit Internal' },
  { value: '/internal/advisory',               label: 'Advisory Service', group: 'Audit Internal' },
  { value: '/internal/consulting',             label: 'Consulting', group: 'Audit Internal' },
  { value: '/internal/auditevaluasi',          label: 'Audit Evaluasi', group: 'Audit Internal' },
  { value: '/external-audit',                  label: 'Audit Eksternal', group: 'Audit Eksternal' },
  { value: '/external/audit/:id',              label: 'Detail Audit Eksternal', group: 'Audit Eksternal' },
  { value: '/audit-findings',                  label: 'Temuan Audit', group: 'Temuan & TL' },
  { value: '/follow-up',                       label: 'Tindak Lanjut / Monitoring', group: 'Temuan & TL' },
  { value: '/document-repository',             label: 'Document Repository', group: 'Dokumen' },
  { value: '/profil/spi-jangka-panjang',       label: 'Profil SPI Jangka Panjang', group: 'Profil SPI' },
  { value: '/profil/pkpt-spi',                 label: 'PKPT SPI', group: 'Profil SPI' },
  { value: '/profil/piagam-audit',             label: 'Piagam Audit Internal', group: 'Profil SPI' },
  { value: '/profil/rka',                      label: 'RKA SPI', group: 'Profil SPI' },
  { value: '/pengaturan/status-pengajuan',     label: 'Setting Status Pemeriksaan', group: 'Pengaturan' },
  { value: '/pengaturan/setting-pengajuan',    label: 'Setting Alur Pengajuan', group: 'Pengaturan' },
  { value: '/pengaturan/hak-akses',            label: 'Hak Akses', group: 'Pengaturan' },
  { value: '/admin/users',                     label: 'Manajemen Pengguna', group: 'Pengaturan' },
];

const URL_GROUPS = [...new Set(AVAILABLE_URLS.map(u => u.group))];

const HakAkses = () => {
  const [aksesData, setAksesData]         = useState([]);   // raw dari API
  const [statuses, setStatuses]           = useState([]);
  const [roles, setRoles]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [searchTerm, setSearchTerm]       = useState('');
  const [showModal, setShowModal]         = useState(false);
  const [expandedRoles, setExpandedRoles] = useState({});

  // Form tambah
  const [form, setForm] = useState({ role_id: '', status_pemeriksaan_id: '', urls: [] });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [aRes, sRes, rRes] = await Promise.all([
        apiClient.get('/api/status-pemeriksaan-akses'),
        apiClient.get('/api/status-pemeriksaan'),
        apiClient.get('/api/roles'),
      ]);
      setAksesData(Array.isArray(aRes.data) ? aRes.data : []);
      setStatuses(sRes.data);
      setRoles(Array.isArray(rRes.data) ? rRes.data : rRes.data?.data || []);
    } catch (err) {
      notifyError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ─── Grouping: role → status → url[] ──────────────────────────────────────
  const grouped = useMemo(() => {
    const result = {};
    aksesData.forEach(item => {
      const roleName   = item.role?.name || `Role #${item.role_id}`;
      const statusName = item.status_pemeriksaan?.nama || `Status #${item.status_pemeriksaan_id}`;
      const warna      = item.status_pemeriksaan?.warna || '#888';

      if (!result[roleName]) result[roleName] = { role_id: item.role_id, statuses: {} };
      if (!result[roleName].statuses[statusName]) {
        result[roleName].statuses[statusName] = { status_pemeriksaan_id: item.status_pemeriksaan_id, warna, urls: [] };
      }
      result[roleName].statuses[statusName].urls.push({ id: item.id, url: item.url });
    });
    return result;
  }, [aksesData]);

  const filteredGrouped = useMemo(() => {
    if (!searchTerm) return grouped;
    const term = searchTerm.toLowerCase();
    const result = {};
    for (const [roleName, data] of Object.entries(grouped)) {
      if (roleName.toLowerCase().includes(term)) {
        result[roleName] = data;
        continue;
      }
      const matchedStatuses = {};
      for (const [sName, sData] of Object.entries(data.statuses)) {
        if (sName.toLowerCase().includes(term) || sData.urls.some(u => u.url.toLowerCase().includes(term))) {
          matchedStatuses[sName] = sData;
        }
      }
      if (Object.keys(matchedStatuses).length > 0) {
        result[roleName] = { ...data, statuses: matchedStatuses };
      }
    }
    return result;
  }, [grouped, searchTerm]);

  const toggleRole = (roleName) => {
    setExpandedRoles(prev => {
      const isCurrentlyExpanded = prev[roleName] !== false;
      return { ...prev, [roleName]: !isCurrentlyExpanded };
    });
  };

  const openModal = () => {
    setForm({ role_id: '', status_pemeriksaan_id: '', urls: [] });
    setShowModal(true);
  };

  const toggleUrl = (url) => {
    setForm(prev => ({
      ...prev,
      urls: prev.urls.includes(url) ? prev.urls.filter(u => u !== url) : [...prev.urls, url]
    }));
  };

  const handleSave = async () => {
    if (!form.role_id || !form.status_pemeriksaan_id || form.urls.length === 0) {
      return notifyError('Role, Status, dan minimal 1 URL harus dipilih');
    }
    try {
      await apiClient.post('/api/status-pemeriksaan-akses/bulk', {
        role_id: form.role_id,
        status_pemeriksaan_id: form.status_pemeriksaan_id,
        urls: form.urls,
      });
      notifySuccess('Hak akses berhasil disimpan');
      setShowModal(false);
      fetchAll();
    } catch (err) {
      notifyError('Gagal menyimpan');
    }
  };

  const handleDeleteUrl = (id) => {
    notifyConfirm('Hapus akses URL ini?', async () => {
      try {
        await apiClient.delete(`/api/status-pemeriksaan-akses/${id}`);
        notifySuccess('Berhasil dihapus');
        fetchAll();
      } catch (err) {
        notifyError('Gagal menghapus');
      }
    });
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-black text-slate-800 uppercase tracking-tight">
            <BsShieldLock className="text-indigo-600" /> Hak Akses Per Status
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Atur halaman apa yang bisa diakses oleh tiap Role saat berada di Status Pemeriksaan tertentu.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Cari role atau status..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-60"
            />
          </div>
          <button onClick={openModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
          >
            <BsPlusLg /> Tambah Akses
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Role</p>
          <p className="text-3xl font-black text-slate-800 mt-1">{Object.keys(grouped).length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-slate-400 uppercase">Kombinasi Role × Status</p>
          <p className="text-3xl font-black text-indigo-600 mt-1">
            {Object.values(grouped).reduce((a, r) => a + Object.keys(r.statuses).length, 0)}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Akses URL</p>
          <p className="text-3xl font-black text-emerald-600 mt-1">{aksesData.length}</p>
        </div>
      </div>

      {/* KONTEN */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : Object.keys(filteredGrouped).length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <BsShieldLock size={48} className="mx-auto mb-4 opacity-20" />
          <p>Belum ada hak akses yang dikonfigurasi</p>
          <button onClick={openModal} className="mt-4 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold">Tambah Sekarang</button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(filteredGrouped).map(([roleName, roleData]) => {
            const isExpanded = expandedRoles[roleName] !== false; // default expanded
            return (
              <div key={roleName} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Role Header */}
                <button
                  onClick={() => toggleRole(roleName)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                      <BsShieldLock size={18} />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-slate-800 text-base uppercase tracking-tight">{roleName}</p>
                      <p className="text-xs text-slate-400">
                        {Object.keys(roleData.statuses).length} status dikonfigurasi &nbsp;·&nbsp;
                        {Object.values(roleData.statuses).reduce((a, s) => a + s.urls.length, 0)} URL
                      </p>
                    </div>
                  </div>
                  <BsChevronDown
                    className="text-slate-400 transition-transform duration-300 ease-in-out"
                    style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                  />
                </button>

                {/* Status list — smooth accordion */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateRows: isExpanded ? '1fr' : '0fr',
                    transition: 'grid-template-rows 0.3s ease',
                  }}
                >
                  <div style={{ overflow: 'hidden' }}>
                    <div className="border-t border-slate-100 divide-y divide-slate-50">
                      {Object.entries(roleData.statuses).map(([statusName, statusData]) => (
                        <div key={statusName} className="px-6 py-4">
                          {/* Status badge */}
                          <div className="flex items-center gap-2 mb-3">
                            <IoWater style={{ color: statusData.warna }} size={14} />
                            <span className="text-sm font-bold text-slate-700">{statusName}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-1" style={{ backgroundColor: statusData.warna + '22', color: statusData.warna, border: `1px solid ${statusData.warna}55` }}>
                              {statusData.urls.length} URL
                            </span>
                          </div>

                          {/* URL tags */}
                          <div className="flex flex-wrap gap-2">
                            {statusData.urls.map(({ id, url }) => {
                              const found = AVAILABLE_URLS.find(u => u.value === url);
                              return (
                                <span key={id} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 group">
                                  <BsUnlockFill className="text-emerald-500" size={11} />
                                  {found ? found.label : url}
                                  <button onClick={() => handleDeleteUrl(id)} className="opacity-0 group-hover:opacity-100 ml-1 text-red-400 hover:text-red-600 transition-all">
                                    <BsX size={14} />
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL TAMBAH */}
      {showModal && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white shrink-0">
              <h3 className="font-bold">Tambah / Update Hak Akses</h3>
              <button onClick={() => setShowModal(false)}><BsX size={24} /></button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Role */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Role / Group</label>
                <select value={form.role_id}
                  onChange={e => setForm({ ...form, role_id: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">— Pilih Role —</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Status Pemeriksaan</label>
                <select value={form.status_pemeriksaan_id}
                  onChange={e => setForm({ ...form, status_pemeriksaan_id: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">— Pilih Status —</option>
                  {statuses.map(s => (
                    <option key={s.id} value={s.id}>{s.nama}</option>
                  ))}
                </select>
              </div>

              {/* URL Picker */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                  Halaman / URL yang Dapat Diakses
                  <span className="ml-2 font-normal text-indigo-500">({form.urls.length} dipilih)</span>
                </label>
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  {URL_GROUPS.map(group => (
                    <div key={group}>
                      <p className="px-4 py-2 bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">{group}</p>
                      {AVAILABLE_URLS.filter(u => u.group === group).map(urlItem => {
                        const checked = form.urls.includes(urlItem.value);
                        return (
                          <label key={urlItem.value}
                            className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-indigo-50 transition-colors ${checked ? 'bg-indigo-50' : ''}`}
                          >
                            <input type="checkbox" checked={checked} onChange={() => toggleUrl(urlItem.value)}
                              className="accent-indigo-600 w-4 h-4 rounded"
                            />
                            <div>
                              <p className="text-sm font-medium text-slate-700">{urlItem.label}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{urlItem.value}</p>
                            </div>
                            {checked && <BsLockFill className="ml-auto text-indigo-400 shrink-0" size={12} />}
                          </label>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  ⚠️ Menyimpan akan <strong>menggantikan</strong> semua URL yang sudah ada untuk kombinasi Role + Status ini.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 text-slate-500 font-bold rounded-xl border border-slate-200">Batal</button>
                <button onClick={handleSave} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                  Simpan Hak Akses
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HakAkses;
