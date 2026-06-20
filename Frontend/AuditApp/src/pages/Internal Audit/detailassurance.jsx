import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../../../Shared/api/apiClient";
import useRealTime from "../../hooks/useRealTime";
import { ArrowLeft } from "lucide-react";
import PerencanaanTab from "./tabs/PerencanaanTab";
import PelaksanaanTab from "./tabs/PelaksanaanTab";
import AnalisisTab from "./tabs/AnalisisPenyebabTab";
import { notifyError } from "@shared/utils/notifier.jsx";

const AssuranceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("perencanaan");
  const [openInfo, setOpenInfo] = useState(false);
  const [assurance, setAssurance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabDirection, setTabDirection] = useState("right");
  const tabRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({});

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

  // Sinkronisasi Real-Time
  useRealTime(['assurance', 'perencanaan_kkas', 'pemeriksaan_temuan', 'analisis_temuan'], () => {
    fetchDetail();
  });

  useEffect(() => {
    fetchDetail();
  }, [id]);

  useEffect(() => {
    const el = tabRefs.current[activeTab];
    if (el) {
      setIndicatorStyle({
        width: el.offsetWidth + "px",
        transform: `translateX(${el.offsetLeft}px)`,
      });
    }
  }, [activeTab]);

  // ⬇️ BARU RETURN DI SINI
  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!assurance) {
    return <div className="p-6">Data tidak ditemukan</div>;
  }

  const formatTanggal = (dateString) => {
    if (!dateString) return "-";

    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatRupiah = (val) => {
    if (val === undefined || val === null || val === "") return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val).replace("Rp", "Rp ").trim();
  };

  const handleTabChange = (tab) => {
    if (tab === activeTab) return;

    const order = ["perencanaan", "pelaksanaan", "analisis"];

    const currentIndex = order.indexOf(activeTab);
    const nextIndex = order.indexOf(tab);

    setTabDirection(nextIndex > currentIndex ? "right" : "left");

    setActiveTab(tab);

    const el = tabRefs.current[tab];
    if (el) {
      setIndicatorStyle({
        width: el.offsetWidth + "px",
        transform: `translateX(${el.offsetLeft}px)`,
      });
    }
  };

  const handlePrintKonsep = async () => {
    try {
      const res = await apiClient.get("/api/kka-templates");

      const templates = res.data?.data || res.data || [];

      if (templates.length === 0) {
        notifyError("Template KKA belum ada");
        return;
      }

      const latest = templates[0]; // 🔥 paling terbaru

      const apiBaseUrl = import.meta.env.VITE_BACKEND_URL;
      const url = `/PrintTemplateKKA.html?template_id=${latest.id}&assurance_id=${id}&api_base_url=${encodeURIComponent(apiBaseUrl)}`;

      window.open(url, "_blank");
    } catch (err) {
      console.error(err);
      notifyError("Gagal mengambil template KKA");
    }
  };

  return (
    <div className="p-2">
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/internal/assurance")}
        className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-900 text-white text-sm font-bold rounded-lg shadow-md shadow-red-100 transition-all active:scale-95"
      >
        <ArrowLeft size={18} />
        Kembali ke daftar assurance
      </button>

      {/* HEADER */}
      <div className="bg-slate-800 text-white p-6 rounded-xl mt-1">
        <div className="flex justify-between items-center">
          <h1
            onClick={() => setOpenInfo(!openInfo)}
            className="text-xl font-bold cursor-pointer"
          >
            {assurance.nama_kegiatan}
          </h1>
          <span 
            className="px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest text-white shadow-sm"
            style={{ backgroundColor: assurance.status_color || "#2563eb" }}
          >
            {assurance.status_label}
          </span>
        </div>

        <p
          onClick={() => setOpenInfo(!openInfo)}
          className="text-xs text-slate-300 cursor-pointer"
        >
          Klik untuk melihat detail informasi assurance
        </p>

        {/* ACCORDION CONTENT */}
        <div
          className={`transition-all duration-700 ease-in-out overflow-hidden ${
            openInfo ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4 text-xs">
            {/* DASAR PELAKSANAAN */}
            <div className="bg-slate-900/40 p-4 rounded-xl space-y-2.5 border border-slate-700/50">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block border-b border-slate-700/60 pb-1.5 mb-2">
                📂 Dasar Pelaksanaan (Surat Tugas)
              </span>
              <p>
                <b>No. Surat Tugas:</b> <span className="text-slate-200">{assurance.surat_tugas?.nomor_surat || "-"}</span>
              </p>
              <p>
                <b>Periode Audit:</b> <span className="text-slate-200">{formatTanggal(assurance.periode_awal)} s/d {formatTanggal(assurance.periode_akhir)}</span>
              </p>
              <p>
                <b>Estimasi Anggaran:</b> <span className="text-slate-200">{assurance.estimasi_anggaran ? formatRupiah(assurance.estimasi_anggaran) : "-"}</span>
              </p>
              <p>
                <b>Sumber Anggaran:</b> <span className="text-slate-200">{assurance.sumber_anggaran || "-"}</span>
              </p>
            </div>

            {/* IDENTITAS PENUGASAN */}
            <div className="bg-slate-900/40 p-4 rounded-xl space-y-2.5 border border-slate-700/50">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block border-b border-slate-700/60 pb-1.5 mb-2">
                🛡️ Identitas Penugasan
              </span>
              <p>
                <b>Kategori / Divisi Terperiksa:</b> <span className="text-slate-200">{assurance.objek_pemeriksaan || "-"}</span>
              </p>
              <p>
                <b>Jenis Audit:</b> <span className="text-slate-200">{assurance.jenis_audit || "-"}</span>
              </p>
              <p>
                <b>Objek Audit:</b> <span className="text-slate-200">{assurance.objek_audit || "-"}</span>
              </p>
              <p>
                <b>Metodologi:</b> <span className="text-slate-200">{assurance.metodologi || "-"}</span>
              </p>
            </div>

            {/* PARAMETER PENGAWASAN */}
            <div className="bg-slate-900/40 p-4 rounded-xl space-y-2.5 border border-slate-700/50">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block border-b border-slate-700/60 pb-1.5 mb-2">
                ⚙️ Parameter Pengawasan
              </span>
              <p>
                <b>Tujuan:</b> <span className="text-slate-200 block mt-0.5 leading-relaxed">{assurance.tujuan || "-"}</span>
              </p>
              <p>
                <b>Ruang Lingkup:</b> <span className="text-slate-200 block mt-0.5 leading-relaxed">{assurance.ruang_lingkup || "-"}</span>
              </p>
              <p>
                <b>Sasaran:</b> <span className="text-slate-200 block mt-0.5 leading-relaxed">{assurance.sasaran || "-"}</span>
              </p>
              <p>
                <b>Area Risiko:</b> <span className="text-slate-200 block mt-0.5 leading-relaxed">{assurance.area_risiko || "-"}</span>
              </p>
            </div>

            {/* TIM PENGAWAS SPI */}
            <div className="bg-slate-900/40 p-4 rounded-xl space-y-2.5 border border-slate-700/50 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2.5">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block border-b border-slate-700/60 pb-1.5 col-span-full mb-1">
                👥 Tim Pengawas & Lokasi
              </span>
              <p>
                <b>Koordinator:</b> <span className="text-slate-200">{assurance.koordinator?.name || "-"}</span>
              </p>
              <p>
                <b>Pengendali Teknis:</b> <span className="text-slate-200">{assurance.pengendali_teknis?.name || "-"}</span>
              </p>
              <p>
                <b>Ketua Tim:</b> <span className="text-slate-200">{assurance.ketua_tim?.name || "-"}</span>
              </p>
              <p>
                <b>Auditor Pelaksana:</b>{" "}
                <span className="text-slate-200">
                  {assurance.auditors && assurance.auditors.length > 0
                    ? assurance.auditors.map((a) => a.name).join(", ")
                    : (assurance.auditor?.name || "-")}
                </span>
              </p>
              <p>
                <b>Lokasi Pemeriksaan:</b> <span className="text-slate-200">{assurance.lokasi || "-"}</span>
              </p>
              <p className="col-span-full">
                <b>Keterangan Tambahan:</b> <span className="text-slate-300 italic block mt-0.5">{assurance.keterangan || "-"}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TAB MENU */}
      {/* <div className="relative flex gap-0 px-2 mt-1.5 mb-4">
        <div className="absolute bottom-0 left-2 right-0 h-[2.5px] bg-blue-600 z-0"></div>

        {[
          { key: "perencanaan", label: "Perencanaan" },
          { key: "pelaksanaan", label: "Pelaksanaan Audit" },
          { key: "analisis", label: "Analisis Penyebab" },
        ].map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`
          relative px-6 py-3 text-sm font-bold tracking-wide
          transition-all duration-200 min-w-[160px] 
          ${
            isActive
              ? "text-black bg-[#f1f5f9] border-3 border-blue-600 border-b-0 z-10 " +
                "after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-[2px] after:h-[2px] after:bg-[#f1f5f9]"
              : "text-slate-400 hover:text-slate-600 border-2 border-transparent border-b-0"
          }
        `}
            >
              {tab.label}
            </button>
          );
        })}
      </div> */}

      {/* TAB MENU */}
      <div className="relative flex items-center justify-between px-2 mt-1.5 mb-4">
        {/* Garis biru panjang tetap di bawah */}
        <div className="absolute bottom-0 left-2 right-0 h-[2.5px] bg-blue-600 z-0"></div>

        <div className="flex gap-0">
          {[
            { key: "perencanaan", label: "Perencanaan" },
            { key: "pelaksanaan", label: "Pelaksanaan Audit" },
            { key: "analisis", label: "Analisis Penyebab" },
          ].map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`
            relative px-6 py-3 text-sm font-bold tracking-wide
            transition-all duration-200 min-w-[160px] 
            ${
              isActive
                ? "text-black bg-[#f1f5f9] border-3 border-blue-600 border-b-0 z-10 " +
                  "after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-[2px] after:h-[2px] after:bg-[#f1f5f9]"
                : "text-slate-400 hover:text-slate-600 border-2 border-transparent border-b-0"
            }
          `}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TOMBOL PRINT KONSEP LAPORAN (Kondisional) */}
        {activeTab === "pelaksanaan" && openInfo && (
          <div className="z-10 pr-4">
            <button
              onClick={handlePrintKonsep} // Ganti dengan fungsi print Anda
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-md transition-all active:scale-95 animate-slide-left mb-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Print Konsep Laporan
            </button>
          </div>
        )}
      </div>

      <div className="relative overflow-hidden min-h-[300px]">
        <div
          key={activeTab}
          className={`transition-all duration-500 ease-in-out
      ${tabDirection === "right" ? "animate-slide-left" : "animate-slide-right"}
    `}
        >
          {activeTab === "perencanaan" && (
            <PerencanaanTab assurance={assurance} onRefresh={fetchDetail} />
          )}
          {activeTab === "pelaksanaan" && (
            <PelaksanaanTab assurance={assurance} onRefresh={fetchDetail} />
          )}
          {activeTab === "analisis" && <AnalisisTab assurance={assurance} onRefresh={fetchDetail} />}
        </div>
      </div>
    </div>
  );
};

export default AssuranceDetail;
