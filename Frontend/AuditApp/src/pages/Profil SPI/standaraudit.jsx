import React from 'react';
import { BookOpen, CheckCircle, ShieldCheck, Globe, Scale, Award, Info } from 'lucide-react';

const StandarAuditSpiPage = () => {
  const standarUtama = [
    {
      title: "SAIPI",
      subtitle: "Standar Audit Intern Pemerintah Indonesia",
      desc: "Merupakan acuan wajib bagi seluruh aparat pengawasan intern pemerintah (APIP) di Indonesia dalam melaksanakan tugas pengawasan.",
      points: ["Standar Prinsip Etika", "Standar Umum", "Standar Pelaksanaan Kerja", "Standar Komunikasi"]
    },
    {
      title: "IPPF / IIA Standards",
      subtitle: "International Professional Practices Framework",
      desc: "Standar internasional yang diterbitkan oleh The Institute of Internal Auditors (IIA) untuk menjaga kualitas audit internal secara global.",
      points: ["Independensi & Objektivitas", "Kemahiran Profesional", "Program Penjaminan Kualitas", "Pengelolaan Aktivitas Audit"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <Award size={14} /> Audit Methodology
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight sm:text-5xl uppercase">
            Standar <span className="text-purple-600">Audit</span>
          </h1>
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
            Satuan Pengawas Internal (SPI) berkomitmen melaksanakan tugas pengawasan dengan kepatuhan penuh terhadap standar audit yang berlaku secara nasional dan internasional.
          </p>
        </div>

        {/* --- MAIN STANDARDS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {standarUtama.map((std, idx) => (
            <div key={idx} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300">
              <div className="p-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-purple-50 p-4 rounded-2xl text-purple-600">
                    <Globe size={32} />
                  </div>
                  <span className="text-4xl font-black text-gray-100 uppercase">{std.title}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{std.subtitle}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-8">
                  {std.desc}
                </p>
                <div className="space-y-3">
                  {std.points.map((point, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle size={18} className="text-green-500" />
                      <span className="text-sm font-semibold text-gray-700">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- KUALITAS AUDIT SECTION --- */}
        <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="shrink-0">
               <div className="relative">
                 <div className="w-48 h-48 bg-purple-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-purple-200">
                    <ShieldCheck size={80} />
                 </div>
                 <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-2xl shadow-lg">
                    <Scale size={24} className="text-purple-600" />
                 </div>
               </div>
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Penjaminan & Peningkatan Kualitas</h2>
              <p className="text-gray-600 leading-relaxed text-sm mb-6 text-justify">
                Sesuai standar, SPI secara berkala melakukan program penjaminan kualitas baik secara internal (self-assessment) maupun eksternal oleh pihak independen setiap 5 tahun sekali. Hal ini dilakukan untuk memastikan bahwa fungsi audit tetap memberikan nilai tambah yang maksimal bagi organisasi.
              </p>
              <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                <Info className="text-purple-600 shrink-0 mt-1" size={20} />
                <p className="text-xs text-purple-800 font-medium">
                  Kepatuhan terhadap standar merupakan kewajiban mutlak bagi setiap personil SPI untuk menjamin objektivitas dan integritas hasil pengawasan.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* --- FOOTER BANNER --- */}
        <div className="mt-12 text-center text-gray-400">
          <p className="text-xs uppercase tracking-[0.2em] font-bold">Standardized & Professional Internal Audit</p>
        </div>

      </div>
    </div>
  );
};

export default StandarAuditSpiPage;