import React from 'react';
import { 
  Calendar, 
  ClipboardCheck, 
  PieChart, 
  FileSearch, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  BarChart4
} from 'lucide-react';

const PKPTSpiPage = () => {
  const tahapanPkpt = [
    {
      title: "Persiapan",
      time: "Januari",
      desc: "Penyusunan tim audit, penetapan objek audit (auditee), dan koordinasi awal dengan unit kerja.",
      icon: <Clock className="text-blue-600" />
    },
    {
      title: "Pelaksanaan",
      time: "Februari - Oktober",
      desc: "Audit lapangan, pengumpulan bukti, pengujian pengendalian, dan penyusunan draf laporan.",
      icon: <FileSearch className="text-orange-600" />
    },
    {
      title: "Pelaporan",
      time: "November",
      desc: "Finalisasi laporan hasil pemeriksaan (LHP) dan penyampaian rekomendasi kepada Rektor.",
      icon: <ClipboardCheck className="text-green-600" />
    },
    {
      title: "Evaluasi",
      time: "Desember",
      desc: "Review efektivitas audit tahun berjalan dan penyusunan rencana untuk tahun berikutnya.",
      icon: <PieChart className="text-purple-600" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <Calendar size={14} /> Annual Audit Plan
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight sm:text-5xl uppercase">
            Rencana Kerja <span className="text-green-600">Audit Tahunan</span>
          </h1>
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
            Program Kerja Pengawasan Tahunan (PKPT) yang disusun berdasarkan analisis risiko untuk menjamin efektivitas pengawasan selama satu tahun anggaran.
          </p>
        </div>

        {/* --- STATS / SUMMARY --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
            <div className="bg-blue-100 p-4 rounded-2xl text-blue-600">
              <BarChart4 size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Target Audit</p>
              <h3 className="text-xl font-black text-gray-900">24 Unit Kerja</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
            <div className="bg-green-100 p-4 rounded-2xl text-green-600">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Status PKPT</p>
              <h3 className="text-xl font-black text-gray-900">Telah Disetujui</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
            <div className="bg-orange-100 p-4 rounded-2xl text-orange-600">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Fokus Risiko</p>
              <h3 className="text-xl font-black text-gray-900">Tinggi & Sedang</h3>
            </div>
          </div>
        </div>

        {/* --- TIMELINE TAHAPAN --- */}
        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-gray-100 overflow-hidden relative">
          <h2 className="text-2xl font-bold text-gray-900 mb-10 flex items-center gap-3">
            <Clock className="text-green-600" /> Siklus PKPT Berjalan
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {tahapanPkpt.map((step, index) => (
              <div key={index} className="relative group">
                <div className="bg-gray-50 rounded-3xl p-6 h-full border border-transparent hover:border-green-200 hover:bg-white transition-all duration-300">
                  <div className="text-green-600 font-black text-4xl mb-4 opacity-20 group-hover:opacity-100 transition-opacity">
                    {index + 1}
                  </div>
                  <div className="mb-4">
                    {step.icon}
                  </div>
                  <h4 className="font-extrabold text-gray-900 text-lg mb-1">{step.title}</h4>
                  <p className="text-green-600 text-xs font-bold uppercase mb-3 tracking-tighter italic">{step.time}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- INFO FOOTER --- */}
        <div className="mt-12 bg-gray-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="bg-white/10 p-3 rounded-xl">
              <Calendar className="text-green-400" />
            </div>
            <p className="text-sm font-medium text-gray-300 max-w-md">
              Jadwal pelaksanaan audit sewaktu-waktu dapat berubah menyesuaikan dengan kebijakan pimpinan atau adanya audit investigasi khusus.
            </p>
          </div>
          <button className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap shadow-lg shadow-green-900/20">
            Unduh Dokumen PKPT
          </button>
        </div>

      </div>
    </div>
  );
};

export default PKPTSpiPage;