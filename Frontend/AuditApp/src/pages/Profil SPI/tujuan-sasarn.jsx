import React from 'react';
import { 
  Compass, 
  Flag, 
  Settings, 
  CheckCircle, 
  BarChart3, 
  ShieldAlert, 
  Zap, 
  SearchCheck 
} from 'lucide-react';

const StrategiPengawasanSPI = () => {
  const sasarans = [
    "Meningkatnya akuntabilitas dan transparansi pengelolaan keuangan.",
    "Tercapainya kepatuhan terhadap peraturan perundang-undangan.",
    "Terwujudnya efektivitas dan efisiensi operasional di setiap unit.",
    "Meminimalisir risiko melalui sistem pengendalian internal yang kuat."
  ];

  const strategiLangkah = [
    {
      title: "Risk-Based Audit",
      desc: "Menyusun rencana audit berdasarkan analisis risiko untuk menentukan skala prioritas pengawasan.",
      icon: <ShieldAlert className="w-6 h-6" />
    },
    {
      title: "Consulting & Advisory",
      desc: "Memberikan layanan konsultasi bagi unit kerja untuk perbaikan sistem dan prosedur.",
      icon: <Zap className="w-6 h-6" />
    },
    {
      title: "Monitoring Tindak Lanjut",
      desc: "Memastikan seluruh rekomendasi hasil audit diimplementasikan secara tepat dan cepat.",
      icon: <SearchCheck className="w-6 h-6" />
    },
    {
      title: "Pemanfaatan Teknologi",
      desc: "Menggunakan Audit Management System untuk pengawasan yang lebih akurat dan real-time.",
      icon: <Settings className="w-6 h-6" />
    }
  ];

  return (
    <div className="w-full pb-8">
      <div className="w-full">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Tujuan & <span className="text-blue-600">Strategi Pengawasan</span>
          </h1>
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto italic">
            "Mengawal integritas melalui pengawasan yang terukur dan strategi yang adaptif."
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- TUJUAN (Sidebar Style) --- */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-blue-50 h-full">
              <div className="bg-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-blue-200 shadow-lg">
                <Compass className="text-white w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Tujuan Pengawasan</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Memberikan keyakinan memadai (*reasonable assurance*) bahwa tata kelola, manajemen risiko, dan pengendalian internal organisasi telah berjalan sesuai standar untuk mencapai tujuan institusi.
              </p>
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-sm text-blue-800 font-medium italic">
                  "Internal audit is not just about finding mistakes, it's about adding value."
                </p>
              </div>
            </div>
          </div>

          {/* --- SASARAN (List Style) --- */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 h-full">
              <div className="flex items-center gap-3 mb-8">
                <Flag className="text-blue-600 w-7 h-7" />
                <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Sasaran Strategis</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sasarans.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-200 transition-all group">
                    <CheckCircle className="text-green-500 w-6 h-6 shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="text-gray-700 font-semibold text-sm leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- STRATEGI PENGAWASAN (Flow/Step Style) --- */}
        <div className="mt-12">
          <div className="flex items-center gap-4 mb-10">
            <BarChart3 className="text-blue-600 w-8 h-8" />
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Strategi Pengawasan</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {strategiLangkah.map((step, index) => (
              <div key={index} className="relative group">
                {/* Connector Line (Desktop Only) */}
                {index !== strategiLangkah.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gray-200 z-0"></div>
                )}
                
                <div className="relative z-10 bg-white p-6 rounded-3xl border border-gray-100 shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {step.desc}
                  </p>
                  <div className="mt-4 text-xs font-bold text-gray-300 group-hover:text-blue-200 uppercase tracking-widest">
                    Step 0{index + 1}
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

export default StrategiPengawasanSPI;
