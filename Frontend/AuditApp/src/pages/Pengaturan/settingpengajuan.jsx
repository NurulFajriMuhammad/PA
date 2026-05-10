import React, { useState, useEffect } from 'react';
import apiClient from "../../../../Shared/api/apiClient";
import {
  BsPlusLg, BsPencil, BsTrash, BsX, BsArrowRightCircle,
  BsArrowReturnLeft, BsPersonBadge, BsDiagram3
} from 'react-icons/bs';
import { IoWater } from "react-icons/io5";
import { notifySuccess, notifyError, notifyConfirm } from "../../../../Shared/utils/notifier.jsx";

const JENIS_OPTIONS = [
  { value: 'internal',   label: 'Internal' },
  { value: 'eksternal',  label: 'Eksternal' },
];

const JENIS_BADGE = {
  internal:  'bg-blue-100 text-blue-700 border border-blue-200',
  eksternal: 'bg-purple-100 text-purple-700 border border-purple-200',
};

const EMPTY_FORM = {
  status_pemeriksaan_id:  '',
  role_id:                '',
  status_selanjutnya_id:  '',
  status_dikembalikan_id: '',
  jenis:                  'internal',
};

const SettingPengajuan = () => {
  const [transitions, setTransitions]   = useState([]);
  const [statuses, setStatuses]         = useState([]);
  const [roles, setRoles]               = useState([]);
  const [showModal, setShowModal]       = useState(false);
  const [editId, setEditId]             = useState(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [filterJenis, setFilterJenis]   = useState('');

  const fetchAll = async () => {
    try {
      const [tRes, sRes, rRes] = await Promise.all([
        apiClient.get('/api/pengajuan-transitions'),
        apiClient.get('/api/status-pemeriksaan'),
        apiClient.get('/api/roles'),
      ]);
      setTransitions(tRes.data);
      setStatuses(sRes.data);
      setRoles(Array.isArray(rRes.data) ? rRes.data : rRes.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditId(item.id);
    setForm({
      status_pemeriksaan_id:  item.status_pemeriksaan_id,
      role_id:                item.role_id,
      status_selanjutnya_id:  item.status_selanjutnya_id || '',
      status_dikembalikan_id: item.status_dikembalikan_id || '',
      jenis:                  item.jenis,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.status_pemeriksaan_id || !form.role_id) {
      return notifyError('Status Pemeriksaan dan Role wajib dipilih');
    }
    try {
      const payload = {
        ...form,
        status_selanjutnya_id:  form.status_selanjutnya_id  || null,
        status_dikembalikan_id: form.status_dikembalikan_id || null,
      };
      if (editId) {
        await apiClient.put(`/api/pengajuan-transitions/${editId}`, payload);
      } else {
        await apiClient.post('/api/pengajuan-transitions', payload);
      }
      notifySuccess('Data berhasil disimpan');
      setShowModal(false);
      fetchAll();
    } catch (err) {
      notifyError('Gagal menyimpan data');
    }
  };

  const handleDelete = (id) => {
    notifyConfirm('Hapus aturan transisi ini?', async () => {
      try {
        await apiClient.delete(`/api/pengajuan-transitions/${id}`);
        notifySuccess('Berhasil dihapus');
        fetchAll();
      } catch (err) {
        notifyError('Gagal menghapus');
      }
    });
  };

  const statusMap  = Object.fromEntries(statuses.map(s => [s.id, s]));
  const roleMap    = Object.fromEntries(roles.map(r => [r.id, r]));

  const filtered = (filterJenis
    ? transitions.filter(t => t.jenis === filterJenis)
    : transitions).sort((a, b) => a.id - b.id);

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-black text-slate-800 uppercase tracking-tight">
            <BsDiagram3 className="text-blue-600" /> History Alur Pengajuan
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Atur aturan transisi: dari <strong>Status</strong> mana, <strong>Role</strong> mana yang berhak bertindak, dan ke <strong>Status</strong> mana selanjutnya.
          </p>
        </div>

        <div className="flex gap-3 items-center">
          {/* Filter Jenis */}
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 gap-1">
            {['', 'internal', 'eksternal'].map(j => (
              <button key={j}
                onClick={() => setFilterJenis(j)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${filterJenis === j ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {j === '' ? 'Semua' : j.charAt(0).toUpperCase() + j.slice(1)}
              </button>
            ))}
          </div>

          <button onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
          >
            <BsPlusLg /> Tambah Aturan
          </button>
        </div>
      </div>

      {/* TABEL */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="px-5 py-4 text-center">No</th>
              <th className="px-5 py-4">Status Pemeriksaan</th>
              <th className="px-5 py-4">Role / Group</th>
              <th className="px-5 py-4">
                <span className="flex items-center gap-1.5"><BsArrowRightCircle className="text-emerald-500" /> Status Selanjutnya</span>
              </th>
              <th className="px-5 py-4">
                <span className="flex items-center gap-1.5"><BsArrowReturnLeft className="text-rose-400" /> Status Dikembalikan</span>
              </th>
              <th className="px-5 py-4">Jenis</th>
              <th className="px-5 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-slate-400">
                  <BsDiagram3 size={40} className="mx-auto mb-3 opacity-30" />
                  <p>Belum ada aturan transisi</p>
                </td>
              </tr>
            ) : filtered.map((t, i) => {
              const sp  = statusMap[t.status_pemeriksaan_id];
              const sn  = statusMap[t.status_selanjutnya_id];
              const sdk = statusMap[t.status_dikembalikan_id];
              const role = roleMap[t.role_id];
              return (
                <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5 text-center text-xs text-slate-400 font-mono">{i + 1}</td>

                  <td className="px-5 py-3.5">
                    {sp ? (
                      <span className="flex items-center gap-2">
                        <IoWater style={{ color: sp.warna }} size={14} />
                        <span className="font-bold text-slate-800 text-sm">{sp.nama}</span>
                      </span>
                    ) : <span className="text-slate-400 text-sm">-</span>}
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                      <BsPersonBadge className="text-slate-400" />
                      {role?.name || t.role?.name || '-'}
                    </span>
                  </td>

                  <td className="px-5 py-3.5">
                    {sn ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold" style={{ backgroundColor: sn.warna + '22', color: sn.warna, border: `1px solid ${sn.warna}55` }}>
                        <BsArrowRightCircle size={11} /> {sn.nama}
                      </span>
                    ) : <span className="text-slate-300 text-xs">—</span>}
                  </td>

                  <td className="px-5 py-3.5">
                    {sdk ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
                        <BsArrowReturnLeft size={11} /> {sdk.nama}
                      </span>
                    ) : <span className="text-slate-300 text-xs">—</span>}
                  </td>

                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${JENIS_BADGE[t.jenis] || ''}`}>
                      {t.jenis}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => openEdit(t)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><BsPencil size={14} /></button>
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><BsTrash size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold">{editId ? 'Edit Aturan Transisi' : 'Tambah Aturan Transisi'}</h3>
              <button onClick={() => setShowModal(false)}><BsX size={24} /></button>
            </div>
            <div className="p-6 space-y-5">

              {/* Status Pemeriksaan */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Status Pemeriksaan (Asal)</label>
                <select value={form.status_pemeriksaan_id}
                  onChange={e => setForm({ ...form, status_pemeriksaan_id: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">— Pilih Status —</option>
                  {statuses.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                </select>
              </div>

              {/* Role */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Role / Group yang Berhak</label>
                <select value={form.role_id}
                  onChange={e => setForm({ ...form, role_id: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">— Pilih Role —</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Status Selanjutnya */}
                <div>
                  <label className="text-xs font-bold text-emerald-600 uppercase mb-1.5 flex items-center gap-1 block"><BsArrowRightCircle /> Jika Disetujui →</label>
                  <select value={form.status_selanjutnya_id}
                    onChange={e => setForm({ ...form, status_selanjutnya_id: e.target.value })}
                    className="w-full p-3 border border-emerald-100 rounded-xl text-sm bg-emerald-50 outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="">— Tidak Berubah —</option>
                    {statuses.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                  </select>
                </div>

                {/* Status Dikembalikan */}
                <div>
                  <label className="text-xs font-bold text-rose-500 uppercase mb-1.5 flex items-center gap-1 block"><BsArrowReturnLeft /> Jika Ditolak →</label>
                  <select value={form.status_dikembalikan_id}
                    onChange={e => setForm({ ...form, status_dikembalikan_id: e.target.value })}
                    className="w-full p-3 border border-rose-100 rounded-xl text-sm bg-rose-50 outline-none focus:ring-2 focus:ring-rose-400"
                  >
                    <option value="">— Tidak Dikembalikan —</option>
                    {statuses.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
                  </select>
                </div>
              </div>

              {/* Jenis */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Jenis Audit</label>
                <div className="flex gap-2">
                  {JENIS_OPTIONS.map(opt => (
                    <button key={opt.value}
                      onClick={() => setForm({ ...form, jenis: opt.value })}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${form.jenis === opt.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 text-slate-500 font-bold rounded-xl border border-slate-200">Batal</button>
                <button onClick={handleSubmit} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingPengajuan;
