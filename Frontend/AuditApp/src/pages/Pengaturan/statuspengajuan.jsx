import React, { useEffect, useState } from 'react';
import apiClient from "../../../../Shared/api/apiClient";
import { 
  BsPlusLg, BsPencil, BsTrash, BsCircleFill, 
  BsArrowDownUp
} from 'react-icons/bs';
import { IoColorFillSharp, IoColorPaletteOutline, IoWater } from "react-icons/io5";

const StatusPengajuan = () => {
  const [statuses, setStatuses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    nama: "",
    deskripsi: "",
    warna: "#000000",
    urutan: ""
  });

  // 🔥 FETCH DATA
  const fetchData = async () => {
    try {
      const res = await apiClient.get("/api/status-pemeriksaan");
      setStatuses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔥 VALIDASI HEX
  const isValidHex = (color) => {
    return /^#([0-9A-F]{3}){1,2}$/i.test(color);
  };

  const isValidColor = (color) => {
    const s = new Option().style;
    s.color = color;
    return s.color !== "";
  };

  // 🔥 OPEN MODAL TAMBAH
  const openCreate = () => {
    setEditId(null);
    setForm({
      nama: "",
      deskripsi: "",
      warna: "#000000",
      urutan: statuses.length + 1
    });
    setIsModalOpen(true);
  };

  // 🔥 OPEN EDIT
  const openEdit = (item) => {
    setEditId(item.id);
    setForm(item);
    setIsModalOpen(true);
  };

  // 🔥 SUBMIT
  const handleSubmit = async () => {
    if (!form.nama) return alert("Nama wajib diisi");
    if (!isValidColor(form.warna)) return alert("Format warna tidak valid!");    

    try {
      if (editId) {
        await apiClient.put(`/api/status-pemeriksaan/${editId}`, form);
      } else {
        await apiClient.post("/api/status-pemeriksaan", form);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Hapus data?")) return;

    try {
      await apiClient.delete(`/api/status-pemeriksaan/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Status Pemeriksaan</h2>
          <p className="text-sm text-slate-500">
            Atur workflow audit
          </p>
        </div>

        <button 
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg"
        >
          <BsPlusLg /> Tambah
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-xs uppercase">
            <tr>
              <th className="px-6 py-3">No</th>
              <th className="px-6 py-3">Nama</th>
              <th className="px-6 py-3">Deskripsi</th>
              <th className="px-6 py-3">Warna</th>
              <th className="px-6 py-3 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {statuses.map((item) => (
              <tr key={item.id} className="border-t">

                <td className="px-6 py-3 font-semibold">
                  {item.urutan}
                </td>

                <td className="px-6 py-3 font-semibold">
                  {item.nama}
                </td>

                <td className="px-6 py-3 text-sm">
                  {item.deskripsi}
                </td>

                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <IoWater style={{ color: item.warna }} />
                    {item.warna}
                  </div>
                </td>

                <td className="px-6 py-3 text-center">
                  <button 
                    onClick={() => openEdit(item)}
                    className="mr-2 text-blue-500"
                  >
                    <BsPencil />
                  </button>

                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500"
                  >
                    <BsTrash />
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[400px]">

            <h3 className="font-bold mb-4">
              {editId ? "Edit Status" : "Tambah Status"}
            </h3>

            {/* NAMA */}
            <label className="block text-sm font-medium mb-1">Nama</label>
            <input
              type="text"
              placeholder="Nama"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              className="w-full mb-3 border p-2 rounded"
            />

            {/* DESKRIPSI */}
            <label className="block text-sm font-medium mb-1">Deskripsi</label>
            <textarea
              placeholder="Deskripsi"
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              className="w-full mb-3 border p-2 rounded"
            />

            {/* WARNA */}
            <label className="block text-sm font-medium mb-1">Warna</label>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="color"
                value={form.warna}
onChange={(e) => {
  let value = e.target.value;
  if (/^[0-9A-F]{6}$/i.test(value)) {
    value = "#" + value;
  }
  setForm({ ...form, warna: value });
}}              />

              <input
                type="text"
                value={form.warna}
                onChange={(e) => setForm({ ...form, warna: e.target.value })}
                className="border p-2 rounded w-full"
              />

              <div 
                className="w-8 h-8 rounded border"
                style={{
                  backgroundColor: isValidColor(form.warna) ? form.warna : "#000"
                }}              
                />
            </div>


            {/* ACTION */}
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-2 border rounded"
              >
                Batal
              </button>

              <button 
                onClick={handleSubmit}
                className="px-3 py-2 bg-slate-800 text-white rounded"
              >
                Simpan
              </button>
            </div>

          </div>
        </div>
      )}

      {/* INFO */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg flex gap-3">
        <BsArrowDownUp />
        <p className="text-xs">
          Urutan menentukan alur workflow.
        </p>
      </div>

    </div>
  );
};

export default StatusPengajuan;