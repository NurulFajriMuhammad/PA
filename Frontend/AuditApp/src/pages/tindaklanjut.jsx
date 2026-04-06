import React, { useEffect, useState } from "react";
import { BsArrowRepeat, BsSearch, BsClock, BsEye } from "react-icons/bs";
import { notifySuccess } from "../../../Shared/utils/notifier";
import apiClient from "../../../Shared/api/apiClient";

const FollowUp = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [dataFollowUp, setDataFollowUp] = useState([]);
  const [mode, setMode] = useState("list");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    tahun: "",
    bulan: "",
    keterangan: "",
    progres: "",
    hasil_evaluasi: "",
    kesimpulan: "",
    tanggal: "",
    bukti: null,
  });

  // =========================
  // FETCH DATA
  // =========================
  const fetchFollowUp = async () => {
    try {
      const res = await apiClient.get("/api/tindak-lanjut");

      // 🔥 SORT ASC (13,14,15)
      const sorted = (res.data.data || []).sort((a, b) => a.id - b.id);

      setDataFollowUp(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFollowUp();
  }, []);

  // =========================
  // FILTER
  // =========================
  const filteredData = dataFollowUp.filter(
    (item) =>
      item.masalah?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.unit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(item.id).includes(searchTerm),
  );

  // =========================
  // FORMAT TANGGAL
  // =========================
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmitTL = async () => {
    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        formData.append(key, form[key] ?? "");
      });

      await apiClient.put(`/api/tindak-lanjut/${selectedItem.id}`, formData);

      notifySuccess("Tindak lanjut berhasil disimpan 🚀");
      setShowForm(false);
      setForm({
        tahun: "",
        bulan: "",
        keterangan: "",
        progres: "",
        hasil_evaluasi: "",
        kesimpulan: "",
        tanggal: "",
        bukti: null,
      });
      fetchFollowUp();
    } catch (err) {
      console.error(err);
    }
  };

  const Field = ({ label, value }) => (
    <div>
      <b>{label}</b>
      <p>{value || "-"}</p>
    </div>
  );

  const handleDetail = async (item) => {
    try {
      const res = await apiClient.get(
        `/api/tindak-lanjut/detail/${item.temuan_id}`,
      );

      setSelectedItem({
        ...res.data.temuan,
        tindak_lanjut: res.data.tindak_lanjut,
      });

      setMode("detail");
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // DETAIL PAGE
  // =========================
  if (mode === "detail" && selectedItem) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen">
        {/* BACK */}
        <button
          onClick={() => setMode("list")}
          className="mb-4 px-4 py-2 bg-gray-200 rounded"
        >
          ← Kembali
        </button>

        <h1 className="text-xl font-bold mb-2">Detail Tindak Lanjut</h1>

        {/* INFORMASI */}
        <div className="p-3 space-y-2">
          <Field label="Masalah yang Dijumpai" value={selectedItem.masalah} />
          <Field label="Kondisi" value={selectedItem.kondisi} />
          <Field label="Kriteria" value={selectedItem.kriteria} />
          <Field label="Sebab" value={selectedItem.sebab} />
          <Field label="Akibat" value={selectedItem.akibat} />

          <Field
            label="Lampiran"
            value={
              selectedItem.lampiran ? (
                <a href={`/storage/${selectedItem.lampiran}`} target="_blank">
                  Lihat
                </a>
              ) : (
                "-"
              )
            }
          />

          <Field label="Rekomendasi" value={selectedItem.rekomendasi} />
          <Field label="Analisa Penyebab" value={selectedItem.analisa} />
          <Field
            label="Rencana Tindakan Koreksi"
            value={selectedItem.rencana_koreksi}
          />
          <Field
            label="Rencana Tindakan Kolektif"
            value={selectedItem.rencana_kolektif}
          />

          <Field
            label="Target Penyelesaian"
            value={formatDate(selectedItem.target_selesai)}
          />

          <div>
            <b>Status</b>
            <span className="ml-2 px-2 py-1 bg-yellow-300 rounded text-xs">
              {selectedItem.status}
            </span>
          </div>
        </div>

        {/* FORM INPUT */}
        <div className="mt-6 bg-white p-6 rounded-xl shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold">Tindak Lanjut</h2>

            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              + Tindak Lanjut
            </button>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">No</th>
                <th className="p-2">Tahun</th>
                <th className="p-2">Bulan</th>
                <th className="p-2">Keterangan</th>
                <th className="p-2">Progres</th>
              </tr>
            </thead>

            <tbody>
              {Array.isArray(selectedItem.tindak_lanjut) &&
                selectedItem.tindak_lanjut.map((tl, i) => (
                  <tr key={tl.id} className="border-t">
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2">{tl.tahun}</td>
                    <td className="p-2">{tl.bulan}</td>
                    <td className="p-2">{tl.keterangan}</td>
                    <td className="p-2">{tl.progres}%</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
          {
    showForm && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl w-full max-w-lg space-y-4">
          <h2 className="font-bold text-lg">Tambah Tindak Lanjut</h2>

          <textarea
            placeholder="Keterangan"
            className="w-full border p-2 rounded"
            onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
          />

          <input
            type="number"
            placeholder="Progres (%)"
            className="w-full border p-2 rounded"
            onChange={(e) => setForm({ ...form, progres: e.target.value })}
          />

          <input
            type="number"
            placeholder="Tahun"
            className="w-full border p-2 rounded"
            onChange={(e) => setForm({ ...form, tahun: e.target.value })}
          />

          <input
            type="number"
            placeholder="Bulan"
            className="w-full border p-2 rounded"
            onChange={(e) => setForm({ ...form, bulan: e.target.value })}
          />

          <input
            type="file"
            onChange={(e) => setForm({ ...form, bukti: e.target.files[0] })}
          />

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Batal
            </button>

            <button
              onClick={handleSubmitTL}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    )
  }
      </div>
    );
  }



  // =========================
  // LIST PAGE
  // =========================
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <BsArrowRepeat /> Monitoring Tindak Lanjut
        </h1>
        <p className="text-gray-500">
          Pantau realisasi perbaikan dari hasil audit
        </p>
      </div>

      {/* SEARCH */}
      <div className="mb-4">
        <div className="relative w-80">
          <BsSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Cari..."
            className="pl-10 pr-4 py-2 border rounded w-full"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="p-3">No</th>
              <th className="p-3">Deskripsi</th>
              <th className="p-3">Jenis Audit</th>
              <th className="p-3">Target</th>
              <th className="p-3">Status</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((item, index) => (
              <tr key={item.id} className="border-t">
                <td className="p-3">{index + 1}</td>
                <td className="p-3 font-semibold">{item.masalah}</td>
                <td className="p-3">{item.jenis_audit || "-"}</td>
                <td className="p-3 flex items-center gap-2">
                  <BsClock />
                  {formatDate(item.target_selesai)}
                </td>
                <td className="p-3 text-yellow-600">{item.status}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleDetail(item)}
                    className="p-2 bg-gray-100 rounded hover:bg-blue-500 hover:text-white"
                  >
                    <BsEye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FollowUp;
