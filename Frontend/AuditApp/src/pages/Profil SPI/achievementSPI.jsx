import React from 'react';
import { Award, Trophy, Star, TrendingUp, CheckCircle, ShieldCheck, Medal } from 'lucide-react';

const AchievementSPI = () => {
  const stats = [
    { label: "Temuan Ditindaklanjuti", value: "98%", icon: <CheckCircle className="text-green-500" /> },
    { label: "Audit Selesai", value: "120+", icon: <TrendingUp className="text-blue-500" /> },
    { label: "Sertifikasi Tim", value: "15", icon: <Award className="text-purple-500" /> },
    { label: "Tahun Mengabdi", value: "10", icon: <ShieldCheck className="text-orange-500" /> },
  ];

  const milestones = [
    {
      year: "2024",
      title: "Penghargaan Maturitas SPI Tingkat Nasional",
      desc: "Berhasil meraih level maturitas tinggi dalam penilaian kapabilitas APIP oleh BPKP.",
      icon: <Trophy className="text-yellow-500" />
    },
    {
      year: "2023",
      title: "Implementasi Digital Audit System",
      desc: "Transformasi penuh proses audit dari manual ke sistem berbasis paperless yang terintegrasi.",
      icon: <Star className="text-blue-500" />
    },
    {
      year: "2022",
      title: "Opini Wajar Tanpa Pengecualian (WTP)",
      desc: "Kontribusi aktif dalam pengawasan laporan keuangan sehingga mempertahankan opini WTP berturut-turut.",
      icon: <Medal className="text-orange-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-16">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200">
            <Trophy className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">
            Pencapaian <span className="text-blue-600">& Milestones</span>
          </h1>
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
            Rekam jejak dedikasi SPI dalam menjaga standar kualitas dan akuntabilitas organisasi dari tahun ke tahun.
          </p>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-all">
              <div className="mb-3 bg-gray-50 p-3 rounded-2xl">
                {item.icon}
              </div>
              <h2 className="text-3xl font-black text-gray-900">{item.value}</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        {/* --- TIMELINE PENCAPAIAN --- */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gray-200 h-full hidden md:block"></div>

          <div className="space-y-12">
            {milestones.map((item, index) => (
              <div key={index} className={`flex items-center w-full ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                <div className="hidden md:block w-1/2"></div>
                
                {/* Dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-10 h-10 bg-white border-4 border-blue-600 rounded-full z-10 flex items-center justify-center hidden md:flex">
                   <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>

                {/* Content Card */}
                <div className="w-full md:w-1/2 p-4">
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-gray-100 hover:border-blue-200 transition-all group relative overflow-hidden">
                    {/* Year Label */}
                    <span className="absolute top-0 right-0 bg-blue-600 text-white px-6 py-2 rounded-bl-3xl font-black text-lg">
                      {item.year}
                    </span>
                    
                    <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-extrabold text-gray-900 mb-2 leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- BOTTOM CTA --- */}
        <div className="mt-20 bg-gradient-to-r from-gray-900 to-blue-900 rounded-[3rem] p-12 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Ingin Mengetahui Lebih Lanjut?</h2>
            <p className="text-blue-200 mb-8 max-w-xl mx-auto">
              Laporan Tahunan SPI tersedia secara internal untuk detail pemeriksaan dan evaluasi komprehensif.
            </p>
            <button className="bg-white text-blue-900 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-50 transition-all shadow-lg active:scale-95">
              Lihat Laporan Tahunan
            </button>
          </div>
          {/* Decorative Circles */}
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20"></div>
        </div>

      </div>
    </div>
  );
};

export default AchievementSPI;