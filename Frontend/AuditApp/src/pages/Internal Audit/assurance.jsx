import React, { useState, useEffect, useCallback } from "react";
import {
  BsShieldCheck,
  BsSearch,
  BsFilter,
  BsPlusLg,
  BsX, BsPencilSquare, BsTrash, BsEye, BsFileText, BsCheckCircleFill,
  BsClipboardCheck,
  BsClockHistory,
  BsCheck2Circle,
} from "react-icons/bs";
import apiClient from "../../../../Shared/api/apiClient";
import { useNavigate } from "react-router-dom";

const unitToCategoryMap = {
  "Business Development": "Operasional & Produksi",
  "Customer Service": "Operasional & Produksi",
  "Kantor Pusat": "Operasional & Produksi",
  "Finance & Accounting": "Keuangan & Logistik",
  "Human Resources Development": "SDM & Hukum",
  Legal: "SDM & Hukum",
  "APU-PPT": "SDM & Hukum",
  "Compliance & Internal Auditor": "SDM & Hukum",
  "Information Technology": "IT & Infrastruktur",
  "Data Analyst": "IT & Infrastruktur",
};
const Assurance = () => {
  const navigate = useNavigate();

  const [dataAssurance, setDataAssurance] = useState([]);
  const [suratTugasList, setSuratTugasList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    noST: "",
    objek_pemeriksaan: "", // Dropdown
    nama_kegiatan: "",
    tujuan: "",
    sasaran: "",
    objek_audit: "",
    ruang_lingkup: "",
    metodologi: "",
    tgl_mulai: "",
    tgl_selesai: "",
    lokasi: "",
    ketua: "", // Dropdown
    pengendali_teknis: "", // Dropdown
    koordinator: "", // Dropdown
    auditor: [""],
    keterangan: "",
    status: "Planning",
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const extract = (res) =>
        res.data?.data || (Array.isArray(res.data) ? res.data : []);

      const [resAssurance, resST, resUsers] = await Promise.all([
        apiClient.get("/api/assurance").catch(() => ({ data: [] })),
        apiClient.get("/api/surat-tugas").catch(() => ({ data: [] })),
        apiClient.get("/api/users").catch(() => ({ data: [] })),
      ]);

      setDataAssurance(extract(resAssurance));
      setSuratTugasList(extract(resST));
      setUsersList(extract(resUsers));
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle ketika No ST dipilih (Auto-fill)
  const handleSTChange = (val) => {
    const st = suratTugasList.find((item) => item.nomor_surat === val);
    if (st) {
      setFormData((prev) => ({
        ...prev,
        noST: val,
        objek_audit: st.deskripsi || "",
        periode_pemeriksaan: st.periode_pemeriksaan || "",
        ketua: st.ketua || "",
        pengendali_teknis: st.pengendali_teknis || "",
        koordinator: st.koordinator || "",
        auditor: st.auditor ? st.auditor.split(", ") : [""],
      }));
    } else {
      setFormData((prev) => ({ ...prev, noST: val }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const st = suratTugasList.find(
      (item) => item.nomor_surat === formData.noST,
    );

    const koordinator = usersList.find((u) => u.name === formData.koordinator);
    const pt = usersList.find((u) => u.name === formData.pengendali_teknis);
    const ketua = usersList.find((u) => u.name === formData.ketua);
    const auditorIds = formData.auditor
      .map((name) => usersList.find((u) => u.name === name)?.id)
      .filter(Boolean);

    const payload = {
      surat_tugas_id: st?.id,
      objek_pemeriksaan: formData.objek_pemeriksaan,
      nama_kegiatan: formData.nama_kegiatan,
      tujuan: formData.tujuan,
      sasaran: formData.sasaran,
      objek_audit: formData.objek_audit,
      ruang_lingkup: formData.ruang_lingkup,
      metodologi: formData.metodologi,
      periode_awal: formData.tgl_mulai,
      periode_akhir: formData.tgl_selesai,
      lokasi: formData.lokasi,
      koordinator_id: koordinator?.id,
      pt_id: pt?.id,
      ketua_id: ketua?.id,
      auditor_id: auditorIds[0],
      keterangan: formData.keterangan,
    };

    try {
      setLoading(true);
      await apiClient.post("/api/assurance", payload);
      setShowModal(false);
      fetchData();
      alert("Data berhasil disimpan!");
    } catch (err) {
      console.log(err.response?.data);
      alert("Gagal simpan");
    } finally {
      setLoading(false);
    }
  };

  const getUserRole = (name) => {
    if (!name) return "-";
    const user = usersList.find((u) => u.name === name);
    // Mengambil nama role pertama dari array roles
    return user?.roles?.[0]?.name || "User";
  };

  const addAuditor = () => {
    setFormData((prev) => ({
      ...prev,
      auditor: [...prev.auditor, ""],
    }));
  };

  const removeAuditor = (index) => {
    const updated = [...formData.auditor];
    updated.splice(index, 1);

    setFormData((prev) => ({
      ...prev,
      auditor: updated,
    }));
  };

  const handleAuditorChange = (index, value) => {
    const updated = [...formData.auditor];
    updated[index] = value;

    setFormData((prev) => ({
      ...prev,
      auditor: updated,
    }));
  };

  const groupedData = dataAssurance.reduce((acc, item) => {
    const unit = item.objek_pemeriksaan || "Tanpa Unit";

    if (!acc[unit]) acc[unit] = [];

    acc[unit].push(item);
    return acc;
  }, {});

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <BsShieldCheck className="text-blue-600" /> Audit Assurance
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
        >
          <BsPlusLg /> Tambah Data
        </button>
      </div>

      {/* Tabel (Gunakan dataAssurance.map di sini seperti sebelumnya) */}

<div className="border-slate-200 overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full text-sm border-collapse">
      {/* HEADER TABEL DENGAN MULTI-ROW (ROWSPAN/COLSPAN) */}
      <thead className="bg-[#1a4b84] text-white">
        <tr>
          <th rowSpan="2" className="p-4 text-left font-semibold border-r border-white/10 w-[40%]">
            Unit / Bidang / Kegiatan
          </th>
          <th colSpan="3" className="p-2 text-center font-semibold border-b border-r border-white/10 bg-[#153d6b]">
            Jumlah
          </th>
          <th rowSpan="2" className="p-4 text-center font-semibold border-r border-white/10">
            Status
          </th>
          <th rowSpan="2" className="p-4 text-center font-semibold">
            Aksi
          </th>
        </tr>
        <tr className="bg-[#245a96]">
          <th className="p-2 text-center font-medium border-r border-white/10 text-[12px]">Draft Temuan</th>
          <th className="p-2 text-center font-medium border-r border-white/10 text-[12px]">Monev</th>
          <th className="p-2 text-center font-medium border-r border-white/10 text-[12px]">Close</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100">
        {Object.keys(groupedData).map((unit) => (
          <React.Fragment key={unit}>
            {/* UNIT ROW */}
            <tr className="bg-slate-50">
              <td colSpan="6" className="p-3 px-4 text-slate-900 font-bold border-l-4 border-blue-600">
                {unit}
              </td>
            </tr>

            {/* DATA ROWS */}
            {groupedData[unit].map((item) => (
              <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                <td className="p-4 pl-6">
                  <div className="flex flex-col gap-1">
                    <span 
                      className="text-blue-700 font-medium hover:underline cursor-pointer flex items-center gap-2"
                      onClick={() => navigate(`/internal/assurance/${item.id}`)}
                    >
                      {item.nama_kegiatan}
                    </span>
                  </div>
                </td>

                {/* KOLOM JUMLAH */}
                <td className="text-center p-3 font-medium text-slate-700 border-x border-slate-50">3</td>
                <td className="text-center p-3 font-medium text-slate-700 border-r border-slate-50 text-slate-400">0</td>
                <td className="text-center p-3 font-medium text-slate-700 border-r border-slate-50 text-slate-400">0</td>

                {/* STATUS BADGE */}
                <td className="text-center p-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-md text-[11px] font-bold shadow-sm border
                    ${item.status === "Selesai" 
                      ? "bg-emerald-600 text-white border-emerald-700" 
                      : "bg-[#007bff] text-white border-blue-700"}`}
                  >
                    {item.status === "Selesai" && <BsCheckCircleFill className="mr-1.5" size={10} />}
                    {item.status || "Pengisian Rencana Tindak Lanjut"}
                  </span>
                </td>

                {/* AKSI BUTTONS */}
                <td className="text-center p-3">
                  <div className="flex justify-center gap-1">
                    <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all" title="Lihat">
                      <BsEye size={18} />
                    </button>
                    <button className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-all" title="Edit">
                      <BsPencilSquare size={16} />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all" title="Hapus">
                      <BsTrash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  </div>
</div>

      {/* MODAL KOMPLEKS */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col transition-all">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">
                Input Pengujian Assurance
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-red-500"
              >
                <BsX size={28} />
              </button>
            </div>

            <form
              onSubmit={handleSave}
              className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"
            >
              {/* Kolom Dropdown Surat Tugas - Full Width */}
              <div className="md:col-span-2 bg-blue-50 p-4 rounded-xl border border-blue-100 mb-2">
                <label className="block text-[10px] font-black text-blue-600 uppercase mb-1">
                  Surat Tugas
                </label>
                <select
                  required
                  className="w-full h-10 px-3 border border-blue-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.noST}
                  onChange={(e) => handleSTChange(e.target.value)}
                >
                  <option value="">-- Pilih Nomor Surat Tugas --</option>
                  {suratTugasList.map((st) => (
                    <option key={st.id} value={st.nomor_surat}>
                      {st.nomor_surat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Objek Pemeriksaan & Nama Kegiatan - Row 1 */}
              <div className="flex flex-col">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">
                  Objek Pemeriksaan
                </label>

                <select
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                  value={formData.objek_pemeriksaan}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      objek_pemeriksaan: e.target.value,
                    })
                  }
                >
                  <option value="">-- Pilih Sub Unit --</option>

                  {Object.keys(unitToCategoryMap).map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">
                  Nama Kegiatan
                </label>
                <input
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                  value={formData.nama_kegiatan}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_kegiatan: e.target.value })
                  }
                  placeholder="Input manual..."
                />
              </div>

              {/* Tujuan & Sasaran - Row 2 (Textarea disamakan tingginya) */}
              <div className="flex flex-col">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">
                  Tujuan
                </label>
                <textarea
                  className="w-full h-12 px-3 py-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 resize-y leading-tight"
                  placeholder="Jelaskan tujuan..."
                  value={formData.tujuan}
                  onChange={(e) =>
                    setFormData({ ...formData, tujuan: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">
                  Sasaran
                </label>
                <textarea
                  className="w-full h-12 px-3 py-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 resize-y leading-tight"
                  value={formData.sasaran}
                  onChange={(e) =>
                    setFormData({ ...formData, sasaran: e.target.value })
                  }
                  placeholder="Jelaskan sasaran..."
                />
              </div>

              {/* Objek Audit & Ruang Lingkup - Row 3 */}
              <div className="flex flex-col">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">
                  Objek Audit
                </label>
                <input
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                  value={formData.objek_audit}
                  onChange={(e) =>
                    setFormData({ ...formData, objek_audit: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">
                  Ruang Lingkup
                </label>
                <input
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                  value={formData.ruang_lingkup}
                  onChange={(e) =>
                    setFormData({ ...formData, ruang_lingkup: e.target.value })
                  }
                />
              </div>

              <div className="flex flex-col">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">
                  Metodologi Audit
                </label>
                <input
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                  value={formData.metodologi}
                  onChange={(e) =>
                    setFormData({ ...formData, metodologi: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">
                  Periode Pemeriksaan
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                    value={formData.tgl_mulai}
                    onChange={(e) =>
                      setFormData({ ...formData, tgl_mulai: e.target.value })
                    }
                  />

                  <input
                    type="date"
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                    value={formData.tgl_selesai}
                    onChange={(e) =>
                      setFormData({ ...formData, tgl_selesai: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">
                  lokasi
                </label>
                <input
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                  value={formData.lokasi}
                  onChange={(e) =>
                    setFormData({ ...formData, lokasi: e.target.value })
                  }
                />
              </div>

              {/* ================= PERSONIL ================= */}
              <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-100 mt-2">
                {/* Personil utama */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <PersonilDropdown
                    label="Koordinator"
                    value={formData.koordinator}
                    list={usersList}
                    onChange={(val) =>
                      setFormData({ ...formData, koordinator: val })
                    }
                  />

                  <PersonilDropdown
                    label="Pengendali Teknis"
                    value={formData.pengendali_teknis}
                    list={usersList}
                    onChange={(val) =>
                      setFormData({ ...formData, pengendali_teknis: val })
                    }
                  />

                  <PersonilDropdown
                    label="Ketua Tim"
                    value={formData.ketua}
                    list={usersList}
                    onChange={(val) => setFormData({ ...formData, ketua: val })}
                  />
                </div>

                {/* ================= AUDITOR ================= */}
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">
                  Auditor
                </label>

                {formData.auditor.map((aud, index) => (
                  <div
                    key={index}
                    className="relative flex items-center gap-2 mb-3"
                  >
                    {/* Nomor */}
                    <span className="text-xs font-semibold text-slate-500 w-4">
                      {index + 1}
                    </span>

                    {/* Dropdown */}
                    <select
                      className="flex-1 h-9 px-2 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                      value={aud}
                      onChange={(e) =>
                        handleAuditorChange(index, e.target.value)
                      }
                    >
                      <option value="">Pilih...</option>

                      {usersList.map((user) => (
                        <option key={user.id} value={user.name}>
                          {user.name} ({user.roles?.[0]?.name || "User"})
                        </option>
                      ))}
                    </select>

                    {/* Tombol Hapus */}
                    <button
                      type="button"
                      onClick={() => removeAuditor(index)}
                      className="absolute -top-2 -right-2 w-5 h-5 text-[10px] bg-red-500 hover:bg-red-600 text-white rounded flex items-center justify-center"
                    >
                      −
                    </button>
                  </div>
                ))}

                {/* Tombol Tambah Auditor */}
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={addAuditor}
                    className="w-5 h-5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Keterangan - Full Width */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">
                  Keterangan
                </label>
                <input
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                  value={formData.keterangan}
                  onChange={(e) =>
                    setFormData({ ...formData, keterangan: e.target.value })
                  }
                />
              </div>

              {/* Footer Buttons */}
              <div className="md:col-span-2 flex gap-3 mt-4 border-t pt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                >
                  Simpan Data Assurance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Dropdown Personil
const PersonilDropdown = ({ label, value, list, onChange }) => (
  <div className="flex flex-col">
    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1">
      {label}
    </label>
    <select
      className="w-full h-10 px-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 bg-white"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">-- Pilih --</option>
      {list.map((u) => (
        <option key={u.id} value={u.name}>
          {u.name} ({u.roles?.[0]?.name || "N/A"})
        </option>
      ))}
    </select>
  </div>
);

const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-green-50 text-green-600",
  };
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-lg text-xl ${colors[color]}`}>{icon}</div>
      <div>
        <div className="text-sm text-slate-500 font-medium">{title}</div>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
      </div>
    </div>
  );
};

export default Assurance;
