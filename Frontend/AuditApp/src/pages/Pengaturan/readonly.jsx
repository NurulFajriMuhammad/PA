import React, { useState, useEffect, useMemo } from 'react';
import { 
  BsShieldLock, BsSearch, BsCheckCircleFill, 
  BsXCircleFill, BsInfoCircle, BsFilter 
} from 'react-icons/bs';
import apiClient from "../../../../Shared/api/apiClient";
import { notifySuccess, notifyError } from "../../../../Shared/utils/notifier";

const HakAkses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [accessList, setAccessList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Ambil data dari database saat halaman dimuat
  useEffect(() => {
    fetchMatrix();
  }, []);

  const fetchMatrix = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/api/permission-matrix');
      // Pastikan backend mengembalikan data matriks (jabatan + module + permissions)
      setAccessList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      notifyError("Gagal mengambil data matriks akses");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Fungsi untuk mengubah permission secara lokal sebelum disimpan
  const togglePermission = (id, field) => {
    setAccessList(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: !item[field] } : item
    ));
  };

  // 3. Simpan perubahan ke database
  const handleUpdateMatrix = async () => {
    setIsLoading(true);
    try {
      await apiClient.post('/api/permission-matrix/update', {
        permissions: accessList
      });
      notifySuccess("Matriks akses berhasil diperbarui!");
      fetchMatrix(); // Refresh data
    } catch (err) {
      notifyError("Gagal memperbarui matriks akses");
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Logika Pencarian
  const filteredData = useMemo(() => {
    return accessList.filter(item => 
      item.jabatan?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.module?.nama_modul?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [accessList, searchTerm]);

  return (
    <div className="p-6">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BsShieldLock className="text-indigo-600" /> Manajemen Hak Akses
          </h2>
          <p className="text-sm text-slate-500">Kelola izin Read, Write, dan Delete berdasarkan Jabatan dan Modul.</p>
        </div>
        
        <div className="flex gap-2">
           <div className="relative">
              <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Cari jabatan atau modul..."
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                value={searchTerm}
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
            {isLoading && accessList.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-slate-400">Memuat data...</td></tr>
            ) : filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-700">{item.jabatan?.nama}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md font-medium border border-indigo-100">
                      {item.module?.nama_modul}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center cursor-pointer" onClick={() => togglePermission(item.id, 'can_read')}>
                      {item.can_read ? <BsCheckCircleFill className="text-emerald-500" /> : <BsXCircleFill className="text-slate-300" />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center cursor-pointer" onClick={() => togglePermission(item.id, 'can_write')}>
                      {item.can_write ? <BsCheckCircleFill className="text-emerald-500" /> : <BsXCircleFill className="text-slate-300" />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center cursor-pointer" onClick={() => togglePermission(item.id, 'can_delete')}>
                      {item.can_delete ? <BsCheckCircleFill className="text-emerald-500" /> : <BsXCircleFill className="text-slate-300" />}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="text-center py-10 text-slate-400">Data tidak ditemukan.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="mt-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex gap-3 items-start">
          <BsInfoCircle className="text-indigo-500 mt-1 shrink-0" />
          <p className="text-xs text-indigo-800 leading-relaxed">
            <strong>Cara Penggunaan:</strong> Klik pada icon centang/silang untuk mengubah izin secara langsung. Jangan lupa klik tombol <strong>Perbarui Matriks Akses</strong> di sebelah kanan untuk menyimpan perubahan secara permanen ke sistem.
          </p>
        </div>
        <button 
          onClick={handleUpdateMatrix}
          disabled={isLoading}
          className={`px-6 py-3 rounded-xl transition-all font-bold text-sm shadow-md border-none cursor-pointer self-center md:self-start ${
            isLoading ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-slate-800 text-white hover:bg-slate-700'
          }`}
        >
          {isLoading ? "Memproses..." : "Perbarui Matriks Akses"}
        </button>
      </div>
    </div>
  );
};

export default HakAkses;