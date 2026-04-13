import React, { useEffect, useState } from "react";
import { BsArrowRepeat, BsBoxArrowInRight, BsClock, BsSearch } from "react-icons/bs";
import { notifySuccess } from "../../../Shared/utils/notifier";
import apiClient from "../../../Shared/api/apiClient";

const EMPTY_CREATE_FORM = {
  tahun: "",
  bulan: "",
  keterangan: "",
  bukti: null,
};

const EMPTY_REVIEW_FORM = {
  hasil_evaluasi: "",
  kesimpulan: "",
};

const MONTH_OPTIONS = [
  { value: 1, label: "Bulan Januari" },
  { value: 2, label: "Bulan Februari" },
  { value: 3, label: "Bulan Maret" },
  { value: 4, label: "Bulan April" },
  { value: 5, label: "Bulan Mei" },
  { value: 6, label: "Bulan Juni" },
  { value: 7, label: "Bulan Juli" },
  { value: 8, label: "Bulan Agustus" },
  { value: 9, label: "Bulan September" },
  { value: 10, label: "Bulan Oktober" },
  { value: 11, label: "Bulan November" },
  { value: 12, label: "Bulan Desember" },
];

const EVALUATION_OPTIONS = [
  { value: "sesuai", label: "Sesuai" },
  { value: "potensi sesuai", label: "Potensi Sesuai" },
  { value: "belum sesuai", label: "Belum Sesuai" },
];

const Field = ({ label, value }) => (
  <div>
    <b>{label}</b>
    <div>{value ?? "-"}</div>
  </div>
);

