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
        "Menyusun dan menetapkan rencana kerja audit tahunan (PKPT).",
        "Melaporkan hasil pengawasan secara langsung kepada pimpinan tertinggi (Rektor).",
        "Memantau tindak lanjut hasil temuan audit."
      ]
    },
    {
      id: 2,
      role: "Sekretaris SPI",
      icon: <ClipboardList className="text-blue-600" />,
      tasks: [
        "Mengelola administrasi dan persuratan Satuan Pengawas Internal.",
        "Menyusun laporan realisasi anggaran dan kegiatan SPI.",
        "Mengkoordinasikan penyusunan laporan periodik SPI.",
        "Mendokumentasikan seluruh kertas kerja audit (KKA)."
      ]
    },
    {
      id: 3,
      role: "Bidang Audit Keuangan & Sarpras",
      icon: <Briefcase className="text-blue-600" />,
      tasks: [
        "Melakukan pemeriksaan atas kewajaran laporan keuangan.",
        "Melakukan audit kepatuhan terhadap pengelolaan aset dan sarana prasarana.",
        "Memberikan saran perbaikan atas efisiensi penggunaan anggaran."
      ]
    },
    {
      id: 4,
      role: "Bidang Audit Akademik & SDM",
      icon: <GraduationCap className="text-blue-600" />,
      tasks: [
        "Melakukan evaluasi atas kepatuhan standar akademik.",
        "Melakukan audit terhadap proses rekrutmen dan pengembangan SDM.",
        "Memastikan kegiatan tridharma berjalan sesuai prosedur yang ditetapkan."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* --- SECTION 1: STRUKTUR ORGANISASI (VISUAL) --- */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-4">
            Struktur Organisasi SPI
          </h2>
          <div className="h-1.5 w-20 bg-blue-600 mx-auto rounded-full mb-12"></div>
          
          {/* Bagan Sederhana Modern */}
          <div className="flex flex-col items-center gap-8">
            {/* Top Level */}
            <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-xl w-64 transform transition-hover hover:scale-105">
              <ShieldCheck className="mx-auto mb-2" size={32} />
              <p className="text-xs uppercase font-bold tracking-widest opacity-80">Ketua SPI</p>
              <h4 className="font-bold text-lg leading-tight">Dr. Nama Ketua, M.Si.</h4>
            </div>

            {/* Line */}
            <div className="h-8 w-1 bg-gray-300"></div>

            {/* Mid Level */}
            <div className="bg-white border-2 border-blue-600 text-blue-600 p-4 rounded-xl shadow-md w-56">
              <p className="text-[10px] uppercase font-bold tracking-widest">Sekretaris</p>
              <h4 className="font-bold">Nama Sekretaris, S.E.</h4>
            </div>

            {/* Line Splitter */}
            <div className="h-8 w-1 bg-gray-300"></div>
            <div className="w-full max-w-2xl h-1 bg-gray-300 rounded-full relative">
               <div className="absolute left-0 top-0 h-8 w-1 bg-gray-300 mx-auto translate-x-[-50%] left-[0%]"></div>
               <div className="absolute right-0 top-0 h-8 w-1 bg-gray-300 mx-auto translate-x-[50%] right-[0%]"></div>
            </div>

            {/* Bottom Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-3xl mt-4">
              <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
                <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-1">Audit Bidang I</p>
                <h4 className="font-bold text-gray-800">Keuangan & Sarpras</h4>
              </div>
              <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
                <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-1">Audit Bidang II</p>
                <h4 className="font-bold text-gray-800">Akademik & SDM</h4>
              </div>
            </div>
          </div>
        </div>

        {/* --- SECTION 2: TUGAS & FUNGSI (ACCORDION) --- */}
        <div className="mt-24">
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
