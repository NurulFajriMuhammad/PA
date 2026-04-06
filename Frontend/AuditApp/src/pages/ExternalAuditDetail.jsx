import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../../Shared/api/apiClient";
import {
  BsX,
  BsArrowLeft,
} from "react-icons/bs";

const ExternalAuditDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openInfo, setOpenInfo] = useState(false);
  const [temuan, setTemuan] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  const [lheFile, setLheFile] = useState(null);
  const [existingLhe, setExistingLhe] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
const [selectedId, setSelectedId] = useState(null);
const [existingLampiran, setExistingLampiran] = useState(null);

const handleEdit = (item) => {
  setForm({
    masalah: item.masalah || "",
    kriteria: item.kriteria || "",
    sebab: item.sebab || "",
    akibat: item.akibat || "",
    kondisi: item.kondisi || "",
    rekomendasi: item.rekomendasi || "",
    rencana: item.rencana || "",
    keterangan: item.keterangan || "",
    target_penyelesaian: item.target_penyelesaian || "",
    nilai_kerugian: item.nilai_kerugian || ""
  });

  setSelectedId(item.id);
  setIsEdit(true);
  setOpenModal(true);
  setExistingLampiran(item.lampiran || null);
  setLheFile(null);
};

const fetchTemuan = async () => {
  const res = await apiClient.get(`/api/external-audit/${id}/temuan`);
  setTemuan(res.data.data);
};

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await apiClient.get(`/api/external-audit/${id}`);
        setData(res.data.data);
      } catch (err) {
        console.error(err);
        alert("Gagal mengambil data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetail();
    fetchTemuan();
  }, [id]); // ✅ tambahin dependency
  

  const formatTanggal = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

    const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSave = async () => {
  try {
    const formData = new FormData();

    Object.keys(form).forEach(key => {
      formData.append(key, form[key] || "");
    });

    formData.append("external_audit_id", id);

if (lheFile) {
  // upload file baru
  formData.append("lampiran", lheFile);

} else if (!existingLampiran) {
  // 🔥 user hapus file lama
  formData.append("lampiran", null);
}

    const isComplete =
      form.masalah &&
      form.kriteria &&
      form.sebab &&
      form.akibat &&
      form.kondisi &&
      form.rekomendasi &&
      form.rencana &&
      form.target_penyelesaian;

    formData.append("status", isComplete ? "monev" : "draft");

    if (isEdit) {
      await apiClient.post(`/api/external-audit-temuan/${selectedId}?_method=PUT`, formData);
    } else {
      await apiClient.post("/api/external-audit-temuan", formData);
    }

    fetchTemuan();
    setOpenModal(false);
    setIsEdit(false);
    setSelectedId(null);
    setForm({});
    setLheFile(null);

  } catch (err) {
    console.error(err);
    alert("Gagal simpan");
  }
};



  const [form, setForm] = useState({
  masalah: "",
  kriteria: "",
  sebab: "",
  akibat: "",
  kondisi: "",
  rekomendasi: "",
  rencana: "",
  keterangan: "",
  target_penyelesaian: ""
});


const formatRupiah = (value) => {
  if (!value) return "";

  return new Intl.NumberFormat("id-ID").format(Number(value));
};

const handleDelete = async (idTemuan) => {
  if (!window.confirm("Yakin hapus data?")) return;

  await apiClient.delete(`/api/external-audit-temuan/${idTemuan}`);
  fetchTemuan();
};

const resetForm = () => {
  setForm({
    masalah: "",
    kriteria: "",
    sebab: "",
    akibat: "",
    kondisi: "",
    rekomendasi: "",
    rencana: "",
    keterangan: "",
    target_penyelesaian: "",
    nilai_kerugian: ""
  });

  setIsEdit(false);
  setSelectedId(null);
  setLheFile(null);
  setExistingLampiran(null);
};

