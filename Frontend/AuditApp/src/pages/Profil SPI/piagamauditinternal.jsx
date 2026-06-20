import React, { useRef, useState, useEffect } from "react";
import {
  FileText,
  ShieldCheck,
  Gavel,
  Scale,
  Download,
  Award,
  Upload,
  Calendar,
  X,
  Info,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import apiClient from "../../../../Shared/api/axios";
import useRealTime from "../../hooks/useRealTime";
import { notifySuccess, notifyError } from "../../../../Shared/utils/notifier.jsx";

const PiagamAuditSPI = () => {
  const printRef = useRef();
  const [fileSigned, setFileSigned] = useState(null);
  const [latestDoc, setLatestDoc] = useState(null);

  const clientProfile = {
    namaOrganisasi: "PT. FAJX-TECH",
    sebutanPimpinan: "Direktur Utama",
    sebutanPengawas: "Dewan Komisaris",
    unitAudit: "Satuan Audit Internal",
  };

  const fetchLatest = async () => {
    try {
      const response = await apiClient.get("/api/charter/latest");
      setLatestDoc(response.data);
      console.log("✅ Data terbaru berhasil diambil:", response.data);
    } catch (error) {
      console.error("❌ Gagal mengambil data terbaru:", error);
    }
  };

  // Sinkronisasi Real-Time
  useRealTime('internal_audit_charters', () => {
    fetchLatest();
  });

  // Mengambil data terbaru saat komponen dimuat
  useEffect(() => {
    fetchLatest();
  }, []);

  const handleSaveToDatabase = async () => {
    if (!fileSigned) return notifyError("Pilih file terlebih dahulu!");

    // 1. Ambil token dari localStorage (sesuaikan nama key-nya, biasanya 'token')
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("file", fileSigned);
    formData.append("organization_name", clientProfile.namaOrganisasi);

    try {
      // 2. Tambahkan header Authorization
      const response = await apiClient.post("/api/charter/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`, // <--- Tambahkan baris ini
        },
      });

      if (response.status === 201 || response.status === 200) {
        notifySuccess("Berhasil: " + (response.data.message || "File tersimpan"));
        setLatestDoc(response.data.data);
        setFileSigned(null);
      }
    } catch (error) {
      console.error("Error upload:", error);

      // Pesan error yang lebih spesifik untuk 401
      if (error.response && error.response.status === 401) {
        notifyError("Sesi Anda telah berakhir. Silakan login kembali.");
      } else {
        notifyError("Gagal mengunggah ke database. Periksa koneksi atau backend.");
      }
    }
  };

  const wewenang = [
    `Mengakses seluruh informasi, catatan, personil, dan properti fisik ${clientProfile.namaOrganisasi} yang relevan.`,
    "Menentukan ruang lingkup audit secara mandiri tanpa intervensi pihak luar.",
    `Melakukan komunikasi langsung dengan ${clientProfile.sebutanPimpinan} maupun ${clientProfile.sebutanPengawas}.`,
    "Meminta penjelasan kepada pejabat/pegawai terkait hasil pemeriksaan.",
  ];

  const handleDownloadPdf = async () => {
    if (!latestDoc || !latestDoc.stored_name) {
      notifyError("Dokumen belum tersedia");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await apiClient.get(
        `/api/charter/download/${latestDoc.stored_name}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = latestDoc.file_name || "Piagam_Audit.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download gagal:", error);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setFileSigned(file);
    } else {
      notifyError("Mohon unggah file format PDF");
    }
  };

  return (
    <div className="w-full pb-8 font-sans text-gray-900">
      <div className="w-full">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-6 text-center md:text-left">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-blue-200 shadow-xl text-white">
              <FileText size={40} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-2">
                Piagam Audit Internal
              </h1>
              <p className="text-blue-600 font-bold uppercase tracking-widest text-xs">
                Internal Audit Charter (IAC)
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg active:scale-95 text-sm uppercase tracking-wider"
          >
            <Download size={18} /> Download Draft PDF
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div
              ref={printRef}
              className="bg-white rounded-[2rem] shadow-2xl p-10 md:p-14 border border-gray-100 relative overflow-hidden"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none transform -rotate-12">
                <ShieldCheck size={500} />
              </div>

              <div className="relative z-10">
                <section className="mb-10 text-center border-b pb-8 border-gray-100">
                  <h2 className="text-xl font-black uppercase mb-1">
                    {clientProfile.namaOrganisasi}
                  </h2>
                  <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                    Kepatuhan Standar IPPF / IIA
                  </p>
                </section>

                <section className="mb-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-6 w-1 bg-blue-600 rounded-full"></div>
                    <h2 className="text-lg font-extrabold uppercase">
                      I. Misi & Definisi
                    </h2>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed text-justify indent-8">
                    Audit Internal adalah aktivitas asurans dan konsultasi yang
                    independen dan objektif, yang dirancang untuk memberikan
                    nilai tambah dan memperbaiki operasional organisasi.{" "}
                    {clientProfile.unitAudit} membantu organisasi mencapai
                    tujuannya dengan membawa pendekatan yang sistematis dan
                    disiplin untuk mengevaluasi dan meningkatkan efektivitas
                    proses manajemen risiko, pengendalian, dan tata kelola.
                  </p>
                </section>

                <section className="mb-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-6 w-1 bg-blue-600 rounded-full"></div>
                    <h2 className="text-lg font-extrabold uppercase">
                      II. Wewenang Utama
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {wewenang.map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex gap-3 hover:bg-blue-50 transition-colors"
                      >
                        <Gavel className="text-blue-600 shrink-0" size={16} />
                        <p className="text-xs text-gray-700 font-semibold leading-relaxed">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="mb-10 bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-100">
                  <div className="flex items-start gap-4">
                    <Scale size={32} className="opacity-40 shrink-0" />
                    <div>
                      <h3 className="text-md font-bold mb-2 uppercase">
                        Independensi & Objektivitas
                      </h3>
                      <p className="text-blue-50 leading-relaxed text-[11px]">
                        {clientProfile.unitAudit} harus bebas dari campur tangan
                        pihak manapun dalam menentukan ruang lingkup audit,
                        pelaksanaan kerja, dan pelaporan hasil pemeriksaan untuk
                        memastikan integritas hasil audit.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="mt-16 pt-8 border-t border-gray-100">
                  <div className="flex justify-around items-center">
                    <div className="text-center">
                      <p className="text-xs font-bold mb-14 uppercase underline decoration-blue-600 underline-offset-4">
                        {clientProfile.sebutanPimpinan}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
                        Mengetahui,
                        <br />
                        {clientProfile.sebutanPimpinan}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold mb-14 uppercase underline decoration-blue-600 underline-offset-4">
                        Kepala {clientProfile.unitAudit}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
                        Mengajukan,
                        <br />
                        Kepala {clientProfile.unitAudit}
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-black uppercase mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-blue-600" /> Detail
                Administrasi
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">
                    Terbitan Terakhir
                  </p>
                  <p className="text-xs font-bold">
                    {latestDoc && latestDoc.created_at
                      ? new Date(latestDoc.created_at).toLocaleDateString(
                          "id-ID",
                          { month: "long", year: "numeric" },
                        )
                      : "Belum Ada Data"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">
                    Siklus Peninjauan
                  </p>
                  <p className="text-xs font-bold">12 Bulan Sekali</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-black uppercase mb-4 flex items-center gap-2 text-gray-900">
                <Upload size={18} className="text-blue-600" /> Upload Scan
                Piagam
              </h3>

              {!fileSigned ? (
                <label className="border-2 border-dashed border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf"
                  />
                  <div className="bg-gray-50 p-3 rounded-full group-hover:bg-blue-100 transition-colors">
                    <Upload
                      className="text-gray-300 group-hover:text-blue-600"
                      size={24}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 mt-3 text-center uppercase tracking-tighter">
                    Klik untuk unggah hasil scan PDF
                  </span>
                </label>
              ) : (
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 relative">
                  <button
                    onClick={() => setFileSigned(null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <X size={12} />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg text-blue-600">
                      <FileText size={20} />
                    </div>
                    <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                      <p className="text-[10px] font-black text-gray-900 truncate">
                        {fileSigned.name}
                      </p>
                      <p className="text-[9px] text-gray-500 uppercase font-bold">
                        {(fileSigned.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  {/* Tambahkan onClick={handleSaveToDatabase} di sini */}
                  <button
                    onClick={handleSaveToDatabase}
                    className="w-full mt-4 bg-blue-600 text-white py-2.5 rounded-xl text-[10px] font-black shadow-lg shadow-blue-200 uppercase tracking-[0.1em] hover:bg-blue-700 transition-all active:scale-95"
                  >
                    Simpan Ke Database
                  </button>
                </div>
              )}
            </div>

            <div className="bg-gray-900 p-6 rounded-3xl shadow-xl text-white">
              <div className="flex items-center gap-2 mb-3">
                <Info size={16} className="text-blue-400" />
                <p className="text-[10px] font-black uppercase tracking-widest">
                  Penting
                </p>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                Sesuai standar IIA, piagam ini harus disetujui secara resmi oleh
                pimpinan tertinggi dan dewan pengawas untuk menjamin otoritas
                penuh tim audit.
              </p>
            </div>
          </div>
        </div>
        <p className="text-center mt-10 text-gray-400 text-xs">
          Dokumen ini ditinjau dan diperbarui secara berkala sesuai dengan
          standar profesional Audit Internal.
        </p>
      </div>
    </div>
  );
};

export default PiagamAuditSPI;
