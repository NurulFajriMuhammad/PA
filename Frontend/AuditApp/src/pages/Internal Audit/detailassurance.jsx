import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../../../Shared/api/apiClient";
import { ArrowLeft } from "lucide-react";
import PerencanaanTab from "./tabs/PerencanaanTab";
import PelaksanaanTab from "./tabs/PelaksanaanTab";
import AnalisisTab from "./tabs/AnalisisPenyebabTab";

const AssuranceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("perencanaan");
  const [openInfo, setOpenInfo] = useState(false);
  const [assurance, setAssurance] = useState(null);
  const [loading, setLoading] = useState(true);

  // fetch data assurance by id
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await apiClient.get(`/api/assurance/${id}`);
        setAssurance(res.data?.data || res.data);
      } catch (err) {
        console.error("Error fetch detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!assurance) {
    return <div className="p-6">Data tidak ditemukan</div>;
  }

  return (
    <div className="p-2">
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/internal/assurance")}
        className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-900 text-white text-sm font-bold rounded-lg shadow-md shadow-red-100 transition-all active:scale-95"
      >
        <ArrowLeft size={18}/>
        Kembali ke daftar assurance
      </button>

      {/* HEADER */}
      <div className="bg-slate-800 text-white p-6 rounded-xl mb-3 mt-1">
        <h1
          onClick={() => setOpenInfo(!openInfo)}
          className="text-xl font-bold cursor-pointer"
        >
          {assurance.nama_kegiatan}
        </h1>

        <p
          onClick={() => setOpenInfo(!openInfo)}
          className="text-xs text-slate-300 cursor-pointer"
        >
          Klik untuk melihat detail informasi assurance
        </p>

        {/* ACCORDION CONTENT */}
        <div
          className={`transition-all duration-700 ease-in-out overflow-hidden ${
            openInfo ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="grid grid-cols-2 gap-6 py-4 text-sm">
            <div className="space-y-2">
              <p>
                <b>Surat Tugas :</b> {assurance.surat_tugas?.nomor_surat || "-"}
              </p>
              <p>
                <b>Kegiatan Audit :</b> {assurance.nama_kegiatan}
              </p>
              <p>
                <b>Nama Objek Audit :</b> {assurance.objek_pemeriksaan}
              </p>
              <p>
                <b>Periode Audit :</b> {assurance.periode_awal} s/d{" "}
                {assurance.periode_akhir}
              </p>
              <p>
                <b>Lokasi :</b> {assurance.lokasi || "-"}
              </p>
            </div>

            <div className="space-y-2">
              <p>
                <b>Tujuan :</b> {assurance.tujuan || "-"}
              </p>
              <p>
                <b>Ruang Lingkup :</b> {assurance.ruang_lingkup || "-"}
              </p>
              <p>
                <b>Objek Audit :</b> {assurance.objek_audit || "-"}
              </p>
              <p>
                <b>Metodologi :</b> {assurance.metodologi || "-"}
              </p>
              <p>
                <b>Ketua :</b> {assurance.ketua_tim?.name || "-"}
              </p>
              <p>
                <b>Pengendali Teknis :</b>{" "}
                {assurance.pengendali_teknis?.name || "-"}
              </p>
              <p>
                <b>Koordinator :</b> {assurance.koordinator?.name || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TAB MENU */}
      <div className="flex gap-8 border-b border-slate-200 mb-6 mt-4 relative">
        {/* Tab Perencanaan */}
        <button
          onClick={() => setActiveTab("perencanaan")}
          className={`pb-3 text-sm font-bold transition-all duration-300 relative flex items-center gap-2 ${
            activeTab === "perencanaan"
              ? "text-blue-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <span
            className={`p-1.5 rounded-lg ${activeTab === "perencanaan" ? "bg-blue-100" : "bg-slate-100"}`}
          >
            {/* Kamu bisa ganti dengan ikon dari react-icons */}
            <div className="w-3 h-3 rounded-full bg-current" />
          </span>
          Perencanaan
          {activeTab === "perencanaan" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full animate-in fade-in slide-in-from-left-2" />
          )}
        </button>

        {/* Tab Pelaksanaan */}
        <button
          onClick={() => setActiveTab("pelaksanaan")}
          className={`pb-3 text-sm font-bold transition-all duration-300 relative flex items-center gap-2 ${
            activeTab === "pelaksanaan"
              ? "text-blue-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <span
            className={`p-1.5 rounded-lg ${activeTab === "pelaksanaan" ? "bg-blue-100" : "bg-slate-100"}`}
          >
            <div className="w-3 h-3 rounded-full bg-current" />
          </span>
          Pelaksanaan (KKA)
          {activeTab === "pelaksanaan" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full animate-in fade-in slide-in-from-left-2" />
          )}
        </button>

        {/* Tab Analisis */}
        <button
          onClick={() => setActiveTab("analisis")}
          className={`pb-3 text-sm font-bold transition-all duration-300 relative flex items-center gap-2 ${
            activeTab === "analisis"
              ? "text-blue-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <span
            className={`p-1.5 rounded-lg ${activeTab === "analisis" ? "bg-blue-100" : "bg-slate-100"}`}
          >
            <div className="w-3 h-3 rounded-full bg-current" />
          </span>
          Analisis Penyebab
          {activeTab === "analisis" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full animate-in fade-in slide-in-from-left-2" />
          )}
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === "perencanaan" && <PerencanaanTab assurance={assurance} />}
      {activeTab === "pelaksanaan" && <PelaksanaanTab assurance={assurance} />}
      {activeTab === "analisis" && <AnalisisTab assurance={assurance} />}
    </div>
  );
};

export default AssuranceDetail;