useEffect(() => {
  if (!openModal) {
    resetForm();
  }
}, [openModal]);

  if (loading) {
    return (
      <div className="p-6 text-center text-slate-500">
        Loading...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-red-500">
        Data tidak ditemukan
      </div>
    );
  }

  return (
    <div className="p-2">

      <button
        onClick={() => navigate("/external-audit")}
        className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-900 text-white text-sm font-bold rounded-lg shadow-md shadow-red-100 transition-all active:scale-95"
      >
        <BsArrowLeft size={18} />
        Kembali ke daftar audit eksternal
      </button>
      {/* HEADER */}
      <div className="bg-slate-800 text-white p-6 rounded-xl mt-1">
        <h1
          onClick={() => setOpenInfo(!openInfo)}
          className="text-xl font-bold cursor-pointer flex justify-between"
        >
          Detail Pemeriksaan
        <div className="flex justify-end">
          <span className={`px-3 py-1 rounded-md text-xs font-bold
            ${data.status === "Selesai"
              ? "bg-green-600"
              : "bg-blue-600"} text-white`}
          >
            {data.status || "Planning"}
          </span>
        </div>
        </h1>
        

        <p
          onClick={() => setOpenInfo(!openInfo)}
          className="text-xs text-slate-300 cursor-pointer"
        >
          Klik untuk melihat detail pemeriksaan
        </p>



        {/* ACCORDION */}
        <div
          className={`transition-all duration-500 overflow-hidden ${
            openInfo ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="grid grid-cols-2 gap-6 text-sm">

            <div className="space-y-2">
              <p><b>Nama Objek Audit :</b> {data.objek_pemeriksaan}</p>
              <p><b>Kegiatan :</b> {data.nama_kegiatan}</p>
              <p><b>Jenis Audit :</b> Audit Eksternal</p>
              <p><b>Lokasi :</b> {data.lokasi || "-"}</p>
              <p>
                <b>Periode Audit :</b>{" "}
                {formatTanggal(data.periode_awal)} s/d{" "}
                {formatTanggal(data.periode_akhir)}
              </p>
            </div>

            <div className="space-y-2">
              <p><b>Tujuan :</b> {data.tujuan || "-"}</p>
              <p><b>Keterangan :</b> {data.keterangan || "-"}</p>
            </div>

          </div>
        </div>
      </div>
      {/* ===================== TEMUAN ===================== */}
<div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-6">
  {/* Header Section */}
  <div className="flex justify-between items-center p-5 bg-slate-50/50 border-b border-slate-200">
    <h2 className="font-bold text-lg text-slate-800">Daftar Temuan</h2>
    <button
      onClick={() => {
  resetForm();
  setOpenModal(true);
}}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-md shadow-blue-100 transition-all active:scale-95"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      Add Temuan
    </button>
  </div>

  {/* Table Section */}
  <div className="overflow-x-auto">
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-slate-800 text-slate-200 uppercase text-[10px] tracking-widest font-bold">
          <th className="p-4 border-r border-slate-700 text-center w-12">No</th>
          <th className="p-4 border-r border-slate-700 text-left">Masalah yang dijumpai</th>
          <th className="p-4 border-r border-slate-700 text-left">Kriteria</th>
          <th className="p-4 border-r border-slate-700 text-left">Sebab</th>
          <th className="p-4 border-r border-slate-700 text-left">Akibat</th>
          <th className="p-4 border-r border-slate-700 text-left">Kondisi</th>
          <th className="p-4 border-r border-slate-700 text-left text-blue-300">Rekomendasi</th>
          <th className="p-4 border-r border-slate-700 text-left text-blue-300">Rencana tindakan perbaikan</th>
          <th className="p-4 border-r border-slate-700 text-left text-blue-300">Keterangan</th>
          <th className="p-4 text-left">status</th>
          <th className="p-4 text-left">aksi</th>
        </tr>
      </thead>
<tbody className="text-slate-700 divide-y divide-slate-200">
  {temuan.length > 0 ? (
    temuan.map((t, i) => (
      <tr key={i} className="hover:bg-blue-50/50 transition-colors group text-[13px]">
        {/* No */}
        <td className="p-4 text-center bg-slate-50/50 group-hover:bg-blue-100/50 font-medium border-r border-slate-100 italic text-slate-500">
          {i + 1}
        </td>

        {/* Masalah */}
        <td className="p-4 border-r border-slate-100 font-semibold text-slate-800">
          {t.masalah}
        </td>

        {/* Kriteria */}
        <td className="p-4 border-r border-slate-100">
          {t.kriteria}
        </td>

        {/* Sebab */}
        <td className="p-4 border-r border-slate-100">
          {t.sebab}
        </td>

        {/* Akibat */}
        <td className="p-4 border-r border-slate-100 text-red-600 font-medium">
          {t.akibat}
        </td>

        {/* Kondisi */}
        <td className="p-4 border-r border-slate-100 italic text-slate-600">
          {t.kondisi}
        </td>

        {/* Rekomendasi */}
        <td className="p-4 border-r border-slate-100 bg-blue-50/30 font-bold text-blue-700 underline decoration-blue-200">
          {t.rekomendasi}
        </td>

        {/* Rencana Tindakan */}
        <td className="p-4 border-r border-slate-100 bg-blue-50/30 text-slate-700">
          {t.rencana}
        </td>

        {/* Keterangan */}
        <td className="p-4 border-r border-slate-100 text-slate-500 text-xs">
          {t.keterangan || "-"}
        </td>

        {/* Status */}
        <td className="p-4 border-r border-slate-100">
<span className={`px-2 py-1 rounded text-[10px] font-black uppercase
  ${t.status === 'monev'
    ? 'bg-green-100 text-green-700'
    : 'bg-gray-100 text-gray-600'}
`}>
{t.status === 'monev' ? 'Monev' : 'Draft'}
          </span>
        </td>

        {/* Aksi */}
        <td className="p-4 text-center">
          <div className="flex items-center gap-2">
            <button 
            onClick={() => handleEdit(t)}
            className="text-blue-600 hover:text-blue-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button 
            onClick={() => handleDelete(t.id)}
            className="text-red-500 hover:text-red-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </div>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="11" className="p-16 text-center text-slate-400 italic">
        <div className="flex flex-col items-center gap-2">
           <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"></path></svg>
           Belum ada data temuan yang diinput
        </div>
      </td>
    </tr>
  )}
</tbody>
    </table>
  </div>
</div>

{openModal && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
    <div 
      className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
      onClick={() => setOpenModal(false)}
    ></div>

    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
      {/* MODAL HEADER */}
      <div className="p-6 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          {isEdit ? "Edit Temuan Audit" : "Input Temuan Audit"}
        </h3>
        <button onClick={() => {
  setOpenModal(false);
  resetForm();
}}
 className="text-slate-400 hover:text-red-500 transition-colors">
          <BsX size={30} />
        </button>
      </div>

      {/* MODAL FORM */}
      <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-white">
        
        <div className="flex flex-col space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Masalah yang dijumpai</label>
          <textarea name="masalah" value={form.masalah || ""} placeholder="Uraian masalah utama..." onChange={handleChange} className="w-full h-20 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 resize-none"/>
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Kondisi</label>
          <textarea name="kondisi" value={form.kondisi || ""} placeholder="Fakta di lapangan..." onChange={handleChange} className="w-full h-20 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 resize-none"/>
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Kriteria</label>
          <input name="kriteria" value={form.kriteria || ""} placeholder="Aturan/Standard yang dilanggar..." onChange={handleChange} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"/>
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Sebab</label>
          <input name="sebab" value={form.sebab || ""} placeholder="Penyebab terjadinya masalah..." onChange={handleChange} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"/>
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Akibat</label>
          <input name="akibat" value={form.akibat || ""} placeholder="Dampak/Kerugian yang timbul..." onChange={handleChange} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-red-600 font-medium"/>
        </div>

                <div className="flex flex-col space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nilai kerugian</label>
          <input type="text"
  name="nilai_kerugian"
  value={formatRupiah(form.nilai_kerugian)}
  onChange={(e) =>
    setForm({
      ...form,
      nilai_kerugian: e.target.value.replace(/\D/g, ""), // 🔥 hanya angka
    })
  }
  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"/>
        </div>


        <div className="flex flex-col space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Rekomendasi</label>
          <input name="rekomendasi" placeholder="Saran perbaikan..." value={form.rekomendasi || ""} onChange={handleChange} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold text-blue-700"/>
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Rencana Tindakan perbaikan</label>
<input 
  name="rencana"
  value={form.rencana || ""}
  placeholder="Langkah konkret auditee..."
  onChange={handleChange}
  className="w-full h-10 px-3 border rounded-lg"
/>        </div>

        <div className="md:col-span-2 flex flex-col space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Keterangan</label>
          <input name="keterangan" value={form.keterangan || ""} placeholder="..." onChange={handleChange} className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"/>
        </div>

                <div className="md:col-span-2 flex flex-col space-y-1">
            <label className="block text-sm font-bold text-slate-500 uppercase mb-1 ml-1">
              Target Selesai
            </label>
            <input
              type="date"
              className="w-full border p-2 rounded"
              value={form.target_penyelesaian || ""}
              onChange={(e) =>
                setForm({ ...form, target_penyelesaian: e.target.value })
              }
            />
        </div>

                <div className="md:col-span-2 flex flex-col space-y-1">
<div className="space-y-2">
  <label className="text-sm font-semibold">Lampiran</label>

  <div className="flex gap-2 text-xs text-gray-500">
    <span className="bg-gray-200 px-2 py-1 rounded">
      Ext : jpg,png,pdf,docx
    </span>

    <span className="bg-gray-200 px-2 py-1 rounded">
      Max size : 5Mb
    </span>
  </div>

  {/* ================== JIKA SUDAH ADA FILE ================== */}
  {existingLampiran && !lheFile ? (
    <div className="flex items-center gap-3">
      <a
        href={`/storage/${existingLampiran}`}
        target="_blank"
        className="text-blue-600 font-medium hover:underline"
      >
        {existingLampiran.split("/").pop()}
      </a>

      <button
        type="button"
        onClick={() => setExistingLampiran(null)}
        className="bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
      >
        ✕
      </button>
    </div>
  ) : (
    /* ================== UPLOAD BOX ================== */
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg h-28 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition"
      onClick={() => document.getElementById("uploadLampiran").click()}
    >
      {lheFile ? (
        <div className="flex items-center gap-2">
          <span className="text-blue-600 font-medium">
            {lheFile.name}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLheFile(null);
            }}
            className="text-red-500 font-bold"
          >
            ✕
          </button>
        </div>
      ) : (
        <span className="text-gray-500">Upload</span>
      )}

      <input
        id="uploadLampiran"
        type="file"
        className="hidden"
        onChange={(e) => setLheFile(e.target.files[0])}
      />
    </div>
  )}
</div>
        </div>

        {/* MODAL FOOTER */}
        <div className="md:col-span-2 flex gap-3 mt-4 border-t pt-6">
          <button 
            onClick={() => {
  setOpenModal(false);
  resetForm();
}}
            className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
          >
            Simpan Temuan
          </button>
        </div>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

const Item = ({ label, value, icon }) => (
  <div>
    <label className="text-[10px] font-bold text-slate-400 uppercase flex gap-1 mb-1">
      {icon} {label}
    </label>
    <div className="text-sm bg-slate-50 border rounded-lg px-3 py-2">
      {value || "-"}
    </div>
  </div>
);

export default ExternalAuditDetail;