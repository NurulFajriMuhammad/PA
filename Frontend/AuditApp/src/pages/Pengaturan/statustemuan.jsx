import React, { useState, useEffect } from 'react';
import { BsPlusLg, BsPencil, BsTrash, BsX, BsTags } from 'react-icons/bs';
import apiClient from "../../../../Shared/api/apiClient";
import { notifySuccess, notifyError, notifyConfirm } from "../../../../Shared/utils/notifier.jsx";

const EMPTY_FORM = { nama: '', warna: '#01aec4', warna_teks: '#ffffff' };

const isValidColor = (c) => { const s = new Option().style; s.color = c; return s.color !== ''; };

const StatusTemuan = () => {
  const [statuses, setStatuses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);

  const fetchData = async () => {
    try {
      const res = await apiClient.get('/api/status-temuan');
      setStatuses(res.data);
    } catch (err) { notifyError('Gagal memuat data'); }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditId(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit   = (item) => { setEditId(item.id); setForm({ nama: item.nama, warna: item.warna, warna_teks: item.warna_teks }); setShowModal(true); };

  const handleSubmit = async () => {
    if (!form.nama) return notifyError('Nama wajib diisi');
    if (!isValidColor(form.warna)) return notifyError('Format warna background tidak valid');
    if (!isValidColor(form.warna_teks)) return notifyError('Format warna teks tidak valid');
    try {
      if (editId) {
        await apiClient.put(`/api/status-temuan/${editId}`, form);
      } else {
        await apiClient.post('/api/status-temuan', form);
      }
      notifySuccess('Data berhasil disimpan');
      setShowModal(false);
      fetchData();
    } catch (err) { notifyError('Gagal menyimpan'); }
  };

  const handleDelete = (id) => {
    notifyConfirm('Hapus status temuan ini?', async () => {
      try {
        await apiClient.delete(`/api/status-temuan/${id}`);
        notifySuccess('Berhasil dihapus');
        fetchData();
      } catch (err) { notifyError('Gagal menghapus'); }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-black text-slate-800 uppercase tracking-tight">
            <BsTags className="text-rose-500" /> Status Temuan
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Atur nama, warna badge, dan warna teks untuk setiap status temuan (Draft, Monev, Close, dll).
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-lg shadow-rose-100 transition-all"
        >
          <BsPlusLg /> Tambah Status
        </button>
      </div>

      {/* PREVIEW BADGE */}
      {statuses.length > 0 && (
        <div className="mb-6 p-4 bg-white rounded-2xl border border-slate-200 flex flex-wrap gap-3 items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">Preview:</span>
          {statuses.map(s => (
            <span key={s.id}
              className="px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider"
              style={{ backgroundColor: s.warna, color: s.warna_teks }}
            >
              {s.nama}
            </span>
          ))}
        </div>
      )}

      {/* TABEL */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="px-5 py-4 text-center">No</th>
              <th className="px-5 py-4">Nama Status</th>
              <th className="px-5 py-4">Warna Badge (Background)</th>
              <th className="px-5 py-4">Warna Teks</th>
              <th className="px-5 py-4">Tampilan</th>
              <th className="px-5 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {statuses.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-400">
                  <BsTags size={40} className="mx-auto mb-3 opacity-20" />
                  <p>Belum ada status temuan</p>
                  <button onClick={openCreate} className="mt-3 px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-bold">Tambah Sekarang</button>
                </td>
              </tr>
            ) : statuses.map((item, i) => (
              <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3.5 text-center text-xs text-slate-400 font-mono">{i + 1}</td>
                <td className="px-5 py-3.5 font-bold text-slate-800">{item.nama}</td>

                {/* Warna Background */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg border border-slate-200 shadow-sm" style={{ backgroundColor: item.warna }} />
                    <span className="font-mono text-xs text-slate-500">{item.warna}</span>
                  </div>
                </td>

                {/* Warna Teks */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg border border-slate-200 shadow-sm" style={{ backgroundColor: item.warna_teks }} />
                    <span className="font-mono text-xs text-slate-500">{item.warna_teks}</span>
                  </div>
                </td>

                {/* Preview */}
                <td className="px-5 py-3.5">
                  <span className="px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider"
                    style={{ backgroundColor: item.warna, color: item.warna_teks }}>
                    {item.nama}
                  </span>
                </td>

                <td className="px-5 py-3.5 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => openEdit(item)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><BsPencil size={14} /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><BsTrash size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800">{editId ? 'Edit Status Temuan' : 'Tambah Status Temuan'}</h3>
              <button onClick={() => setShowModal(false)}><BsX size={22} className="text-slate-400 hover:text-red-500" /></button>
            </div>
            <div className="p-6 space-y-5">

              {/* Nama */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Nama Status</label>
                <input type="text" value={form.nama}
                  onChange={e => setForm({ ...form, nama: e.target.value })}
                  placeholder="contoh: Draft Temuan"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              {/* Warna Background */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Warna Badge (Background)</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={form.warna}
                    onChange={e => setForm({ ...form, warna: e.target.value })}
                    className="w-12 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                  />
                  <input type="text" value={form.warna}
                    onChange={e => setForm({ ...form, warna: e.target.value })}
                    placeholder="#01aec4"
                    className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-rose-400"
                  />
                  <div className="w-10 h-10 rounded-lg border border-slate-200 shadow-sm shrink-0"
                    style={{ backgroundColor: isValidColor(form.warna) ? form.warna : '#ccc' }} />
                </div>
              </div>

              {/* Warna Teks */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Warna Teks</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={form.warna_teks}
                    onChange={e => setForm({ ...form, warna_teks: e.target.value })}
                    className="w-12 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                  />
                  <input type="text" value={form.warna_teks}
                    onChange={e => setForm({ ...form, warna_teks: e.target.value })}
                    placeholder="#ffffff"
                    className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-rose-400"
                  />
                  <div className="w-10 h-10 rounded-lg border border-slate-200 shadow-sm shrink-0"
                    style={{ backgroundColor: isValidColor(form.warna_teks) ? form.warna_teks : '#ccc' }} />
                </div>
              </div>

              {/* Live Preview */}
              <div className="p-4 bg-slate-50 rounded-xl flex items-center gap-3">
                <span className="text-xs text-slate-400 font-bold uppercase">Preview:</span>
                <span className="px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wider"
                  style={{
                    backgroundColor: isValidColor(form.warna) ? form.warna : '#ccc',
                    color: isValidColor(form.warna_teks) ? form.warna_teks : '#000'
                  }}>
                  {form.nama || 'Status'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 text-slate-500 font-bold rounded-xl border border-slate-200">Batal</button>
                <button onClick={handleSubmit} className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusTemuan;
