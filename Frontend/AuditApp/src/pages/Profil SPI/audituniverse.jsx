import React from 'react';
import { Network, Database, Landmark, BookOpen, Monitor, ShieldAlert, Globe, Layers } from 'lucide-react';

const AuditUniverseSPI = () => {
  const categories = [
    {
      title: "Unit Akademik",
      icon: <BookOpen className="text-blue-600" />,
      items: ["Fakultas & Sekolah", "Lembaga Penelitian", "Lembaga Pengabdian Masyarakat", "Perpustakaan Pusat"],
      color: "bg-blue-50"
    },
    {
      title: "Unit Non-Akademik",
      icon: <Landmark className="text-purple-600" />,
      items: ["Biro Keuangan", "Biro Kepegawaian / SDM", "Biro Umum & Sarpras", "Unit Usaha / Business Center"],
      color: "bg-purple-50"
    },
    {
      title: "Infrastruktur & TI",
      icon: <Monitor className="text-orange-600" />,
      items: ["Pusat Data (Data Center)", "Sistem Informasi Akademik", "Infrastruktur Jaringan", "Pengadaan Hardware"],
      color: "bg-orange-50"
    },
    {
      title: "Area Tematik",
      icon: <ShieldAlert className="text-red-600" />,
      items: ["Manajemen Risiko", "Audit Investigasi", "Evaluasi Kinerja", "Kepatuhan Regulasi"],
      color: "bg-red-50"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <Globe size={14} /> Scope of Work
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Audit <span className="text-indigo-600">Universe</span>
          </h1>
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
            Pemetaan menyeluruh terhadap seluruh objek audit (Auditee) yang menjadi ruang lingkup pengawasan Satuan Pengawas Internal.
          </p>
        </div>

        {/* --- VISUAL CONCEPT (HUB) --- */}
        <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-gray-100 mb-12 relative overflow-hidden">
          <div className="flex flex-col items-center relative z-10">
            <div className="bg-indigo-600 text-white p-8 rounded-full shadow-2xl shadow-indigo-200 animate-pulse">
              <Network size={48} />
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-2xl font-bold text-gray-900">Pusat Kendali Pengawasan</h2>
              <p className="text-gray-400 text-sm">Terintegrasi ke seluruh lini organisasi</p>
            </div>
          </div>
          
          {/* Background Decor */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
             <Layers size={600} />
          </div>
        </div>

        {/* --- CATEGORY GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((cat, index) => (
            <div key={index} className="group">
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-2xl hover:border-indigo-200 transition-all duration-500 h-full relative overflow-hidden">
                {/* Accent Background */}
                <div className={`absolute top-0 right-0 w-32 h-32 ${cat.color} rounded-bl-[5rem] -mr-8 -mt-8 transition-transform group-hover:scale-110`}></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-white p-3 rounded-2xl shadow-md">
                      {cat.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{cat.title}</h3>
                  </div>

                  <ul className="space-y-3">
                    {cat.items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-gray-600 group/item">
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full group-hover/item:w-4 transition-all"></div>
                        <span className="text-sm font-medium group-hover/item:text-indigo-600 transition-colors">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- SUMMARY BOX --- */}
        <div className="mt-16 bg-white border border-gray-200 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="bg-indigo-50 p-6 rounded-2xl shrink-0">
            <Database className="text-indigo-600" size={40} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Basis Data Objek Audit</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              Daftar Audit Universe ini diperbarui setiap tahun melalui proses *risk assessment* untuk memastikan bahwa area dengan risiko tertinggi mendapatkan prioritas pengawasan yang tepat dalam PKPT (Program Kerja Pengawasan Tahunan).
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuditUniverseSPI;