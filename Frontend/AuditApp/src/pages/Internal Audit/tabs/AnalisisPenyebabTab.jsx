import React, { useEffect, useState } from "react";
import apiClient from "../../../../../Shared/api/apiClient";
import { ArrowLeft, ArrowRight } from "lucide-react";

const AnalisisTab = ({ assurance }) => {
  const [data, setData] = useState([]);
  const [selectedTemuan, setSelectedTemuan] = useState(null);
  const [lampiranFile, setLampiranFile] = useState(null);

  const [form, setForm] = useState({});

  const fetchAnalisis = async () => {
    try {
      const res = await apiClient.get(
        `/api/assurance/${assurance.id}/kka-pelaksanaan`,
      );

      let allTemuan = [];

res.data.data.forEach((kka) => {
  (kka.temuan || []).forEach((t) => {
    let status = "belum";

    if (t.analisis) {
      status = t.analisis.status === "close" ? "close" : "draft";
    }

    allTemuan.push({
      ...t,
      analisis: t.analisis || null,
      status_analisis: status,
    });
  });
});

      setData(allTemuan);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAnalisis();
  }, [assurance]);

  const handleSave = async () => {
    try {
      if (
        selectedTemuan?.status_analisis === "close" ||
        selectedTemuan?.analisis?.status === "close"
      ) {
        return;
      }

      const formData = new FormData();
      const cleanedForm = {
        status: form.status,
        tanggapan: form.tanggapan,
        analisa: form.analisa,
        rencana_koreksi: form.rencana_koreksi,
        rencana_kolektif: form.rencana_kolektif,
        target_penyelesaian: form.target_penyelesaian,
        feedback: form.feedback,
        lampiran: form.lampiran,
      };

      Object.keys(cleanedForm).forEach((key) => {
        formData.append(key, cleanedForm[key] ?? "");
      });

      // Object.keys(form).forEach((key) => {
      //   formData.append(key, form[key]);
      // });
      // Object.keys(form).forEach((key) => {
      //   formData.append(key, form[key] ?? "");
      // });

      await apiClient.post(
        `/api/temuan/${selectedTemuan.id}/analisis`,
        formData,
      );

      alert("Berhasil disimpan");
      await fetchAnalisis();
      // setSelectedTemuan(null);
      await handleSelectTemuan(selectedTemuan);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectTemuan = (item) => {
    const data = item.analisis || {};

    setSelectedTemuan(item);

    setForm({
      status: data.status || "",
      tanggapan: data.tanggapan || "",
      analisa: data.analisa || "",
      rencana_koreksi: data.rencana_koreksi || "",
      rencana_kolektif: data.rencana_kolektif || "",
      target_penyelesaian: data.target_penyelesaian || "",
      feedback: data.feedback || "",
      lampiran: null,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setLampiranFile(file);

    setForm({
      ...form,
      lampiran: file,
    });
  };

  const handleRemoveFile = () => {
    setLampiranFile(null);
    setForm({
      ...form,
      lampiran: null,
    });
  };

  const handleKirimTindakLanjut = async () => {
    try {
      // ambil hanya yang draft
      const draftTemuan = data.filter(
        (item) => item.status_analisis === "draft"
      );

      if (draftTemuan.length === 0) {
        alert("Tidak ada temuan draft");
        return;
      }

      await apiClient.post("/api/tindak-lanjut/generate", {
        temuan_ids: draftTemuan.map((t) => t.id),
      });

      alert("Berhasil dikirim ke Tindak Lanjut 🚀");

    } catch (err) {
      console.error(err);
    }
  };

  // ============================
  // 🔵 MODE DETAIL
  // ============================
  if (selectedTemuan) {
    const isClosed =
      selectedTemuan.status_analisis === "close" ||
      selectedTemuan.analisis?.status === "close";

    return (
      <div className="bg-white p-6 rounded-xl shadow border space-y-4">
        <button
          onClick={() => setSelectedTemuan(null)}
          className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-900 text-white text-sm font-bold rounded-lg shadow-md shadow-red-100 transition-all active:scale-95"
        >
          <ArrowLeft size={18} />
          Kembali
        </button>

        <h2 className="font-bold text-lg">Masalah yang Dijumpai</h2>

        <p>{selectedTemuan.masalah}</p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <b>Kondisi</b>
            <p>{selectedTemuan.kondisi}</p>
          </div>
          <div>
            <b>Kriteria</b>
            <p>{selectedTemuan.kriteria}</p>
          </div>
          <div>
            <b>Sebab</b>
            <p>{selectedTemuan.sebab}</p>
          </div>
          <div>
            <b>Akibat</b>
            <p>{selectedTemuan.akibat}</p>
          </div>
          <div>
            <b>Rekomendasi</b>
            <p>{selectedTemuan.rekomendasi}</p>
          </div>
          <div>
            <b>Lampiran</b>
            <p>
              {selectedTemuan.analisis?.lampiran || selectedTemuan.lampiran ? (
                <a
                  href={`/storage/${selectedTemuan.analisis?.lampiran || selectedTemuan.lampiran}`}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  {selectedTemuan.analisis?.lampiran_name
                    ? selectedTemuan.analisis.lampiran_name
                    : selectedTemuan.lampiran.split("/").pop()}
                </a>
              ) : (
                "-"
              )}
            </p>
          </div>
        </div>

        {/* STATUS */}
        <div className="bg-yellow-50 p-4 rounded">
          <label>Status</label>
          <select
            className="w-full border p-2 rounded"
            value={form.status || ""}
            disabled={isClosed}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="">Pilih</option>
            <option value="draft">Draft Temuan</option>
            <option value="close">Close</option>
          </select>
        </div>

        {/* TANGGAPAN */}
        <div>
          <label className="font-semibold">Berikan Tanggapan</label>

          <div className="flex gap-6 mt-2">
            {/* SETUJU */}
            <label className="flex items-center gap-2 cursor-pointer">
              {/* <input
        type="radio"
        name="tanggapan"
        value="setuju"
        checked={form.tanggapan === "setuju"}
        onChange={(e) =>
          setForm({ ...form, tanggapan: e.target.value })
        }
      /> */}
              <input
                type="radio"
                name="tanggapan"
                value="setuju"
                checked={form.tanggapan === "setuju"}
                disabled={isClosed}
                onChange={(e) =>
                  setForm({ ...form, tanggapan: e.target.value })
                }
                className="accent-blue-600 w-4 h-4"
              />
              <span>Setuju</span>
            </label>

            {/* TOLAK */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tanggapan"
                value="tolak"
                checked={form.tanggapan === "tolak"}
                disabled={isClosed}
                onChange={(e) =>
                  setForm({ ...form, tanggapan: e.target.value })
                }
              />
              <span>Tolak</span>
            </label>
          </div>
        </div>

        {/* SETUJU */}
        {form.tanggapan === "setuju" && (
          <>
            <label className="block text-sm font-bold text-slate-500 uppercase mb-1 ml-1">
              Analisa Penyebab
            </label>
            <textarea
              placeholder="Analisa Penyebab"
              className="w-full border p-2 rounded"
              value={form.analisa || ""}
              disabled={isClosed}
              onChange={(e) => setForm({ ...form, analisa: e.target.value })}
            />

            <label className="block text-sm font-bold text-slate-500 uppercase mb-1 ml-1">
              Rencana Tindakan Koreksi
            </label>
            <textarea
              placeholder="Rencana Tindakan Koreksi"
              className="w-full border p-2 rounded"
              value={form.rencana_koreksi || ""}
              disabled={isClosed}
              onChange={(e) =>
                setForm({ ...form, rencana_koreksi: e.target.value })
              }
            />
            <label className="block text-sm font-bold text-slate-500 uppercase mb-1 ml-1">
              Rencana Tindakan Kolektif
            </label>
            <textarea
              placeholder="Rencana Tindakan Kolektif"
              className="w-full border p-2 rounded"
              value={form.rencana_kolektif || ""}
              disabled={isClosed}
              onChange={(e) =>
                setForm({ ...form, rencana_kolektif: e.target.value })
              }
            />
            <label className="block text-sm font-bold text-slate-500 uppercase mb-1 ml-1">
              Target Selesai
            </label>
            <input
              type="date"
              className="w-full border p-2 rounded"
              value={form.target_penyelesaian || ""}
              disabled={isClosed}
              onChange={(e) =>
                setForm({ ...form, target_penyelesaian: e.target.value })
              }
            />
          </>
        )}

        {/* TOLAK */}
        {form.tanggapan === "tolak" && (
          <>
            <label className="block text-sm font-bold text-slate-500 uppercase mb-1 ml-1">
              Tanggapan / Alasan Penolakan
            </label>
            <textarea
              placeholder="Tanggapan"
              className="w-full border p-2 rounded"
              disabled={isClosed}
              onChange={(e) => setForm({ ...form, feedback: e.target.value })}
            />
            {/* <input
              type="file"
              onChange={(e) =>
                setForm({ ...form, lampiran: e.target.files[0] })
              }
            /> */}

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 uppercase">
                Lampiran Bukti
              </label>

              <div className="flex items-center gap-3">
                {/* INPUT HIDDEN */}
                <input
                  type="file"
                  id="lampiran"
                  className="hidden"
                  disabled={isClosed}
                  onChange={handleFileChange}
                />

                {/* BUTTON PILIH FILE */}
                <label
                  htmlFor="lampiran"
                  className={`px-4 py-2 text-white text-sm rounded-lg ${isClosed ? "bg-slate-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 cursor-pointer"}`}
                >
                  Pilih File
                </label>

                {/* NAMA FILE */}
                {lampiranFile && (
                  <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg">
                    <span className="text-sm text-slate-700">
                      {lampiranFile.name}
                    </span>

                    {/* HAPUS */}
                    <button
                      onClick={handleRemoveFile}
                      className="text-red-500 hover:text-red-700 text-sm font-bold"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-400">
                Max size: 5MB (pdf, doc, docx, png, jpg)
              </p>
            </div>
          </>
        )}

        <div className="flex justify-end mt-6">
          {isClosed ? (
            <span className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500">
              Analisa penyebab sudah close dan terkunci
            </span>
          ) : (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-900 text-white text-sm font-bold rounded-lg shadow-md shadow-blue-100 transition-all active:scale-95"
            >
              Simpan
            </button>
          )}
        </div>
      </div>
    );
  }

  // ============================
  // 🟢 MODE LIST
  // ============================
  return (
    <div className="space-y-5">
      <h2 className="font-bold text-xl text-slate-800">
        Analisis Penyebab Temuan
      </h2>

      {data.map((item) => (
        <div
          key={item.id}
          onClick={() => handleSelectTemuan(item)}
          className="bg-white border rounded-xl p-5 shadow-sm 
                 hover:shadow-md hover:border-blue-300 
                 transition-all cursor-pointer"
        >
          {/* HEADER */}
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-blue-600 font-semibold text-lg">
              {item.masalah}
            </h3>

            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full 
          ${
            item.status_analisis === "close"
              ? "bg-green-600 text-white"
              : item.status_analisis === "draft"
              ? "bg-yellow-500 text-white"
              : "bg-red-600 text-white"
          }`}
            >
              {item.status_analisis === "close"
    ? "🟢 Close"
    : item.status_analisis === "draft"
    ? "🟡 Draft"
    : "🔴 Belum diisi"}
            </span>
          </div>

          {/* CONTENT */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="font-semibold text-black-500">Kondisi :</p>
              <p>{item.kondisi || "-"}</p>
            </div>

            <div>
              <p className="font-semibold text-black-500">Kriteria :</p>
              <p>{item.kriteria || "-"}</p>
            </div>

            <div>
              <p className="font-semibold text-black-500">Sebab :</p>
              <p>{item.sebab || "-"}</p>
            </div>

            <div>
              <p className="font-semibold text-black-500">Akibat :</p>
              <p>{item.akibat || "-"}</p>
            </div>
          </div>
        </div>
      ))}

      {/* BUTTON */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleKirimTindakLanjut}
          className="flex items-center gap-2 px-5 py-2.5 
                 bg-green-600 hover:bg-green-700 
                 text-white font-semibold rounded-lg shadow 
                 transition-all active:scale-95"
        >
          <ArrowRight size={18} />
          Kirim Rencana Tindak Lanjut
        </button>
      </div>
    </div>
  );
};

export default AnalisisTab;
