import React, { useState, useEffect } from 'react';
import apiClient from "../../../../Shared/api/apiClient";
import { useNavigate } from "react-router-dom";

import { 
  BsLightbulb, BsSearch, BsFolder2Open, 
  BsArrowRepeat, BsPeopleFill, BsJournalText,
  BsFillBookmarkStarFill, BsLink45Deg, BsX
} from 'react-icons/bs';

const Consulting = () => {
  const navigate = useNavigate();

  const [dataConsulting, setDataConsulting] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [units, setUnits] = useState([]);
  const [roles, setRoles] = useState([]);

  const [form, setForm] = useState({
    proyek: "",
    klien: "",
    unit_id: "",
    role_id: "",
    prioritas: "",
    tahap: "",
    deadline: "",
  });

  // ================= FETCH =================
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/consulting");
      setDataConsulting(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaster = async () => {
    try {
      const unitRes = await apiClient.get("/api/units");
      const roleRes = await apiClient.get("/api/roles");

      setUnits(unitRes.data || []);
      setRoles(roleRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchMaster();
  }, []);

  // ================= HANDLE =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await apiClient.post("/api/consulting", form);

      fetchData();
      setOpenModal(false);

      setForm({
        proyek: "",
        klien: "",
        unit_id: "",
        role_id: "",
        prioritas: "",
        tahap: "",
        deadline: "",
      });

    } catch (err) {
      console.error(err);
      alert("Gagal simpan");
    }
  };

  // ================= FORMAT =================
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 bg-violet-600 text-white rounded-lg">
              <BsLightbulb />
            </div>
            Internal Consulting
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Proyek pendampingan strategis untuk organisasi
          </p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-violet-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <BsLink45Deg /> Proyek Baru
        </button>
      </div>

      {/* STATUS */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <StatusCard label="Proyek Aktif" value={dataConsulting.length} icon={<BsArrowRepeat />} />
        <StatusCard label="Jam Konsultasi" value="120h" icon={<BsPeopleFill />} />
        <StatusCard label="Strategis" value="02" icon={<BsFillBookmarkStarFill />} />
        <StatusCard label="Dokumen" value="15" icon={<BsFolder2Open />} />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border overflow-hidden">

        <div className="p-4 border-b flex justify-between">
          <h2 className="font-bold">Monitoring Consulting</h2>

          <div className="relative">
            <BsSearch className="absolute left-3 top-2 text-gray-400" />
            <input className="pl-10 border p-2 rounded text-sm" placeholder="Cari..." />
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="p-3">Proyek</th>
              <th className="p-3">Unit</th>
              <th className="p-3">Role</th>
              <th className="p-3">Prioritas</th>
              <th className="p-3">Tahap</th>
              <th className="p-3">Deadline</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center p-5">Loading...</td>
              </tr>
            ) : dataConsulting.length > 0 ? (
              dataConsulting.map((item) => (
                <tr key={item.id} className="border-b">

                  <td className="p-3">
                    <div className="font-semibold">{item.proyek}</div>
                    <div className="text-xs text-gray-400">
                      {item.kode_consulting} • {item.klien}
                    </div>
                  </td>

                  <td className="p-3">
                    {item.unit?.nama || "-"}
                  </td>

                  <td className="p-3">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {item.role?.name || "-"}
                    </span>
                  </td>

                  <td className="p-3">{item.prioritas || "-"}</td>
                  <td className="p-3">{item.tahap || "-"}</td>
                  <td className="p-3">{formatDate(item.deadline)}</td>

                  <td className="p-3">
                    <button
                      onClick={() => navigate(`/consulting/${item.id}`)}
                      className="bg-violet-600 text-white px-2 py-1 rounded text-xs"
                    >
                      Chat
                    </button>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center p-5 text-gray-400">
                  Belum ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">

          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpenModal(false)} />

          <div className="bg-white w-[600px] p-6 rounded-xl z-10">

            <div className="flex justify-between mb-4 backdrop-blur-sm">
              <h2 className="font-bold ">Tambah Proyek</h2>
              <button onClick={() => setOpenModal(false)}><BsX /></button>
            </div>

<div className="grid grid-cols-2 gap-4">

  {/* PROYEK */}
  <div className="col-span-2 flex flex-col">
    <label className="text-xs font-bold text-gray-500 mb-1">Nama Proyek</label>
    <input
      name="proyek"
      placeholder="Contoh: Audit Sistem Informasi"
      onChange={handleChange}
      className="border p-2 rounded"
    />
  </div>

  {/* KLIEN */}
  <div className="flex flex-col">
    <label className="text-xs font-bold text-gray-500 mb-1">Klien</label>
    <input
      name="klien"
      placeholder="Contoh: Divisi Keuangan"
      onChange={handleChange}
      className="border p-2 rounded"
    />
  </div>

  {/* UNIT */}
  <div className="flex flex-col">
    <label className="text-xs font-bold text-gray-500 mb-1">Unit</label>
    <select
      name="unit_id"
      onChange={handleChange}
      className="border p-2 rounded"
    >
      <option value="">-- Pilih Unit --</option>
      {units.map(u => (
        <option key={u.id} value={u.id}>{u.nama}</option>
      ))}
    </select>
  </div>

  {/* ROLE */}
  <div className="flex flex-col">
    <label className="text-xs font-bold text-gray-500 mb-1">Akses Role</label>
    <select
      name="role_id"
      onChange={handleChange}
      className="border p-2 rounded"
    >
      <option value="">-- Pilih Role --</option>
      {roles.map(r => (
        <option key={r.id} value={r.id}>{r.name}</option>
      ))}
    </select>
  </div>

  {/* PRIORITAS */}
  <div className="flex flex-col">
    <label className="text-xs font-bold text-gray-500 mb-1">Prioritas</label>
    <select
      name="prioritas"
      onChange={handleChange}
      className="border p-2 rounded"
    >
      <option value="">-- Pilih Prioritas --</option>
      <option>Strategis</option>
      <option>Penting</option>
      <option>Rutin</option>
    </select>
  </div>

  {/* TAHAP */}
  <div className="flex flex-col">
    <label className="text-xs font-bold text-gray-500 mb-1">Tahap</label>
    <select
      name="tahap"
      onChange={handleChange}
      className="border p-2 rounded"
    >
      <option value="">-- Pilih Tahap --</option>
      <option>Designing</option>
      <option>Implementation</option>
      <option>Reporting</option>
    </select>
  </div>

  {/* DEADLINE */}
  <div className="flex flex-col">
    <label className="text-xs font-bold text-gray-500 mb-1">Deadline</label>
    <input
      type="date"
      name="deadline"
      onChange={handleChange}
      className="border p-2 rounded"
    />
  </div>


</div>

            <div className="flex gap-3 mt-4">
              <button onClick={() => setOpenModal(false)} className="flex-1 bg-gray-200 py-2 rounded">
                Batal
              </button>
              <button onClick={handleSave} className="flex-1 bg-violet-600 text-white py-2 rounded">
                Simpan
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

const StatusCard = ({ label, value, icon }) => (
  <div className="bg-white p-4 rounded border flex justify-between">
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <h3 className="font-bold">{value}</h3>
    </div>
    <div>{icon}</div>
  </div>
);

export default Consulting;