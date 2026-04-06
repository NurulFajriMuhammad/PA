import React, { useEffect, useState } from "react";
import apiClient from "../../../../Shared/api/apiClient";
import {
  BsChatLeftText,
  BsSearch,
  BsLightningCharge,
  BsPeople,
  BsCalendar3,
  BsX,
} from "react-icons/bs";

const AdvisoryService = () => {
  const [dataAdvisory, setDataAdvisory] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [units, setUnits] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [form, setForm] = useState({
    tanggal_kegiatan: "",
    unit_id: "",
    contact_person: "",
    no_telepon: "",
    waktu_mulai: "",
    waktu_selesai: "",
    uraian_konsultasi: "",
    opini_spi: "",
    pengawas: "",
    keterangan: "",
  });

  

  // ================= FETCH =================


  useEffect(() => {
    fetchData();
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    const res = await apiClient.get("/api/units");
    setUnits(res.data.data);
  };

  const fetchData = async () => {
    const res = await apiClient.get("/api/advisory-service");
    setDataAdvisory(res.data.data || []);
  };

  // ================= HANDLE =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSave = async () => {
  try {
    const formData = new FormData();

    if (isEdit) {
      await apiClient.post(
        `/api/advisory-service/${selectedId}?_method=PUT`,
        formData
      );
    } else {
      await apiClient.post("/api/advisory-service", formData);
    }

    fetchData();
    setOpenModal(false);
    setIsEdit(false);
    setSelectedId(null);

    // reset form
    setForm({
      tanggal_kegiatan: "",
      unit_id: "",
      contact_person: "",
      no_telepon: "",
      waktu_mulai: "",
      waktu_selesai: "",
      uraian_konsultasi: "",
      opini_spi: "",
      pengawas: "",
      keterangan: "",
    });

  } catch (err) {
    console.error(err);
    alert("Gagal simpan");
  }
};

const handleEdit = (item) => {
  setForm({
    tanggal_kegiatan: item.tanggal_kegiatan || "",
    unit_id: item.unit_id || "",
    contact_person: item.contact_person || "",
    no_telepon: item.no_telepon || "",
    waktu_mulai: item.waktu_mulai || "",
    waktu_selesai: item.waktu_selesai || "",
    uraian_konsultasi: item.uraian_konsultasi || "",
    opini_spi: item.opini_spi || "",
    pengawas: item.pengawas || "",
    keterangan: item.keterangan || "",
  });

  setSelectedId(item.id);
  setIsEdit(true);
  setOpenModal(true);
};

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus data?")) return;
    await apiClient.delete(`/api/advisory-service/${id}`);
    fetchData();
  };

  return (
    <div className="p-6 bg-[#f9fafb] min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BsChatLeftText className="text-indigo-600" /> Advisory Service
          </h1>
          <p className="text-slate-500 mt-1">
            Layanan konsultasi SPI
          </p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold"
        >
          + Tambah Advisory
        </button>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b flex justify-between">
          <div className="relative">
            <BsSearch className="absolute left-3 top-2 text-gray-400" />
            <input
              placeholder="Cari..."
              className="pl-10 border rounded p-2 text-sm"
            />
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="p-3">No</th>
              <th className="p-3">Tanggal</th>
              <th className="p-3">Unit</th>
              <th className="p-3">Contact Person</th>
              <th className="p-3">Pengawas</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {dataAdvisory.length > 0 ? (
              dataAdvisory.map((item, i) => (
                <tr key={item.id} className="border-b">
                  <td className="p-3 text-center">{i + 1}</td>
                  <td className="p-3">{item.tanggal_kegiatan}</td>
                  <td className="p-3">{item.unit}</td>
                  <td className="p-3">{item.contact_person}</td>
                  <td className="p-3">{item.pengawas}</td>
                  <td className="p-3 flex gap-2">
                    <button 
                    onClick={() => handleEdit(item)}
                    className="text-blue-600 text-xs font-bold">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 text-xs font-bold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center p-6 text-gray-400">
                  Belum ada data advisory
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL ================= */}
      {openModal && (
<div className="fixed inset-0 flex items-center justify-center z-[9999]">
  <div
    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
    onClick={() => setOpenModal(false)}
  ></div>

  <div className="bg-white w-[750px] rounded-xl p-6 relative">
    
    {/* HEADER */}
    <div className="flex justify-between mb-4">
      <h2 className="font-bold text-lg">{isEdit ? "Edit Advisory Service" : "Tambah Advisory Service"}</h2>
      <button onClick={() => setOpenModal(false)}>
        <BsX size={24} />
      </button>
    </div>

    {/* FORM */}
    <div className="grid grid-cols-2 gap-4">

      {/* TANGGAL */}
      <div className="flex flex-col">
        <label className="text-xs font-bold text-slate-500 mb-1">
          Tanggal Kegiatan
        </label>
        <input
          type="date"
          name="tanggal_kegiatan"
          value={form.tanggal_kegiatan}
          onChange={handleChange}
          className="border p-2 rounded"
        />
      </div>

            {/* WAKTU */}
      <div className="flex flex-row gap-4">
        
        <div className="flex flex-col w-40">
          <label className="text-xs font-bold text-slate-500 mb-1">
            Waktu Mulai
          </label>
          <input
            type="time"
            name="waktu_mulai"
            value={form.waktu_mulai}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>

        <div className="flex flex-col w-40">
          <label className="text-xs font-bold text-slate-500 mb-1">
            Waktu Selesai
          </label>
          <input
            type="time"
            name="waktu_selesai"
            value={form.waktu_selesai}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>

      </div>

      {/* UNIT */}
      <div className="flex flex-col">
        <label className="text-xs font-bold text-slate-500 mb-1">
          Unit / Divisi
        </label>
<select
  name="unit_id"
  onChange={handleChange}
  value={form.unit_id || ""}
>
  <option value="">Pilih Unit</option>
  {units.map((u) => (
    <option key={u.id} value={u.id}>
      {u.nama}
    </option>
  ))}
</select>
      </div>

      {/* CONTACT PERSON */}
      <div className="flex flex-col">
        <label className="text-xs font-bold text-slate-500 mb-1">
          Contact Person
        </label>
        <input
          name="contact_person"
          placeholder="Nama PIC"
          value={form.contact_person}
          onChange={handleChange}
          className="border p-2 rounded"
        />
      </div>

      {/* TELEPON */}
      <div className="flex flex-col">
        <label className="text-xs font-bold text-slate-500 mb-1">
          Nomor Telepon
        </label>
        <input
          name="no_telepon"
          placeholder="08xxxx"
          value={form.no_telepon}
          onChange={handleChange}
          className="border p-2 rounded"
        />
      </div>


      {/* URAIAN */}
      <div className="col-span-2 flex flex-col">
        <label className="text-xs font-bold text-slate-500 mb-1">
          Uraian Layanan Konsultasi
        </label>
        <textarea
          name="uraian_konsultasi"
          placeholder="Jelaskan kebutuhan konsultasi..."
          value={form.uraian_konsultasi}
          onChange={handleChange}
          className="border p-2 rounded h-20"
        />
      </div>

      {/* OPINI */}
      <div className="col-span-2 flex flex-col">
        <label className="text-xs font-bold text-slate-500 mb-1">
          Opini / Saran SPI
        </label>
        <textarea
          name="opini_spi"
          placeholder="Isi setelah proses advisory..."
          value={form.opini_spi}
          onChange={handleChange}
          className="border p-2 rounded h-20"
        />
      </div>

      {/* PENGAWAS */}
      <div className="flex flex-col">
        <label className="text-xs font-bold text-slate-500 mb-1">
          Pengawas / Auditor
        </label>
        <input
          name="pengawas"
          placeholder="Nama auditor"
          value={form.pengawas}
          onChange={handleChange}
          className="border p-2 rounded"
        />
      </div>

      {/* KETERANGAN */}
      <div className="flex flex-col">
        <label className="text-xs font-bold text-slate-500 mb-1">
          Keterangan Tambahan
        </label>
        <input
          name="keterangan"
          placeholder="Opsional"
          value={form.keterangan}
          onChange={handleChange}
          className="border p-2 rounded"
        />
      </div>


    </div>

    {/* FOOTER */}
    <div className="flex gap-3 mt-6 border-t pt-4">
      <button
        onClick={() => setOpenModal(false)}
        className="flex-1 bg-gray-200 py-2 rounded font-medium"
      >
        Batal
      </button>
      <button
        onClick={handleSave}
        className="flex-1 bg-blue-600 text-white py-2 rounded font-bold"
      >
        Simpan Advisory
      </button>
    </div>
  </div>
</div>
      )}
    </div>
  );
};

export default AdvisoryService;