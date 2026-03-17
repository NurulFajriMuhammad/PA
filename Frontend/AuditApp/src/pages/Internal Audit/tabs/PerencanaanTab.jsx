import React, { useEffect, useState } from "react";
import apiClient from "../../../../../Shared/api/apiClient";
import { BsX } from "react-icons/bs";

const PerencanaanTab = ({ assurance }) => {
  const [kka, setKka] = useState([]);
  const [docs, setDocs] = useState([]);

  const [showModalKka, setShowModalKka] = useState(false);
  const [showModalDoc, setShowModalDoc] = useState(false);

  const [usersList, setUsersList] = useState([]);
  const [kkaTemplates, setKkaTemplates] = useState([]);

  const [formKka, setFormKka] = useState({
    uraian: "",
    user_id: "",
    no_kka: "",
    anggaran: "",
    keterangan: "",
  });

  const [docFile, setDocFile] = useState(null);
  const [docTitle, setDocTitle] = useState("");

  useEffect(() => {
    if (assurance?.id) {
      fetchKka();
      fetchDocs();
    }

    fetchUsers();
    fetchTemplates();
  }, [assurance]);

  const fetchKka = async () => {
    try {
      const res = await apiClient.get(
        `/api/assurance/${assurance.id}/kka-perencanaan`,
      );
      setKka(res.data.data || []);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchDocs = async () => {
    try {
      const res = await apiClient.get(
        `/api/assurance/${assurance.id}/documents`,
      );
      setDocs(res.data.data || []);
    } catch (e) {
      console.log(e);
    }
  };

  const handleAddKka = () => setShowKkaModal(true);
  const handleAddDoc = () => setShowDocModal(true);

  const handleSaveKka = async (e) => {
    e.preventDefault();

    try {
      await apiClient.post(
        `/api/assurance/${assurance.id}/kka-perencanaan`,
        formKka,
      );

      setShowModalKka(false);

      setFormKka({
        uraian: "",
        user_id: "",
        no_kka: "",
        anggaran: "",
        keterangan: "",
      });

      fetchKka();
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan data");
    }
  };

  const handleUploadDoc = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("judul", docTitle);
    form.append("file", docFile);

    try {
      await apiClient.post(`/api/assurance/${assurance.id}/documents`, form);

      setShowModalDoc(false);
      setDocFile(null);
      setDocTitle("");

      fetchDocs();
    } catch (e) {
      console.error(e);
      alert("Upload gagal");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get("/api/users");
      setUsersList(res.data.data || res.data || []);
    } catch (err) {
      console.error("Users error:", err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await apiClient.get("/api/kka-templates");
      setKkaTemplates(res.data.data || res.data || []);
    } catch (err) {
      console.error("Template error:", err);
    }
  };

  const formatNumber = (value) => {
    const number = value.replace(/\D/g, "");

    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleAnggaranChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");

    setFormKka({
      ...formKka,
      anggaran: raw,
    });
  };

  return (
    <div className="space-y-10">
      {/* ================= KKA ================= */}

<div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
  {/* Header Section */}
  <div className="flex justify-between items-center p-5 bg-slate-50/50 border-b border-slate-200">
    <div className="flex items-center gap-3">
      <div>
        <h2 className="font-bold text-lg text-slate-800">KKA Perencanaan</h2>
      </div>
    </div>

    {/* Group Tombol - Semua Seragam Biru & Bold */}
    <div className="flex items-center gap-3">
      <button
        onClick={() => window.print()}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-md shadow-blue-100 transition-all active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        Print
      </button>

      <button className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-70 text-white text-sm font-bold rounded-lg shadow-md shadow-blue-100 transition-all active:scale-95">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2-2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
        Checklist Perencanaan
      </button>

      <button
        onClick={() => setShowModalKka(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-md shadow-blue-100 transition-all active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Add Data
      </button>
    </div>
  </div>

  {/* Table Section */}
  <div className="overflow-x-auto">
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-slate-800 text-slate-200 uppercase text-[11px] tracking-widest font-bold">
          <th className="p-4 border-r border-slate-700 text-center w-12">No</th>
          <th className="p-4 border-r border-slate-700 text-left">Uraian Tugas / Kegiatan</th>
          <th className="p-4 border-r border-slate-700 text-left text-blue-300">Auditor Pelaksana</th>
          <th className="p-4 border-r border-slate-700 text-left">NO KKA</th>
          <th className="p-4 border-r border-slate-700 text-right">Anggaran (IDR)</th>
          <th className="p-4 text-left">Keterangan</th>
        </tr>
      </thead>

      <tbody className="text-slate-700 divide-y divide-slate-200">
        {kka.length > 0 ? (
          kka.map((item, i) => (
            <tr key={item.id} className="hover:bg-blue-50/50 transition-colors group">
              <td className="p-4 text-center bg-slate-50/50 group-hover:bg-blue-100/50 font-medium border-r border-slate-100">
                {i + 1}
              </td>
              <td className="p-4 font-semibold border-r border-slate-100 leading-relaxed text-slate-800">
                {item.uraian}
              </td>
              <td className="p-4 border-r border-slate-100 text-blue-700 font-bold italic">
                {item.auditor?.name || "Belum Ditunjuk"}
              </td>
              <td className="p-4 border-r border-slate-100 text-center">
                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded shadow-sm text-xs font-mono font-bold">
                  {item.no_kka}
                </span>
              </td>
              <td className="p-4 border-r border-slate-100 text-right font-mono font-bold text-slate-900 bg-slate-50/30 group-hover:bg-transparent">
                {formatCurrency(item.anggaran)}
              </td>
              <td className="p-4 text-slate-500 italic text-xs leading-snug">
                {item.keterangan || "-"}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6" className="p-16 text-center text-slate-400">
              <div className="flex flex-col items-center gap-3">
                <svg className="w-12 h-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"></path>
                </svg>
                <p className="font-semibold text-slate-500 uppercase tracking-widest text-xs">Belum Ada Data KKA Perencanaan</p>
                <button 
                   onClick={() => setShowModalKka(true)}
                   className="text-blue-600 text-xs font-bold hover:underline"
                >
                  + Tambah Data Sekarang
                </button>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>

      {/* ================= DOKUMEN ================= */}

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-bold text-lg">Dokumen Auditee</h2>

<button
  onClick={() => setShowModalDoc(true)}
  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-md shadow-blue-100 transition-all active:scale-95"
>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>

  Upload Dokumen
</button>
        </div>

        <div className="overflow-x-auto">
<table className="w-full text-sm border-collapse">
  <thead>
    <tr className="bg-slate-800 text-slate-200 uppercase text-[11px] tracking-widest font-bold">
      <th className="p-4 border-r border-slate-700 text-center w-12">No</th>
      <th className="p-4 border-r border-slate-700 text-left">Judul Dokumen</th>
      <th className="p-4 border-r border-slate-700 text-center w-32">Tipe File</th>
      <th className="p-4 text-center w-32">Aksi</th>
    </tr>
  </thead>

  <tbody className="text-slate-700 divide-y divide-slate-200">
    {docs.length > 0 ? (
      docs.map((doc, i) => (
        <tr
          key={doc.id}
          className="hover:bg-blue-50/50 transition-colors group"
        >
          <td className="p-4 text-center bg-slate-50/50 group-hover:bg-blue-100/50 font-medium border-r border-slate-100">
            {i + 1}
          </td>

          <td className="p-4 font-semibold border-r border-slate-100 text-slate-800">
            {doc.judul_dokumen}
          </td>

          <td className="p-4 border-r border-slate-100 text-center uppercase text-xs font-bold text-slate-600">
            {doc.file_type}
          </td>

          <td className="p-4 text-center">
            <a
              href={`/storage/${doc.file_path}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded font-semibold hover:bg-blue-200 transition"
            >
              Lihat File
            </a>
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="4" className="p-16 text-center text-slate-400">
          <div className="flex flex-col items-center gap-3">
            <svg
              className="w-12 h-12 text-slate-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25"
              />
            </svg>

            <p className="font-semibold text-slate-500 uppercase tracking-widest text-xs">
              Belum Ada Dokumen Auditee
            </p>

            <button
              onClick={() => setShowModalDoc(true)}
              className="text-blue-600 text-xs font-bold hover:underline"
            >
              + Upload Dokumen
            </button>
          </div>
        </td>
      </tr>
    )}
  </tbody>
</table>
        </div>
      </div>

      {/* ================= MODAL KKA ================= */}
      {showModalKka && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setShowModalKka(false)}
          ></div>

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* HEADER */}
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">
                Input KKA Perencanaan
              </h3>

              <button
                onClick={() => setShowModalKka(false)}
                className="text-slate-400 hover:text-red-500"
              >
                <BsX size={28} />
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSaveKka}
              className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"
            >
              <div className="flex flex-col">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">
                  Uraian
                </label>
                <input
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                  value={formKka.uraian}
                  onChange={(e) =>
                    setFormKka({ ...formKka, uraian: e.target.value })
                  }
                />
              </div>

              <div className="flex flex-col">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">
                  Anggaran
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm"
                  value={formatNumber(formKka.anggaran)}
                  onChange={handleAnggaranChange}
                  placeholder="Contoh: 1.000.000"
                />
              </div>

              <div className="flex flex-col">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">
                  Dilaksanakan Oleh
                </label>
                <select
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm"
                  value={formKka.user_id}
                  onChange={(e) =>
                    setFormKka({ ...formKka, user_id: e.target.value })
                  }
                >
                  <option value="">-- Pilih Auditor --</option>

                  {usersList.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">
                  No KKA
                </label>
                <select
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm"
                  value={formKka.no_kka}
                  onChange={(e) =>
                    setFormKka({ ...formKka, no_kka: e.target.value })
                  }
                >
                  <option value="">-- Pilih Template KKA --</option>

                  {kkaTemplates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 flex flex-col">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">
                  Keterangan
                </label>
                <input
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                  value={formKka.keterangan}
                  onChange={(e) =>
                    setFormKka({ ...formKka, keterangan: e.target.value })
                  }
                />
              </div>

              {/* FOOTER BUTTON */}
              <div className="md:col-span-2 flex gap-3 mt-4 border-t pt-6">
                <button
                  type="button"
                  onClick={() => setShowModalKka(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL DOC ================= */}
      {showModalDoc && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setShowModalDoc(false)}
          ></div>

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">
                Upload Dokumen Auditee
              </h3>

              <button
                onClick={() => setShowModalDoc(false)}
                className="text-slate-400 hover:text-red-500"
              >
                <BsX size={28} />
              </button>
            </div>

            <form onSubmit={handleUploadDoc} className="p-6 space-y-4">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 ml-1">
                  Judul Dokumen
                </label>

                <input
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 ml-1">
                  File Dokumen
                </label>

                <input
                  type="file"
                  className="w-full text-sm"
                  onChange={(e) => setDocFile(e.target.files[0])}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModalDoc(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700"
                >
                  Upload Dokumen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerencanaanTab;
