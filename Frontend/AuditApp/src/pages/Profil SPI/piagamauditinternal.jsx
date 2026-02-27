import React from 'react';
import { FileText, ShieldCheck, Gavel, Scale, Download, CheckCircle, Award } from 'lucide-react';

const PiagamAuditSPI = () => {
  const wewenang = [
    "Mengakses seluruh informasi, catatan, personil, dan properti fisik Universitas yang relevan.",
    "Menentukan ruang lingkup audit secara mandiri tanpa intervensi pihak luar.",
    "Melakukan komunikasi langsung dengan Rektor maupun Dewan Pengawas.",
    "Meminta penjelasan kepada pejabat/pegawai terkait hasil pemeriksaan."
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
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
          <button className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg active:scale-95 text-sm uppercase tracking-wider">
            <Download size={18} /> Download PDF
          </button>
        </div>

        {/* --- BODY DOKUMEN --- */}
        <div className="bg-white rounded-[2rem] shadow-2xl p-10 md:p-16 border border-gray-100 relative overflow-hidden">
          {/* Watermark Logo SPI (Hanya Dekorasi) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none transform -rotate-12">
            <ShieldCheck size={500} />
          </div>

          <div className="relative z-10">
            {/* 1. Pengertian */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-1.5 bg-blue-600 rounded-full"></div>
                <h2 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight">I. Definisi & Kedudukan</h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-justify indent-8">
                Piagam Audit Internal adalah dokumen formal yang mendefinisikan tujuan, wewenang, dan tanggung jawab Satuan Pengawas Internal (SPI). Dokumen ini merupakan mandat resmi bagi SPI untuk melaksanakan tugas pengawasan secara independen dan objektif guna mendukung tercapainya tata kelola organisasi yang baik.
              </p>
            </section>

            {/* 2. Wewenang (Grid Style) */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1.5 bg-blue-600 rounded-full"></div>
                <h2 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight">II. Wewenang Utama</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wewenang.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex gap-4 hover:bg-blue-50 transition-colors">
                    <Gavel className="text-blue-600 shrink-0 mt-1" size={20} />
                    <p className="text-sm text-gray-700 font-semibold leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Prinsip Independensi */}
            <section className="mb-12 bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-200">
              <div className="flex items-start gap-4">
                <Scale size={48} className="opacity-40" />
                <div>
                  <h3 className="text-xl font-bold mb-3">Independensi & Objektivitas</h3>
                  <p className="text-blue-50 leading-relaxed text-sm">
                    SPI harus bebas dari campur tangan pihak manapun dalam menentukan ruang lingkup audit, pelaksanaan kerja, dan pelaporan hasil pemeriksaan. Auditor internal harus memiliki sikap mental yang tidak memihak dan menghindari konflik kepentingan.
                  </p>
                </div>
              </div>
            </section>

            {/* 4. Pengesahan (Signature Area) */}
            <section className="mt-20 pt-12 border-t border-gray-100">
              <div className="text-center mb-10">
                <Award className="mx-auto text-gray-300 mb-2" size={32} />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Mengesahkan</p>
              </div>
              <div className="flex flex-col md:flex-row justify-around items-center gap-12">
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900 mb-20 uppercase tracking-wider underline decoration-blue-600 decoration-2 underline-offset-4">Rektor Universitas</p>
                  <p className="text-xs text-gray-400">Pimpinan Tertinggi</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900 mb-20 uppercase tracking-wider underline decoration-blue-600 decoration-2 underline-offset-4">Ketua SPI</p>
                  <p className="text-xs text-gray-400">Kepala Pengawas Internal</p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Info */}
        <p className="text-center mt-10 text-gray-400 text-xs">
          Dokumen ini ditinjau dan diperbarui secara berkala sesuai dengan standar profesional Audit Internal.
        </p>
      </div>
    </div>
  );
};

export default PiagamAuditSPI;