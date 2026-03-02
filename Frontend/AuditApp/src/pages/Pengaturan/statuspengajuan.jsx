import React, { useState } from 'react';
import { 
  BsPlusLg, BsPencil, BsTrash, BsCircleFill, 
  BsGrid3X3Gap, BsArrowDownUp 
} from 'react-icons/bs';

const StatusPengajuan = () => {
  const [statuses] = useState([
    { id: 1, nama: 'Draft', warna: '#94a3b8', deskripsi: 'Dokumen baru dibuat, belum dikirim.', urutan: 1 },
    { id: 2, nama: 'Review Ketua Tim', warna: '#3b82f6', deskripsi: 'Sedang diperiksa oleh Ketua Tim Audit.', urutan: 2 },
    { id: 3, nama: 'Review Pengawas', warna: '#f59e0b', deskripsi: 'Pengecekan oleh Pengawas Internal.', urutan: 3 },
    { id: 4, nama: 'Approved', warna: '#10b981', deskripsi: 'Final dan telah disetujui.', urutan: 4 },
    { id: 5, nama: 'Rejected', warna: '#ef4444', deskripsi: 'Ditolak dan memerlukan revisi.', urutan: 5 },
  ]);

  return (
    <div className="p-6">
      {/* Header Halaman */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Status Pengajuan</h2>
          <p className="text-sm text-slate-500">Atur tahapan workflow untuk dokumen audit dan laporan.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-all text-sm font-semibold border-none cursor-pointer shadow-sm">
          <BsPlusLg /> Tambah Status
        </button>
      </div>

      {/* List Status */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4 w-16 text-center">Urutan</th>
                <th className="px-6 py-4">Nama Status</th>
                <th className="px-6 py-4">Deskripsi</th>
                <th className="px-6 py-4">Label Warna</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {statuses.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <BsGrid3X3Gap className="cursor-move opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="font-mono font-bold text-slate-600">{item.urutan}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-700">{item.nama}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {item.deskripsi}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 w-fit bg-white">
                      <BsCircleFill style={{ color: item.warna }} size={10} />
                      <span className="text-xs font-mono text-slate-600 uppercase">{item.warna}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-3">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border-none cursor-pointer bg-transparent">
                        <BsPencil size={14} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border-none cursor-pointer bg-transparent">
                        <BsTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3 items-start">
        <div className="text-blue-500 mt-1"><BsArrowDownUp /></div>
        <p className="text-xs text-blue-700 leading-relaxed">
          <strong>Tips:</strong> Urutan status menentukan alur maju mundurnya sebuah dokumen. Anda bisa menarik ikon titik-titik (drag & drop) untuk merubah urutan alur persetujuan.
        </p>
      </div>
    </div>
  );
};

export default StatusPengajuan;