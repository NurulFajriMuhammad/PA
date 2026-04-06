import React, { useEffect, useState } from "react";
import apiClient from "../../../../../Shared/api/apiClient";
import { BsX, BsTrash, BsPencilSquare } from "react-icons/bs";

const PelaksanaanTab = ({ assurance }) => {
  const [kka, setKka] = useState([]);
  const [selectedKka, setSelectedKka] = useState(null);
  const [showTemuanModal, setShowTemuanModal] = useState(false);
  const [showTambahTemuan, setShowTambahTemuan] = useState(false);
  const [temuan, setTemuan] = useState([]);
  const [lheFile, setLheFile] = useState(null);
  const [existingLhe, setExistingLhe] = useState(null);
  const [editTemuan, setEditTemuan] = useState(null);
  const [existingLampiran, setExistingLampiran] = useState(null);
  const [biaya, setBiaya] = useState([]);
  const [showTambahBiaya, setShowTambahBiaya] = useState(false);
  const [showDetailTemuan, setShowDetailTemuan] = useState(false);
  const [selectedTemuan, setSelectedTemuan] = useState(null);
  const [editBiaya, setEditBiaya] = useState(null);

  const [formTemuan, setFormTemuan] = useState({
    halaman_lhe: "",
    masalah: "",
    rekomendasi: "",
    kondisi: "",
    kriteria: "",
    sebab: "",
    akibat: "",
    klarifikasi_temuan: "",
    area: "",
    referensi: "",
    nilai_kerugian: "",
    keterangan: "",
    lampiran: null,
  });
  const resetFormTemuan = () => {
  setFormTemuan({
    halaman_lhe: "",
    masalah: "",
    rekomendasi: "",
    kondisi: "",
    kriteria: "",
    sebab: "",
    akibat: "",
    klarifikasi_temuan: "",
    area: "",
    referensi: "",
    nilai_kerugian: "",
    keterangan: "",
    lampiran: null,
  });
};

  const [formBiaya, setFormBiaya] = useState({
    kka_id: "",
    nama: "",
    jenis_akomodasi: "",
    nilai_realisasi: "",
  });

  const fetchBiaya = async () => {
    const res = await apiClient.get(`/api/assurance/${assurance.id}/biaya`);
    setBiaya(res.data.data || []);
  };

  useEffect(() => {
    fetchKka();
    fetchBiaya();
  }, [assurance]);

  const fetchKka = async () => {
    const res = await apiClient.get(
      `/api/assurance/${assurance.id}/kka-pelaksanaan`,
    );
    setKka(res.data.data || []);
  };

  const openDetailTemuan = async (item) => {
    setSelectedKka(item);
    setShowTemuanModal(true);

    const res = await apiClient.get(`/api/kka/${item.id}/temuan`);
    setTemuan(res.data.data || []);

    // ambil file LHE
    const lhe = await apiClient.get(`/api/kka/${item.id}/lhe`);
    setExistingLhe(lhe.data.data);
  };

  const handleUploadLHE = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("file", lheFile);

    await apiClient.post(`/api/kka/${selectedKka.id}/upload-lhe`, form);

    alert("File LHE berhasil diupload");

    fetchKka();
  };

  const formatRupiah = (value) => {
    if (!value) return "";

    return new Intl.NumberFormat("id-ID").format(Number(value));
  };

  // const handleSaveTemuan = async (e) => {
  //   e.preventDefault();

  //   const form = new FormData();

  //   Object.keys(formTemuan).forEach((key) => {
  //     if (formTemuan[key] !== null && formTemuan[key] !== "") {
  //       form.append(key, formTemuan[key]);
  //     }
  //   });

  //   if (editTemuan) {
  //     await apiClient.put(`/api/temuan/${editTemuan.id}`, form);
  //   } else {
  //     await apiClient.post(`/api/kka/${selectedKka.id}/temuan`, form);
  //   }

  //   setEditTemuan(null);
  //   setShowTambahTemuan(false);
  //   fetchTemuan();
  // };

  const handleSaveTemuan = async (e) => {
  e.preventDefault();

  const form = new FormData();

  // kirim field selain file dulu
  Object.keys(formTemuan).forEach((key) => {
    const value = formTemuan[key];

    if (value !== null && value !== "" && key !== "lampiran") {
      form.append(key, value);
    }
  });

  // 🔥 WAJIB kirim ini
  form.append("kka_id", selectedKka.id);

  // 🔥 kirim file kalau ada
  if (formTemuan.lampiran) {
    form.append("lampiran", formTemuan.lampiran);
  }

  try {
    if (editTemuan) {
      await apiClient.put(`/api/temuan/${editTemuan.id}`, form);
    } else {
      await apiClient.post(`/api/kka/${selectedKka.id}/temuan`, form);
    }
    
    resetFormTemuan();
    setEditTemuan(null);
    setShowTambahTemuan(false);
    fetchTemuan();

  } catch (err) {
    console.error("ERROR BACKEND:", err.response?.data);
    alert(JSON.stringify(err.response?.data));
  }
};

  const fetchTemuan = async () => {
    const res = await apiClient.get(`/api/kka/${selectedKka.id}/temuan`);
    setTemuan(res.data.data || []);
  };

  const closeModal = () => {
    setShowTemuanModal(false);
    fetchKka();
  };

  const handleDeleteLhe = async () => {
    if (!confirm("Hapus file LHE?")) return;

    await apiClient.delete(`/api/kka/${selectedKka.id}/lhe`);

    setExistingLhe(null);

    fetchKka();
  };

  const handleSaveBiaya = async (e) => {
    e.preventDefault();

    try {
      if (editBiaya) {
        await apiClient.put(`/api/biaya/${editBiaya.id}`, formBiaya);
      } else {
        await apiClient.post(`/api/biaya`, formBiaya);
      }

      setShowTambahBiaya(false);
      setEditBiaya(null);

      setFormBiaya({
        kka_id: "",
        nama: "",
        jenis_akomodasi: "",
        nilai_realisasi: "",
      });

      fetchBiaya();
    } catch (err) {
      console.error(err);
      alert("Gagal simpan biaya");
    }
  };

  const handleDeleteTemuan = async (id) => {
    if (!confirm("Hapus temuan?")) return;

    await apiClient.delete(`/api/temuan/${id}`);
    fetchTemuan();
  };

  const handleDeleteBiaya = async (id) => {
    if (!confirm("Hapus biaya?")) return;

    await apiClient.delete(`/api/biaya/${id}`);
    fetchBiaya();
  };

  const jenisAkomodasiList = [
    "transportasi_darat",
    "transportasi_udara",
    "transportasi_laut",
    "penginapan",
    "konsumsi",
    "uang_harian",
    "sewa_kendaraan",
    "bbm",
    "toll_parkir",
    "atk",
    "cetak_dokumen",
    "jasa_profesional",
    "lainnya",
  ];

  return (
    <div className="space-y-6">
      {/* ====================== DAFTAR PEMERIKSAAN ====================== */}

      <div className="bg-white rounded-xl overflow-hidden">
        <div className="p-4 border-b font-bold flex items-center justify-between">
          {/* Bagian Kiri: Judul */}
          <span className="font-bold text-lg text-slate-800">
            Daftar Pemeriksaan
          </span>

          {/* Bagian Kanan: Container Tombol */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-bold rounded-lg shadow-md transition-all active:scale-95">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2-2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              Checklist Penyelesian
            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-lg shadow-md transition-all active:scale-95">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2-2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              Checklist Penyelesian Laporan
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="p-3">No</th>
                <th className="p-3">Uraian</th>
                <th className="p-3">Dilaksanakan Oleh</th>
                <th className="p-3">No KKA</th>
                <th className="p-3">File LHE</th>
                <th className="p-3">Jumlah Temuan</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {kka.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-3 text-center font-medium">{item.id}</td>
                  <td className="p-3">{item.uraian}</td>
                  <td className="p-3 text-blue-600 font-semibold">
                    {item.auditor?.name}
                  </td>

                  <td className="p-3 text-center">
                    <span className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">
                      {item.no_kka}
                    </span>
                  </td>

                  <td className="p-3 text-blue-600 text-center">
                    {item.lhe_file?.file_name || "-"}
                  </td>

                  <td className="p-3 text-center">{item.temuan_count || 0}</td>

                  <td className="p-3 text-center">
                    <button
                      onClick={() => openDetailTemuan(item)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold"
                    >
                      + Detail Temuan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====================== MODAL DETAIL TEMUAN ====================== */}

      {showTemuanModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeModal}
          ></div>

          <div className="relative bg-white rounded-xl shadow-xl w-[1100px] max-h-[90vh] overflow-y-auto">
            {/* HEADER */}

            <div className="p-5 border-b flex justify-between">
              <div>
                <h2 className="font-bold text-lg">File LHE</h2>

                <p className="text-sm text-gray-500">
                  Upload file LHE sebelum mengisi item temuan
                </p>
              </div>

              <button onClick={closeModal}>
                <BsX size={28} />
              </button>
            </div>

            {/* ================= UPLOAD LHE ================= */}

            <div className="p-5 border-b">
              <form onSubmit={handleUploadLHE} className="space-y-3">
                <label className="text-sm font-semibold">
                  Lampiran<span className="text-red-500">*</span>
                </label>

                <div className="flex gap-2 text-xs text-gray-500">
                  <span className="bg-gray-200 px-2 py-1 rounded">
                    Ext : gif,jpg,jpeg,bmp,png,pdf,xlsx,doc,docx
                  </span>

                  <span className="bg-gray-200 px-2 py-1 rounded">
                    Max size per file : 5Mb
                  </span>
                </div>

                {/* Jika file sudah ada */}

                {existingLhe ? (
                  <div className="flex items-center gap-3">
                    <a
                      href={`/storage/${existingLhe.file_path}`}
                      target="_blank"
                      className="text-blue-600 font-medium hover:underline"
                    >
                      {existingLhe.file_name}
                    </a>

                    <button
                      type="button"
                      onClick={handleDeleteLhe}
                      className="bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg h-28 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => document.getElementById("uploadLhe").click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      setLheFile(e.dataTransfer.files[0]);
                    }}
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
                      id="uploadLhe"
                      type="file"
                      className="hidden"
                      onChange={(e) => setLheFile(e.target.files[0])}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold"
                >
                  Upload
                </button>
              </form>
            </div>

            {/* ================= TEMUAN ================= */}

            <div className="p-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold">Temuan</h3>

                <button
                  onClick={() => setShowTambahTemuan(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold"
                >
                  + Add Data
                </button>
              </div>

              <table className="w-full text-sm border border-black-300">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="p-3 text-center border-r border-black-300">
                      No
                    </th>

                    <th className="p-3 text-center border-r border-black-300">
                      Halaman LHE
                    </th>

                    <th className="p-3 text-center border-r border-black-300">
                      Masalah Yang Dijumpai
                    </th>

                    <th className="p-3 text-center border-r border-black-300">
                      Rekomendasi
                    </th>

                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {temuan.map((t, i) => (
                    <tr key={t.id} className="border-t border-black-300">
                      <td className="p-3 text-center border-r border-black-300">
                        {i + 1}
                      </td>

                      <td className="p-3 text-center border-r border-black-300">
                        {t.halaman_lhe}
                      </td>

                      <td className="p-3 text-center border-r border-black-300 text-blue-600">
                        <button
                          onClick={() => {
                            setSelectedTemuan(t);
                            setShowDetailTemuan(true);
                          }}
                          className="text-blue-600 hover:underline font-semibold"
                        >
                          {t.masalah}
                        </button>
                      </td>

                      <td className="p-3 text-center border-r border-black-300">
                        {t.rekomendasi}
                      </td>

                      <td className="p-3 flex justify-center gap-3">
                        <button
                          onClick={() => {
                            setEditTemuan(t);
                            setFormTemuan({
                              ...t,
                              lampiran: null, // reset file input
                            });
                            setExistingLampiran(t.lampiran); // simpan file lama
                            setShowTambahTemuan(true);
                          }}
                          className="text-yellow-500 hover:text-yellow-600"
                        >
                          <BsPencilSquare />
                        </button>

                        <button
                          onClick={() => handleDeleteTemuan(t.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <BsTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ====================== MODAL TAMBAH TEMUAN ====================== */}

      {showTambahTemuan && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/40"
            // onClick={() => setShowTambahTemuan(false)}
             onClick={() => {
    resetFormTemuan(); // 🔥 TAMBAH INI
    setShowTambahTemuan(false);
  }}
          ></div>

          {/* MODAL */}
          <div className="relative bg-white w-[900px] rounded-xl shadow-xl max-h-[90vh] flex flex-col">
            {/* HEADER */}
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="font-bold text-lg">
                {editTemuan ? "Edit Temuan" : "Tambah Temuan"}
              </h3>

              <button
                 onClick={() => {
    resetFormTemuan(); // 🔥 TAMBAH INI
    setShowTambahTemuan(false);
  }}
                className="text-gray-500 hover:text-red-500 text-xl"
              >
                ✕
              </button>
            </div>

            {/* BODY */}
            <form
              onSubmit={handleSaveTemuan}
              className="px-6 py-4 overflow-y-auto space-y-4 flex-1"
            >
              {/* HALAMAN LHE */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Halaman LHE
                </label>

                {/* <input
                  value={formTemuan.halaman_lhe || ""}
                  className="w-full border p-2 rounded"
                  onChange={(e) =>
                    setFormTemuan({
                      ...formTemuan,
                      halaman_lhe: e.target.value,
                    })
                  }
                /> */}

                <input
  type="number"
  value={formTemuan.halaman_lhe || ""}
  className="w-full border p-2 rounded"
  onChange={(e) =>
    setFormTemuan({
      ...formTemuan,
      halaman_lhe: e.target.value.replace(/\D/g, ""),
    })
  }
/>
              </div>

              {/* MASALAH */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Masalah Yang Dijumpai
                </label>

                <textarea
                  rows={3}
                  className="w-full border p-2 rounded"
                  value={formTemuan.masalah || ""}
                  onChange={(e) =>
                    setFormTemuan({
                      ...formTemuan,
                      masalah: e.target.value,
                    })
                  }
                />
              </div>

              {/* KONDISI */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Kondisi
                </label>

                <textarea
                  rows={3}
                  className="w-full border p-2 rounded"
                  value={formTemuan.kondisi || ""}
                  onChange={(e) =>
                    setFormTemuan({
                      ...formTemuan,
                      kondisi: e.target.value,
                    })
                  }
                />
              </div>

              {/* KRITERIA */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Kriteria
                </label>

                <textarea
                  rows={3}
                  className="w-full border p-2 rounded"
                  value={formTemuan.kriteria || ""}
                  onChange={(e) =>
                    setFormTemuan({
                      ...formTemuan,
                      kriteria: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Sebab</label>
                <textarea
                  className="w-full border p-2 rounded"
                  value={formTemuan.sebab || ""}
                  onChange={(e) =>
                    setFormTemuan({ ...formTemuan, sebab: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Akibat</label>
                <textarea
                  className="w-full border p-2 rounded"
                  value={formTemuan.akibat || ""}
                  onChange={(e) =>
                    setFormTemuan({ ...formTemuan, akibat: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Klarifikasi Temuan
                </label>
                <textarea
                  className="w-full border p-2 rounded"
                  value={formTemuan.klarifikasi_temuan || ""}
                  onChange={(e) =>
                    setFormTemuan({
                      ...formTemuan,
                      klarifikasi_temuan: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Area</label>
                <input
                  className="w-full border p-2 rounded"
                  value={formTemuan.area || ""}
                  onChange={(e) =>
                    setFormTemuan({
                      ...formTemuan,
                      area: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Referensi
                </label>
                <input
                  className="w-full border p-2 rounded"
                  value={formTemuan.referensi || ""}
                  onChange={(e) =>
                    setFormTemuan({
                      ...formTemuan,
                      referensi: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nilai Kerugian
                </label>
                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  value={formatRupiah(formTemuan.nilai_kerugian)}
                  onChange={(e) =>
                    setFormTemuan({
                      ...formTemuan,
                      nilai_kerugian: e.target.value.replace(/\D/g, ""),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Rekomendasi
                </label>
                <textarea
                  className="w-full border p-2 rounded"
                  value={formTemuan.rekomendasi || ""}
                  onChange={(e) =>
                    setFormTemuan({
                      ...formTemuan,
                      rekomendasi: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Keterangan
                </label>
                <textarea
                  className="w-full border p-2 rounded"
                  value={formTemuan.keterangan || ""}
                  onChange={(e) =>
                    setFormTemuan({
                      ...formTemuan,
                      keterangan: e.target.value,
                    })
                  }
                />
              </div>

              {/* LAMPIRAN */}
<div className="space-y-2">
  <label className="text-sm font-semibold">Lampiran</label>

  <div className="flex gap-2 text-xs text-gray-500">
    <span className="bg-gray-200 px-2 py-1 rounded">
      Ext : gif,jpg,png,pdf,docx
    </span>

    <span className="bg-gray-200 px-2 py-1 rounded">
      Max size : 5Mb
    </span>
  </div>

  {/* LABEL JADI TRIGGER */}
  <label
    htmlFor="lampiranUpload"
    // className="flex gap-3 pt-4 border-t relative z-10 bg-white"
    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center 
              cursor-pointer bg-gary-50 hover:bg-gray-50 transition block"
    // className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center bg-gray-50 hover:bg-gray-100 transition"
  >
    {/* FILE LAMA */}
    {existingLampiran && !formTemuan.lampiran && (
      <div className="flex items-center justify-center gap-2">
        <a
          href={`/storage/${existingLampiran}`}
          target="_blank"
          className="text-blue-600 underline"
        >
          Lihat Lampiran
        </a>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault(); // 🔥 penting biar ga trigger upload
            setExistingLampiran(null);
          }}
          className="bg-red-500 hover:bg-red-600 text-white 
          rounded-full w-6 h-6 flex items-center justify-center text-xs"
        >
          ✕
        </button>
      </div>
    )}

    {/* FILE BARU */}
    {formTemuan.lampiran && (
      <div className="flex items-center justify-center gap-2">
        <span className="text-blue-600">
          {formTemuan.lampiran.name}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setFormTemuan({ ...formTemuan, lampiran: null });
          }}
          className="bg-red-500 hover:bg-red-600 text-white 
          rounded-full w-6 h-6 flex items-center justify-center text-xs"
        >
          ✕
        </button>
      </div>
    )}

    {/* EMPTY */}
    {!existingLampiran && !formTemuan.lampiran && (
      <span className="text-gray-500">
        Klik untuk upload lampiran
      </span>
    )}
  </label>

  {/* INPUT */}
  <input
    id="lampiranUpload"
    type="file"
    className="hidden"
    onChange={(e) =>
      setFormTemuan({
        ...formTemuan,
        lampiran: e.target.files[0],
      })
    }
  />
</div>

              {/* FOOTER BUTTON */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowTambahTemuan(false)}
                  className="flex-1 bg-red-600 text-white py-2 rounded font-bold"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded font-bold"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailTemuan && selectedTemuan && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowDetailTemuan(false)}
          ></div>

          {/* MODAL */}
          <div className="relative bg-white w-[800px] rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
            {/* HEADER */}
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="font-bold text-lg">Detail Temuan</h3>

              <button
                onClick={() => setShowDetailTemuan(false)}
                className="text-gray-500 hover:text-red-500 text-xl"
              >
                ✕
              </button>
            </div>

            {/* CONTENT */}
            <div className="p-6 space-y-4 text-sm">
              <div>
                <b>Halaman LHE:</b>
                <div>{selectedTemuan.halaman_lhe || "-"}</div>
              </div>

              <div>
                <b>Masalah:</b>
                <div>{selectedTemuan.masalah || "-"}</div>
              </div>

              <div>
                <b>Kondisi:</b>
                <div>{selectedTemuan.kondisi || "-"}</div>
              </div>

              <div>
                <b>Kriteria:</b>
                <div>{selectedTemuan.kriteria || "-"}</div>
              </div>

              <div>
                <b>Sebab:</b>
                <div>{selectedTemuan.sebab || "-"}</div>
              </div>

              <div>
                <b>Akibat:</b>
                <div>{selectedTemuan.akibat || "-"}</div>
              </div>

              <div>
                <b>Klarifikasi Temuan:</b>
                <div>{selectedTemuan.klarifikasi_temuan || "-"}</div>
              </div>

              <div>
                <b>Area:</b>
                <div>{selectedTemuan.area || "-"}</div>
              </div>

              <div>
                <b>Referensi:</b>
                <div>{selectedTemuan.referensi || "-"}</div>
              </div>

              <div>
                <b>Nilai Kerugian:</b>
                <div>
                  {selectedTemuan.nilai_kerugian
                    ? Number(selectedTemuan.nilai_kerugian).toLocaleString(
                        "id-ID",
                      )
                    : "-"}
                </div>
              </div>

              <div>
                <b>Rekomendasi:</b>
                <div>{selectedTemuan.rekomendasi || "-"}</div>
              </div>

              <div>
                <b>Keterangan:</b>
                <div>{selectedTemuan.keterangan || "-"}</div>
              </div>

              {/* LAMPIRAN */}
              <div>
                <b>Lampiran:</b>
                <div>
                  {selectedTemuan.lampiran ? (
                    <a
                      href={`/storage/${selectedTemuan.lampiran}`}
                      target="_blank"
                      className="text-blue-600 underline"
                    >
                      Lihat Lampiran
                    </a>
                  ) : (
                    "-"
                  )}
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => setShowDetailTemuan(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================== BIAYA ====================== */}

      <div className="bg-white rounded-xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-bold text-lg text-slate-800">Biaya</h3>

          <button
            onClick={() => setShowTambahBiaya(true)}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            + Add Data
          </button>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="p-3">Nama</th>
              <th className="p-3">Jenis Akomodasi</th>
              <th className="p-3">Anggaran</th>
              <th className="p-3">Nilai Realisasi</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {kka.map((item) => {
              const detail = biaya.filter((b) => b.kka_id === item.id);

              const total = detail.reduce(
                (sum, d) => sum + Number(d.nilai_realisasi),
                0,
              );

              return (
                <React.Fragment key={item.id}>
                  {/* HEADER GROUP */}

                  <tr className="bg-gray-100 font-bold">
                    <td className="p-3">{item.uraian}</td>

                    <td></td>

                    <td className="p-3 text-center">
                      {formatRupiah(item.anggaran)}
                    </td>

                    <td className="p-3 text-center">{formatRupiah(total)}</td>

                    <td></td>
                  </tr>

                  {/* DETAIL */}

                  {detail.map((d) => (
                    <tr key={d.id}>
                      <td className="p-3 pl-8">{d.nama}</td>
                      <td className="p-3 text-center">{d.jenis_akomodasi}</td>
                      <td></td>
                      <td className="p-3 text-center">
                        {formatRupiah(d.nilai_realisasi)}
                      </td>
                      <td className="p-3 flex gap-2 justify-center">
                        <button
                          onClick={() => {
                            setEditBiaya(d);
                            setFormBiaya({
                              ...d,
                              nilai_realisasi: d.nilai_realisasi.toString(),
                            });
                            setShowTambahBiaya(true);
                          }}
                          className="text-yellow-500"
                        >
                          <BsPencilSquare />
                        </button>

                        <button
                          onClick={() => handleDeleteBiaya(d.id)}
                          className="text-red-500"
                        >
                          <BsTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {showTambahBiaya && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowTambahBiaya(false)}
          ></div>

          <div className="bg-white w-[500px] rounded-xl shadow-xl p-6 relative">
            <h3 className="font-bold mb-4">
              {editBiaya ? "Edit Biaya" : "Tambah Biaya"}
            </h3>

            <form onSubmit={handleSaveBiaya} className="space-y-4">
              {/* URAIAN */}

              <div>
                <label className="text-sm font-medium">
                  Uraian Pemeriksaan
                </label>

                <select
                  className="w-full border p-2 rounded"
                  onChange={(e) =>
                    setFormBiaya({
                      ...formBiaya,
                      kka_id: e.target.value,
                    })
                  }
                >
                  <option value="">Pilih</option>

                  {kka.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.uraian}
                    </option>
                  ))}
                </select>
              </div>

              {/* NAMA */}

              <div>
                <label className="text-sm font-medium">Nama</label>

                <input
                  className="w-full border p-2 rounded"
                  onChange={(e) =>
                    setFormBiaya({
                      ...formBiaya,
                      nama: e.target.value,
                    })
                  }
                />
              </div>

              {/* JENIS AKOMODASI */}

              <div>
                <label className="text-sm font-medium">Jenis Akomodasi</label>

                <select
                  className="w-full border p-2 rounded"
                  value={formBiaya.jenis_akomodasi}
                  onChange={(e) =>
                    setFormBiaya({
                      ...formBiaya,
                      jenis_akomodasi: e.target.value,
                    })
                  }
                >
                  <option value="">Pilih Jenis</option>

                  {jenisAkomodasiList.map((item) => (
                    <option key={item} value={item}>
                      {item.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* NILAI */}

              <div>
                <label className="text-sm font-medium">Nilai Realisasi</label>

                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  value={formatRupiah(formBiaya.nilai_realisasi)}
                  onChange={(e) =>
                    setFormBiaya({
                      ...formBiaya,
                      nilai_realisasi: e.target.value.replace(/\D/g, ""),
                    })
                  }
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTambahBiaya(false)}
                  className="flex-1 bg-gray-200 py-2 rounded"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PelaksanaanTab;
