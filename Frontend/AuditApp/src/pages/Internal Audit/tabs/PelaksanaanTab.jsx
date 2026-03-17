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

  const [formTemuan, setFormTemuan] = useState({
    halaman_lhe: "",
    masalah: "",
    rekomendasi: "",
    kondisi: "",
    kriteria: "",
    sebab: "",
    akibat: "",
    klarifikasi: "",
    area: "",
    referensi: "",
    nilai_kerugian: "",
    keterangan: "",
    lampiran: null,
  });

  const [biaya, setBiaya] = useState([]);
  const [showTambahBiaya, setShowTambahBiaya] = useState(false);

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

  const handleSaveTemuan = async (e) => {
    e.preventDefault();

    const form = new FormData();

    Object.keys(formTemuan).forEach((key) => {
      form.append(key, formTemuan[key]);
    });

    await apiClient.post(`/api/kka/${selectedKka.id}/temuan`, form);

    setShowTambahTemuan(false);
    fetchTemuan();
    fetchKka();
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
  e.preventDefault(); // 🚨 WAJIB

  try {
    await apiClient.post(`/api/biaya`, formBiaya);
    setShowTambahBiaya(false);

    // reset form
    setFormBiaya({
      kka_id: "",
      nama: "",
      jenis_akomodasi: "",
      nilai_realisasi: "",
    });

    fetchBiaya(); // refresh tabel
  } catch (err) {
    console.error(err);
    alert("Gagal simpan biaya");
  }
};

  return (
    <div className="space-y-6">
      {/* ====================== DAFTAR PEMERIKSAAN ====================== */}

      <div className="bg-white rounded-xl overflow-hidden">
        <div className="p-4 border-b font-bold">Daftar Pemeriksaan</div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-white">
              <tr>
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
                  <td className="p-3">{item.uraian}</td>
                  <td className="p-3 text-blue-600 font-semibold">
                    {item.auditor?.name}
                  </td>

                  <td className="p-3">
                    <span className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">
                      {item.no_kka}
                    </span>
                  </td>

                  <td className="p-3 text-blue-600">
                    {item.lhe_file?.file_name || "-"}
                  </td>

                  <td className="p-3">{item.temuan_count || 0}</td>

                  <td className="p-3">
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
                        {t.masalah}
                      </td>

                      <td className="p-3 text-center border-r border-black-300">
                        {t.rekomendasi}
                      </td>

                      <td className="p-3 flex justify-center gap-3">
                        <button className="text-yellow-500 hover:text-yellow-600">
                          <BsPencilSquare />
                        </button>

                        <button className="text-red-500 hover:text-red-600">
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
            onClick={() => setShowTambahTemuan(false)}
          ></div>

          {/* MODAL */}
          <div className="relative bg-white w-[900px] rounded-xl shadow-xl max-h-[90vh] flex flex-col">
            {/* HEADER */}
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="font-bold text-lg">Tambah Temuan</h3>

              <button
                onClick={() => setShowTambahTemuan(false)}
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

                <input
                  className="w-full border p-2 rounded"
                  onChange={(e) =>
                    setFormTemuan({
                      ...formTemuan,
                      halaman_lhe: e.target.value,
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
                  onChange={(e) =>
                    setFormTemuan({
                      ...formTemuan,
                      kriteria: e.target.value,
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

                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg h-24 flex items-center justify-center cursor-pointer hover:bg-gray-50"
                  onClick={() =>
                    document.getElementById("uploadTemuan").click()
                  }
                >
                  {formTemuan.lampiran ? (
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">
                        {formTemuan.lampiran.name}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormTemuan({
                            ...formTemuan,
                            lampiran: null,
                          });
                        }}
                        className="text-red-500"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-500">Upload Lampiran</span>
                  )}

                  <input
                    id="uploadTemuan"
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

      {/* ====================== BIAYA ====================== */}

      <div className="bg-white rounded-xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-bold">Biaya</h3>

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

                    <td className="p-3">
                      {Number(item.anggaran).toLocaleString()}
                    </td>

                    <td className="p-3">{total.toLocaleString()}</td>

                    <td></td>
                  </tr>

                  {/* DETAIL */}

                  {detail.map((d) => (
                    <tr key={d.id}>
                      <td className="p-3 pl-8">{d.nama}</td>

                      <td className="p-3">{d.jenis_akomodasi}</td>

                      <td></td>

                      <td className="p-3">
                        {Number(d.nilai_realisasi).toLocaleString()}
                      </td>

                      <td className="p-3 flex gap-2">
                        <button className="text-yellow-500">
                          <BsPencilSquare />
                        </button>

                        <button className="text-red-500">
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
            <h3 className="font-bold mb-4">Tambah Biaya</h3>

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
                  value={formBiaya.jenis_akomodasi}
                  onChange={(e) =>
                    setFormBiaya({
                      ...formBiaya,
                      jenis_akomodasi: e.target.value,
                    })
                  }
                >
                  <option>transportasi</option>
                  <option>konsumsi</option>
                  <option>penginapan</option>
                  <option>lainnya</option>
                </select>
              </div>

              {/* NILAI */}

              <div>
                <label className="text-sm font-medium">Nilai Realisasi</label>

                <input
                  type="number"
                  className="w-full border p-2 rounded"
                  onChange={(e) =>
                    setFormBiaya({
                      ...formBiaya,
                      nilai_realisasi: e.target.value,
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
