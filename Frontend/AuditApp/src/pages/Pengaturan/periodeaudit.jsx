import React, { useState, useEffect, useMemo } from 'react';
import {
  BsCalendar2Check, BsSearch, BsPlusLg, BsTrash, BsPencil,
  BsCheckCircleFill, BsXCircleFill, BsX, BsCalendarRange,
  BsToggleOn, BsToggleOff, BsClock
} from 'react-icons/bs';
import apiClient from '../../../../Shared/api/apiClient';
import { notifySuccess, notifyError, notifyConfirm } from '../../../../Shared/utils/notifier';

const EMPTY_FORM = {
  tahun: '',
  nama_periode: '',
  tanggal_mulai: '',
  tanggal_selesai: '',
  is_active: false,
  keterangan: '',
};

const PeriodeAudit = () => {
  const [data, setData]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState('');
  const [filterTahun, setFilterTahun] = useState('');
  const [showModal, setShowModal]     = useState(false);
  const [editId, setEditId]           = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [saving, setSaving]           = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/periode-audit');
      setData(Array.isArray(res.data) ? res.data : []);
    } catch {
      notifyError('Gagal memuat data periode audit');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const tahunList = useMemo(() => [...new Set(data.map(d => d.tahun))].sort((a, b) => b - a), [data]);

  const filtered = useMemo(() => {
    let d = data;
    if (filterTahun) d = d.filter(x => x.tahun === filterTahun);
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      d = d.filter(x =>
        x.nama_periode.toLowerCase().includes(t) ||
        x.tahun.includes(t) ||
        (x.keterangan || '').toLowerCase().includes(t)
      );
    }
    return d;
  }, [data, searchTerm, filterTahun]);

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditId(item.id);
    setForm({
      tahun: item.tahun || '',
      nama_periode: item.nama_periode || '',
      tanggal_mulai: item.tanggal_mulai ? item.tanggal_mulai.slice(0, 10) : '',
      tanggal_selesai: item.tanggal_selesai ? item.tanggal_selesai.slice(0, 10) : '',
      is_active: item.is_active || false,
      keterangan: item.keterangan || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.tahun || !form.nama_periode) {
      return notifyError('Tahun dan Nama Periode wajib diisi');
    }
    setSaving(true);
    try {
      if (editId) {
        await apiClient.put(`/api/periode-audit/${editId}`, form);
        notifySuccess('Periode Audit berhasil diupdate');
      } else {
        await apiClient.post('/api/periode-audit', form);
        notifySuccess('Periode Audit berhasil ditambahkan');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      notifyError(err?.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id, nama) => {
    notifyConfirm(`Hapus Periode Audit "${nama}"?`, async () => {
      try {
        await apiClient.delete(`/api/periode-audit/${id}`);
        notifySuccess('Periode Audit berhasil dihapus');
        fetchData();
      } catch {
        notifyError('Gagal menghapus periode audit');
      }
    });
  };

  const formatDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const activePeriod = data.find(d => d.is_active);

  return (
    <div className="px-4 sm:px-8 py-4 font-sans">
      <div className="w-full">
      {/* ── HEADER ── */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-black text-slate-800 uppercase tracking-tight">
            <BsCalendar2Check className="text-violet-600" /> Periode Audit
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola periode audit tahunan dan tentukan periode yang sedang aktif berjalan.
          </p>
        </div>
        <div className="flex gap-3">
          {/* Search */}
          <div className="relative">
            <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Cari periode..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500 w-52"
            />
          </div>
          {/* Filter Tahun */}
          <select
            value={filterTahun}
            onChange={e => setFilterTahun(e.target.value)}
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500 text-slate-600"
          >
            <option value="">Semua Tahun</option>
            {tahunList.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 shadow-lg shadow-violet-100 transition-all"
          >
            <BsPlusLg /> Tambah Periode
          </button>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Periode</p>
          <p className="text-3xl font-black text-slate-800 mt-1">{data.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-slate-400 uppercase">Periode Aktif</p>
          {activePeriod ? (
            <>
              <p className="text-xl font-black text-violet-600 mt-1">{activePeriod.nama_periode}</p>
              <p className="text-xs text-slate-400 font-mono">{activePeriod.tahun}</p>
            </>
          ) : (
            <p className="text-xl font-black text-slate-300 mt-1">—</p>
          )}
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Tahun Tercatat</p>
          <p className="text-3xl font-black text-emerald-600 mt-1">{tahunList.length}</p>
        </div>
      </div>

      {/* ── KONTEN ── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <BsCalendar2Check size={48} className="mx-auto mb-4 opacity-20" />
          <p>Belum ada periode audit yang dikonfigurasi</p>
          <button onClick={openAdd} className="mt-4 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold">
            Tambah Sekarang
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-black text-slate-400 uppercase tracking-widest">
            <div>Nama Periode</div>
            <div>Tahun</div>
            <div>Mulai</div>
            <div>Selesai</div>
            <div>Status</div>
            <div>Aksi</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-slate-50">
            {filtered.map(item => (
              <div
                key={item.id}
                className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center px-6 py-4 hover:bg-slate-50 transition-colors ${item.is_active ? 'bg-violet-50/40' : ''}`}
              >
                {/* Nama */}
                <div>
                  <div className="flex items-center gap-2">
                    {item.is_active && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
                      </span>
                    )}
                    <p className="font-bold text-slate-800">{item.nama_periode}</p>
                  </div>
                  {item.keterangan && (
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.keterangan}</p>
                  )}
                </div>
                {/* Tahun */}
                <div>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold font-mono">
                    {item.tahun}
                  </span>
                </div>
                {/* Mulai */}
                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                  <BsClock size={12} className="text-slate-400" />
                  {formatDate(item.tanggal_mulai)}
                </div>
                {/* Selesai */}
                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                  <BsCalendarRange size={12} className="text-slate-400" />
                  {formatDate(item.tanggal_selesai)}
                </div>
                {/* Status */}
                <div>
                  {item.is_active ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold">
                      <BsCheckCircleFill size={10} /> Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">
                      <BsXCircleFill size={10} /> Non-Aktif
                    </span>
                  )}
                </div>
                {/* Aksi */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all"
                    title="Edit"
                  >
                    <BsPencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.nama_periode)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Hapus"
                  >
                    <BsTrash size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-violet-600 px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg">
                {editId ? 'Edit Periode Audit' : 'Tambah Periode Audit'}
              </h3>
              <button onClick={() => setShowModal(false)}>
                <BsX size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Tahun */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">
                  Tahun <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="contoh: 2025"
                  value={form.tahun}
                  onChange={e => setForm({ ...form, tahun: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Nama Periode */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">
                  Nama Periode <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="contoh: Periode Audit Triwulan I 2025"
                  value={form.nama_periode}
                  onChange={e => setForm({ ...form, nama_periode: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Tanggal */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={form.tanggal_mulai}
                    onChange={e => setForm({ ...form, tanggal_mulai: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={form.tanggal_selesai}
                    onChange={e => setForm({ ...form, tanggal_selesai: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              {/* Keterangan */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Keterangan</label>
                <textarea
                  rows={3}
                  placeholder="Deskripsi singkat periode audit ini..."
                  value={form.keterangan}
                  onChange={e => setForm({ ...form, keterangan: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
              </div>

              {/* Is Active Toggle */}
              <div className="flex items-center justify-between p-4 bg-violet-50 rounded-xl border border-violet-100">
                <div>
                  <p className="text-sm font-bold text-slate-700">Jadikan Periode Aktif</p>
                  <p className="text-xs text-slate-500">Periode lain akan otomatis dinonaktifkan</p>
                </div>
                <button
                  onClick={() => setForm({ ...form, is_active: !form.is_active })}
                  className={`text-3xl transition-colors ${form.is_active ? 'text-violet-600' : 'text-slate-300'}`}
                >
                  {form.is_active ? <BsToggleOn /> : <BsToggleOff />}
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 text-slate-500 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 bg-violet-600 text-white font-bold rounded-xl shadow-lg shadow-violet-100 hover:bg-violet-700 transition-all disabled:opacity-60"
                >
                  {saving ? 'Menyimpan...' : (editId ? 'Update Periode' : 'Simpan Periode')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default PeriodeAudit;
