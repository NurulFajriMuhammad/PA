import React from 'react';
import { 
  Wallet, 
  PieChart, 
  ArrowUpRight, 
  BarChart3, 
  FileSpreadsheet, 
  ShieldCheck, 
  Coins, 
  Receipt 
} from 'lucide-react';

const RKASpiPage = () => {
  const alokasiAnggaran = [
    {
      category: "Beban Operasional Audit",
      desc: "Perjalanan dinas, honorarium auditor eksternal (jika ada), dan konsumsi lapangan.",
      percent: "45%",
      icon: <Receipt className="text-blue-600" />
    },
    {
      category: "Pengembangan SDM",
      desc: "Pelatihan sertifikasi (QIA, CISA, CFE), seminar, dan workshop kompetensi auditor.",
      percent: "25%",
      icon: <GraduationCap className="text-purple-600" />
    },
    {
      category: "Teknologi & Inventaris",
      desc: "Lisensi software audit, pemeliharaan sistem informasi, dan perangkat penunjang.",
      percent: "20%",
      icon: <Monitor className="text-orange-600" />
    },
    {
      category: "Administrasi Kantor",
      desc: "Alat tulis kantor, penggandaan laporan, dan kebutuhan rutin sekretariat SPI.",
      percent: "10%",
      icon: <Coins className="text-emerald-600" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <Wallet size={14} /> Budget Planning
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight sm:text-5xl uppercase">
            Rencana Kerja <span className="text-blue-600">& Anggaran</span>
          </h1>
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Transparansi alokasi dana operasional SPI untuk mendukung pengawasan yang independen dan berkualitas sesuai standar tata kelola keuangan.
          </p>
        </div>

        {/* --- SUMMARY BOX --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-blue-200 text-sm font-bold uppercase tracking-widest mb-2">Status Anggaran 2024</p>
              <h2 className="text-4xl font-black mb-6 italic">EFISIEN & AKUNTABEL</h2>
              <div className="flex items-center gap-3 bg-white/10 w-fit px-4 py-2 rounded-xl backdrop-blur-md">
                <ShieldCheck className="text-blue-300" size={20} />
                <p className="text-xs font-medium">Telah melalui verifikasi Biro Keuangan</p>
              </div>
            </div>
            <BarChart3 className="absolute bottom-[-20px] right-[-20px] text-white/10 w-48 h-48" />
          </div>

          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-4">
              <PieChart className="text-blue-600" size={28} />
              <h3 className="text-xl font-bold text-gray-900">Prinsip Anggaran</h3>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Penyusunan anggaran SPI didasarkan pada prinsip **Value for Money** (Ekonomis, Efisiensi, dan Efektivitas) guna memastikan setiap rupiah yang dikeluarkan mendukung penguatan sistem pengendalian internal.
            </p>
          </div>
        </div>

        {/* --- DETAIL ALOKASI --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {alokasiAnggaran.map((item, index) => (
            <div key={index} className="bg-white p-8 rounded-3xl border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-gray-50 p-4 rounded-2xl group-hover:bg-blue-50 transition-colors">
                  {item.icon}
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-gray-900">{item.percent}</span>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Alokasi</p>
                </div>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">{item.category}</h4>
              <p className="text-sm text-gray-500 leading-relaxed mb-6 h-12">
                {item.desc}
              </p>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full group-hover:bg-indigo-500 transition-all duration-1000" 
                  style={{ width: item.percent }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* --- DOWNLOAD SECTION --- */}
        <div className="mt-16 flex flex-col md:flex-row items-center justify-between bg-white border border-dashed border-gray-300 rounded-[2rem] p-8 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <FileSpreadsheet className="text-blue-600" size={30} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-lg leading-tight">Dokumen RKA SPI</h4>
              <p className="text-sm text-gray-500">Versi Final (PDF/Excel) tersedia bagi pihak berwenang.</p>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg active:scale-95">
             Akses Dokumen <ArrowUpRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
};

// Helper untuk icon yang belum ter-import
const GraduationCap = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
);
const Monitor = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
);

export default RKASpiPage;