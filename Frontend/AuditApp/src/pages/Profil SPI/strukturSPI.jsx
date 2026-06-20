import React, { useState } from 'react';
import { Users, User, ChevronDown, ChevronUp, Briefcase, GraduationCap, ClipboardList, ShieldCheck } from 'lucide-react';

const StrukturSpiPage = () => {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (id) => {
    setOpenSection(openSection === id ? null : id);
  };

  const tupoksiData = [
    {
      id: 1,
      role: "Ketua SPI",
      icon: <User className="text-blue-600" />,
      tasks: [
        "Mengkoordinasikan seluruh kegiatan pengawasan internal di lingkungan organisasi.",
        "Menyusun dan menetapkan Rencana Program Kerja Pengawasan Tahunan (PKPT).",
        "Melaporkan hasil pemeriksaan dan evaluasi secara langsung kepada pimpinan tertinggi.",
        "Memberikan rekomendasi strategis untuk perbaikan tata kelola, manajemen risiko, dan pengendalian."
      ]
    },
    {
      id: 2,
      role: "Sekretaris SPI",
      icon: <ClipboardList className="text-blue-600" />,
      tasks: [
        "Mengelola administrasi, persuratan, dan kearsipan Satuan Pengawas Internal.",
        "Menyusun laporan realisasi anggaran, kinerja, dan kegiatan operasional SPI.",
        "Mengkoordinasikan penyusunan laporan hasil audit dan laporan periodik.",
        "Mendokumentasikan seluruh Kertas Kerja Audit (KKA) dan database pemeriksaan."
      ]
    },
    {
      id: 3,
      role: "Bidang Audit Keuangan & Aset",
      icon: <Briefcase className="text-blue-600" />,
      tasks: [
        "Melakukan pemeriksaan atas kewajaran dan kepatuhan penyajian laporan keuangan.",
        "Melakukan audit kepatuhan terhadap pengelolaan aset, inventaris, dan sarana prasarana.",
        "Memberikan saran perbaikan atas efisiensi dan efektivitas penggunaan anggaran.",
        "Mengevaluasi sistem pengendalian internal atas pelaporan keuangan."
      ]
    },
    {
      id: 4,
      role: "Bidang Audit Operasional & Kinerja",
      icon: <GraduationCap className="text-blue-600" />,
      tasks: [
        "Melakukan evaluasi atas efektivitas dan efisiensi program kerja tiap unit operasional/akademik.",
        "Melakukan audit terhadap proses rekrutmen, kompensasi, dan pengembangan SDM.",
        "Memastikan kegiatan inti organisasi berjalan sesuai Standard Operating Procedure (SOP).",
        "Mengevaluasi pencapaian Key Performance Indicators (KPI) manajemen."
      ]
    },
    {
      id: 5,
      role: "Bidang Audit Sistem Informasi & Investigasi",
      icon: <ShieldCheck className="text-blue-600" />,
      tasks: [
        "Melakukan audit terhadap keamanan, keandalan, dan efektivitas tata kelola Teknologi Informasi.",
        "Melakukan pemeriksaan khusus (investigasi) atas indikasi kecurangan (fraud) atau pelanggaran berat.",
        "Memberikan dukungan forensik digital dan analisis data audit.",
        "Mengawasi kepatuhan terhadap kebijakan perlindungan data."
      ]
    }
  ];

  return (
    <div className="w-full pb-8">
      <div className="w-full">
        
        {/* --- SECTION 1: STRUKTUR ORGANISASI (VISUAL) --- */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-4">
            Struktur Organisasi SPI
          </h2>
          <div className="h-1.5 w-20 bg-blue-600 mx-auto rounded-full mb-12"></div>
          
          {/* Bagan Sederhana Modern */}
          <div className="flex flex-col items-center gap-0">
            {/* Pimpinan Tertinggi */}
            <div className="bg-slate-800 text-white p-4 rounded-xl shadow-xl w-64 transform transition-hover hover:scale-105 z-10">
              <p className="text-xs uppercase font-bold tracking-widest opacity-80 mb-1">Pimpinan Tertinggi</p>
              <h4 className="font-bold text-lg leading-tight">Direktur Utama / Rektor</h4>
            </div>

            {/* Line Down */}
            <div className="h-8 w-1 bg-gray-300"></div>

            {/* Top Level SPI */}
            <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-xl w-64 transform transition-hover hover:scale-105 z-10 relative">
              <ShieldCheck className="mx-auto mb-2" size={32} />
              <p className="text-xs uppercase font-bold tracking-widest opacity-80">Ketua SPI</p>
              <h4 className="font-bold text-lg leading-tight mt-1">Nama Ketua SPI</h4>
            </div>

            {/* Line Down */}
            <div className="h-8 w-1 bg-gray-300 relative z-0"></div>

            {/* Sekretaris */}
            <div className="bg-white border-2 border-blue-600 text-blue-600 p-4 rounded-xl shadow-md w-56 z-10 relative">
              <p className="text-[10px] uppercase font-bold tracking-widest">Sekretaris</p>
              <h4 className="font-bold text-sm mt-1">Nama Sekretaris SPI</h4>
            </div>

            {/* Line Down */}
            <div className="h-8 w-1 bg-gray-300"></div>

            {/* Line Splitter Horizontal */}
            <div className="w-full max-w-4xl border-t-[3px] border-gray-300 relative">
               {/* 3 vertical lines */}
               <div className="absolute left-[15%] md:left-[16.6%] top-0 h-8 w-1 bg-gray-300 -translate-x-1/2"></div>
               <div className="absolute left-[50%] top-0 h-8 w-1 bg-gray-300 -translate-x-1/2"></div>
               <div className="absolute left-[85%] md:left-[83.3%] top-0 h-8 w-1 bg-gray-300 -translate-x-1/2"></div>
            </div>

            {/* Bottom Level */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-8 px-4">
              <div className="bg-gray-100 p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-1">Audit Bidang I</p>
                <h4 className="font-bold text-gray-800 text-sm md:text-base">Keuangan & Aset</h4>
              </div>
              <div className="bg-gray-100 p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-1">Audit Bidang II</p>
                <h4 className="font-bold text-gray-800 text-sm md:text-base">Operasional & Kinerja</h4>
              </div>
              <div className="bg-gray-100 p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-1">Audit Bidang III</p>
                <h4 className="font-bold text-gray-800 text-sm md:text-base">Sistem Informasi & Investigasi</h4>
              </div>
            </div>
          </div>
        </div>

        {/* --- SECTION 2: TUGAS & FUNGSI (ACCORDION) --- */}
        <div className="mt-24 px-4 sm:px-8">
          <div className="flex items-center gap-4 mb-10">
            <Users className="text-blue-600 w-8 h-8" />
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Tugas dan Fungsi</h2>
          </div>

          <div className="space-y-4">
            {tupoksiData.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => toggleSection(item.id)}
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-blue-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-extrabold text-gray-800">{item.role}</h3>
                  </div>
                  {openSection === item.id ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                </button>

                <div className={`transition-all duration-300 ease-in-out ${openSection === item.id ? 'max-h-[500px] opacity-100 border-t' : 'max-h-0 opacity-0'} overflow-hidden`}>
                  <div className="p-6 bg-blue-50/30">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {item.tasks.map((task, idx) => (
                        <li key={idx} className="flex items-start gap-3 bg-white p-3 rounded-xl shadow-sm border border-blue-100">
                          <div className="mt-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full shrink-0"></div>
                          <span className="text-sm text-gray-600 font-medium leading-relaxed">{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StrukturSpiPage;
