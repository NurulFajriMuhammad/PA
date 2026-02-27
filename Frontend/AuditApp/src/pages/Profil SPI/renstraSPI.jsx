import React from 'react';
import { 
  Rocket, 
  Flag, 
  BarChart, 
  Cpu, 
  TrendingUp, 
  ChevronRight, 
  ShieldCheck, 
  Target 
} from 'lucide-react';

const RenstraSPI = () => {
  const pilarStrategis = [
    {
      title: "Digital Transformation",
      desc: "Membangun ekosistem pengawasan berbasis data (Continuous Auditing) untuk meningkatkan akurasi dan kecepatan pelaporan.",
      icon: <Cpu className="text-blue-600" />
    },
    {
      title: "Human Capital Excellence",
      desc: "Meningkatkan persentase auditor bersertifikasi internasional (CISA, CIA, CFE) hingga 100% pada tahun terakhir renstra.",
      icon: <Rocket className="text-purple-600" />
    },
    {
      title: "Added Value Services",
      desc: "Transformasi peran SPI dari sekadar pengawas (watchdog) menjadi mitra strategis dan konsultan manajemen yang tepercaya.",
      icon: <BarChart className="text-emerald-600" />
    }
  ];

  const roadmapSteps = [
    {
      phase: "Fase I (Tahun 1)",
      title: "Strengthening Foundations",
      focus: "Penyempurnaan regulasi internal, audit charter, dan standardisasi kertas kerja berbasis IT."
    },
    {
      phase: "Fase II (Tahun 2-3)",
      title: "Innovation & Integration",
      focus: "Implementasi Enterprise Risk Management (ERM) yang terintegrasi dengan sistem pemantauan audit."
    },
    {
      phase: "Fase III (Tahun 4-5)",
      title: "World Class Audit",
      focus: "Mencapai level maturitas tertinggi dan menjadi benchmark bagi institusi serupa di tingkat nasional/global."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <Target size={14} /> Strategic Plan 2025-2029
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight sm:text-5xl uppercase">
            Rencana Jangka <span className="text-blue-600">Panjang SPI</span>
          </h1>
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Peta jalan strategis untuk membangun fungsi pengawasan yang modern, tangguh, dan memberikan nilai tambah maksimal bagi visi organisasi.
          </p>
        </div>

        {/* --- PILAR STRATEGIS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {pilarStrategis.map((pilar, index) => (
            <div key={index} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                {pilar.icon}
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-4">{pilar.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {pilar.desc}
              </p>
            </div>
          ))}
        </div>

        {/* --- ROADMAP SECTION --- */}
        <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-xl border border-gray-50 relative overflow-hidden">
          <div className="flex items-center gap-4 mb-12">
            <TrendingUp className="text-blue-600 w-8 h-8" />
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Roadmap Strategis</h2>
          </div>

          <div className="space-y-8 relative">
            {/* Vertical Line on Mobile */}
            <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-blue-100 md:hidden"></div>

            {roadmapSteps.map((step, index) => (
              <div key={index} className="flex flex-col md:flex-row items-start md:items-center gap-6 relative group">
                {/* Year Badge */}
                <div className="shrink-0 w-full md:w-48 bg-blue-50 text-blue-700 px-6 py-4 rounded-2xl font-black text-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  {step.phase}
                </div>

                <div className="hidden md:block">
                  <ChevronRight className="text-blue-200" />
                </div>

                {/* Content */}
                <div className="flex-1 bg-gray-50 p-6 rounded-2xl border border-transparent group-hover:border-blue-100 group-hover:bg-white transition-all">
                  <h4 className="text-lg font-bold text-gray-900 mb-1">{step.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.focus}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Background Ornament */}
          <div className="absolute bottom-[-10%] right-[-5%] opacity-[0.03] pointer-events-none">
            <Rocket size={400} />
          </div>
        </div>

        {/* --- VISION STATEMENT --- */}
        <div className="mt-16 text-center">
          <div className="inline-block p-8 bg-blue-50 rounded-[2rem] border border-blue-100">
            <ShieldCheck className="mx-auto text-blue-600 mb-4" size={40} />
            <h3 className="text-xl font-bold text-blue-900 mb-2 italic">
              "Menuju Pengawasan Internal Berstandar Global"
            </h3>
            <p className="text-sm text-blue-700/70 max-w-lg mx-auto leading-relaxed">
              Kami berkomitmen untuk terus berinovasi guna memastikan setiap aset dan proses organisasi terlindungi dan berjalan dengan integritas tinggi.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RenstraSPI;