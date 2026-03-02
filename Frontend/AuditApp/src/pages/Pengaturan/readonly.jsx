import React, { useState } from 'react';
import { 
  BsShieldLock, BsSearch, BsCheckCircleFill, 
  BsXCircleFill, BsInfoCircle, BsFilter 
} from 'react-icons/bs';

const HakAkses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Data dummy peran/jabatan dan hak aksesnya
  const [accessList] = useState([
    { id: 1, role: 'Direksi', module: 'Laporan Final', read: true, write: false, delete: false },
    { id: 2, role: 'Unit Kerja (Auditee)', module: 'Temuan Audit', read: true, write: false, delete: false },
    { id: 3, role: 'Komite Audit', module: 'Seluruh Modul', read: true, write: false, delete: false },
    { id: 4, role: 'Arsiparis', module: 'Dokumen Fisik KKA', read: true, write: false, delete: false },
    { id: 5, role: 'Staf Administrasi', module: 'Surat Tugas', read: true, write: true, delete: false },
  ]);

  return (
    <div className="p-6">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BsShieldLock className="text-indigo-600" /> Hak Akses (Read Only)
          </h2>
          <p className="text-sm text-slate-500">Tentukan jabatan atau peran yang dibatasi aksesnya hanya untuk melihat data.</p>
        </div>
        
        <div className="flex gap-2">
           <div className="relative">
              <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Cari peran..."
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <button className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 cursor-pointer">
              <BsFilter size={18} />
           </button>
        </div>
      </div>

      {/* Tabel Akses */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Peran / Jabatan</th>
              <th className="px-6 py-4">Modul Terkait</th>
              <th className="px-6 py-4 text-center">Read (Lihat)</th>
              <th className="px-6 py-4 text-center">Write (Edit)</th>
              <th className="px-6 py-4 text-center">Delete (Hapus)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {accessList.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-bold text-slate-700">{item.role}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md font-medium border border-indigo-100">
                    {item.module}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    {item.read ? <BsCheckCircleFill className="text-emerald-500" /> : <BsXCircleFill className="text-slate-300" />}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    {item.write ? <BsCheckCircleFill className="text-emerald-500" /> : <BsXCircleFill className="text-slate-300" />}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    {item.delete ? <BsCheckCircleFill className="text-emerald-500" /> : <BsXCircleFill className="text-slate-300" />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="mt-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex gap-3 items-start">
          <BsInfoCircle className="text-indigo-500 mt-1 shrink-0" />
          <p className="text-xs text-indigo-800 leading-relaxed">
            <strong>Catatan:</strong> Peran dengan tanda silang merah pada kolom <strong>Write</strong> dan <strong>Delete</strong> secara otomatis masuk ke kategori <strong>Read-Only</strong> untuk modul tersebut. Hal ini mencegah perubahan data yang sudah bersifat final atau sensitif.
          </p>
        </div>
        <button className="px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all font-bold text-sm shadow-md border-none cursor-pointer self-center md:self-start">
          Perbarui Matriks Akses
        </button>
      </div>
    </div>
  );
};

export default HakAkses;