const FollowUp = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJenisAudit, setFilterJenisAudit] = useState("");
  const [filterUnit, setFilterUnit] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [dataFollowUp, setDataFollowUp] = useState([]);
  const [mode, setMode] = useState("list");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [reviewItem, setReviewItem] = useState(null);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [reviewForm, setReviewForm] = useState(EMPTY_REVIEW_FORM);

  const fetchFollowUp = async () => {
    try {
      const res = await apiClient.get("/api/tindak-lanjut");
      const sorted = (res.data.data || []).sort((a, b) => a.id - b.id);
      setDataFollowUp(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFollowUp();
  }, []);

  const filteredData = dataFollowUp.filter(
    (item) =>
      (item.masalah?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.unit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.id).includes(searchTerm)) &&
      (filterJenisAudit === "" || item.jenis_audit === filterJenisAudit) &&
      (filterUnit === "" || item.unit === filterUnit) &&
      (filterStatus === "" || item.status === filterStatus),
  );

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getMonthLabel = (month) => {
    return MONTH_OPTIONS.find((item) => item.value === Number(month))?.label || "-";
  };

  const getStatusBadgeClass = (status) => {
    if (status === "close") return "bg-green-100 text-green-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const getStatusLabel = (status) => {
    if (status === "close") return "Close";
    if (status === "monev") return "Monev";
    return "Draft Temuan";
  };

  const getUniqueJenisAudit = () => {
    const unique = [...new Set(dataFollowUp.map((item) => item.jenis_audit).filter(Boolean))];
    return unique.sort();
  };

  const getUniqueUnit = () => {
    const unique = [...new Set(dataFollowUp.map((item) => item.unit).filter(Boolean))];
    return unique.sort();
  };

  const getUniqueStatus = () => {
    return ["draft", "monev", "close"];
  };

  const handleDetail = async (item) => {
    try {
      const res = await apiClient.get(`/api/tindak-lanjut/detail/${item.temuan_id}`);

      setSelectedItem({
        ...res.data.temuan,
        temuan_id: item.temuan_id,
        tindak_lanjut: Array.isArray(res.data.tindak_lanjut)
          ? res.data.tindak_lanjut
          : [],
      });

      setMode("detail");
    } catch (err) {
      console.error(err);
    }
  };

  const refreshDetail = async () => {
    if (!selectedItem?.temuan_id) return;
    await handleDetail({ temuan_id: selectedItem.temuan_id });
    await fetchFollowUp();
  };

  const handleCreateTL = async () => {
    try {
      const formData = new FormData();
      formData.append("tahun", createForm.tahun);
      formData.append("bulan", createForm.bulan);
      formData.append("keterangan", createForm.keterangan);
      if (createForm.bukti) {
        formData.append("bukti", createForm.bukti);
      }

      await apiClient.post(
        `/api/tindak-lanjut/${selectedItem.temuan_id}/detail`,
        formData,
      );

      notifySuccess("Tindak lanjut berhasil ditambahkan");
      setShowCreateModal(false);
      setCreateForm(EMPTY_CREATE_FORM);
      await refreshDetail();
    } catch (err) {
      console.error(err);
    }
  };

  const openReviewModal = (item) => {
    setReviewItem(item);
    setReviewForm({
      hasil_evaluasi: item.hasil_evaluasi || "",
      kesimpulan: item.kesimpulan || "",
    });
  };

  const handleSubmitReview = async () => {
    try {
      await apiClient.put(`/api/tindak-lanjut/${reviewItem.id}/review`, reviewForm);

      notifySuccess("Review tindak lanjut berhasil disimpan");
      setReviewItem(null);
      setReviewForm(EMPTY_REVIEW_FORM);
      await refreshDetail();
    } catch (err) {
      console.error(err);
    }
  };

  if (mode === "detail" && selectedItem) {
    const isLocked = selectedItem.is_locked || selectedItem.status === "close";

    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <button
          onClick={() => setMode("list")}
          className="mb-4 rounded bg-gray-200 px-4 py-2"
        >
          Kembali
        </button>

        <h1 className="mb-2 text-xl font-bold">Detail Tindak Lanjut</h1>

        <div className="space-y-2 p-3">
          <Field label="Masalah yang Dijumpai" value={selectedItem.masalah} />
          <Field label="Kondisi" value={selectedItem.kondisi} />
          <Field label="Kriteria" value={selectedItem.kriteria} />
          <Field label="Sebab" value={selectedItem.sebab} />
          <Field label="Akibat" value={selectedItem.akibat} />
          <Field
            label="Lampiran"
            value={
              selectedItem.lampiran ? (
                <a href={`/storage/${selectedItem.lampiran}`} target="_blank" rel="noreferrer">
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
            <span
              className={`ml-2 rounded px-2 py-1 text-xs ${getStatusBadgeClass(
                selectedItem.status,
              )}`}
            >
              {getStatusLabel(selectedItem.status)}
            </span>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold">Tindak Lanjut</h2>
              {isLocked && (
                <p className="text-sm text-slate-500">
                  Data sudah ditutup. Tindak lanjut tidak bisa ditambah atau direview lagi.
                </p>
              )}
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              disabled={isLocked}
              className="rounded bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              + Tindak Lanjut
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#1f4b82] text-white">
                <tr>
                  <th className="p-3 text-left">No</th>
                  <th className="p-3 text-left">Tahun</th>
                  <th className="p-3 text-left">Periode</th>
                  <th className="p-3 text-left">Lampiran</th>
                  <th className="p-3 text-left">Hasil Evaluasi</th>
                  <th className="p-3 text-left">Kesimpulan</th>
                  <th className="p-3 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {selectedItem.tindak_lanjut.length > 0 ? (
                  selectedItem.tindak_lanjut.map((tl, index) => (
                    <tr key={tl.id} className="border-t">
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3">{tl.tahun || "-"}</td>
                      <td className="p-3">{getMonthLabel(tl.bulan)}</td>
                      <td className="p-3">
                        {tl.bukti ? (
                          <a
                            href={`/storage/${tl.bukti}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 underline"
                          >
                            {tl.bukti.split("/").pop()}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-3 capitalize">
                        {tl.hasil_evaluasi || "Menunggu review"}
                      </td>
                      <td className="p-3">{tl.kesimpulan || "-"}</td>
                      <td className="p-3">
                        <button
                          onClick={() => openReviewModal(tl)}
                          disabled={isLocked}
                          className="rounded bg-blue-600 px-3 py-2 text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-4 text-center text-slate-500">
                      Belum ada tindak lanjut yang ditambahkan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg space-y-4 rounded-xl bg-white p-6">
              <h2 className="text-lg font-bold">Tambah Tindak Lanjut</h2>

              <textarea
                placeholder="Keterangan"
                className="w-full rounded border p-2"
                value={createForm.keterangan}
                onChange={(e) =>
                  setCreateForm({ ...createForm, keterangan: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Tahun"
                className="w-full rounded border p-2"
                value={createForm.tahun}
                onChange={(e) =>
                  setCreateForm({ ...createForm, tahun: e.target.value })
                }
              />

              <select
                className="w-full rounded border p-2"
                value={createForm.bulan}
                onChange={(e) =>
                  setCreateForm({ ...createForm, bulan: e.target.value })
                }
              >
                <option value="">Pilih Periode</option>
                {MONTH_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <input
                type="file"
                onChange={(e) =>
                  setCreateForm({ ...createForm, bukti: e.target.files?.[0] || null })
                }
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateForm(EMPTY_CREATE_FORM);
                  }}
                  className="rounded bg-gray-300 px-4 py-2"
                >
                  Batal
                </button>
                <button
                  onClick={handleCreateTL}
                  className="rounded bg-blue-600 px-4 py-2 text-white"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}

        {reviewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl space-y-4 rounded-xl bg-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Review Tindak Lanjut</h2>
                <button
                  onClick={() => {
                    setReviewItem(null);
                    setReviewForm(EMPTY_REVIEW_FORM);
                  }}
                  className="text-2xl text-slate-400"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <b>Tahun</b>
                  <p>{reviewItem.tahun || "-"}</p>
                </div>
                <div>
                  <b>Periode</b>
                  <p>{getMonthLabel(reviewItem.bulan)}</p>
                </div>
                <div>
                  <b>Keterangan</b>
                  <p>{reviewItem.keterangan || "-"}</p>
                </div>
                <div>
                  <b>Lampiran</b>
                  <p>
                    {reviewItem.bukti ? (
                      <a
                        href={`/storage/${reviewItem.bukti}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                      >
                        {reviewItem.bukti.split("/").pop()}
                      </a>
                    ) : (
                      "-"
                    )}
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-semibold">Hasil Evaluasi</label>
                <select
                  className="w-full rounded border p-2"
                  value={reviewForm.hasil_evaluasi}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, hasil_evaluasi: e.target.value })
                  }
                >
                  <option value="">Pilih hasil evaluasi</option>
                  {EVALUATION_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-semibold">Kesimpulan</label>
                <textarea
                  className="w-full rounded border p-2"
                  rows="3"
                  value={reviewForm.kesimpulan}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, kesimpulan: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSubmitReview}
                  className="rounded bg-blue-700 px-4 py-2 text-white"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-3 text-2xl font-bold">
          <BsArrowRepeat /> Monitoring Tindak Lanjut
        </h1>
        <p className="text-gray-500">Pantau realisasi perbaikan dari hasil audit</p>
      </div>

<div className="mb-4 flex flex-wrap items-center gap-3">
  {/* Search */}
  <div className="relative w-80">
    <BsSearch className="absolute left-3 top-3 text-gray-400" />
    <input
      type="text"
      placeholder="Cari masalah yang dijumpai..."
      className="w-full rounded border py-2 pl-10 pr-4"
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>

  {/* Filter */}
  <select
    className="rounded border px-3 py-2"
    value={filterJenisAudit}
    onChange={(e) => setFilterJenisAudit(e.target.value)}
  >
    <option value="">Jenis Audit</option>
    {getUniqueJenisAudit().map((item) => (
      <option key={item} value={item}>
        {item}
      </option>
    ))}
  </select>

  <select
    className="rounded border px-3 py-2"
    value={filterUnit}
    onChange={(e) => setFilterUnit(e.target.value)}
  >
    <option value="">Unit</option>
    {getUniqueUnit().map((item) => (
      <option key={item} value={item}>
        {item}
      </option>
    ))}
  </select>

  <select
    className="rounded border px-3 py-2"
    value={filterStatus}
    onChange={(e) => setFilterStatus(e.target.value)}
  >
    <option value="">Status</option>
    {getUniqueStatus().map((status) => (
      <option key={status} value={status}>
        {getStatusLabel(status)}
      </option>
    ))}
  </select>
</div>

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="p-3">No</th>
              <th className="p-3">Masalah yang Dijumpai</th>
              <th className="p-3">Jenis Audit</th>
              <th className="p-3">Unit</th>
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
                <td className="p-3 capitalize">{item.jenis_audit || "-"}</td>
                <td className="p-3">{item.unit || "-"}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <BsClock />
                    {formatDate(item.target_selesai)}
                  </div>
                </td>
                <td className="p-3">
                  <span
                    className={`rounded px-2 py-1 text-xs ${getStatusBadgeClass(
                      item.status,
                    )}`}
                  >
                    {getStatusLabel(item.status)}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleDetail(item)}
                    className="inline-flex items-center gap-1.5 rounded bg-[#1f5aa6] px-2.5 py-1.5 text-sm font-semibold leading-none text-white hover:bg-[#184b8b]"
                  >
                    <BsBoxArrowInRight className="text-sm" />
                    <span>Tindak Lanjut</span>
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
