import React from 'react';
import { Target, ShieldCheck, Eye, CheckCircle2, Award, Scale, BookOpen, Fingerprint } from 'lucide-react';

const VisiMisiSPI = () => {
  const pointsMisi = [
    "Melaksanakan pengawasan internal yang independen, objektif, dan profesional.",
    "Memberikan saran perbaikan yang bernilai tambah bagi manajemen untuk mencapai tujuan organisasi.",
    "Mendorong terciptanya budaya kepatuhan dan manajemen risiko yang efektif.",
    "Meningkatkan kualitas sumber daya manusia pengawas internal yang berintegritas dan kompeten.",
    "Mengawal penerapan tata kelola organisasi yang baik (Good Corporate Governance)."
  ];

  const codeOfEthics = [
    {
      title: "Integritas",
      desc: "Membangun kepercayaan dan memberikan dasar bagi pengambilan keputusan yang objektif.",
      icon: <Fingerprint className="w-6 h-6 text-purple-600" />
    },
    {
      title: "Objektivitas",
      desc: "Menjaga sikap independen dan menghindari benturan kepentingan dalam mengumpulkan data.",
      icon: <Scale className="w-6 h-6 text-orange-600" />
    },
    {
      title: "Kerahasiaan",
      desc: "Menghormati nilai dan kepemilikan informasi yang diperoleh dan tidak mengungkapkannya tanpa otoritas.",
      icon: <ShieldCheck className="w-6 h-6 text-red-600" />
    },
    {
      title: "Kompetensi",
      desc: "Menerapkan pengetahuan, keterampilan, dan pengalaman yang diperlukan dalam jasa pengawasan.",
      icon: <Award className="w-6 h-6 text-green-600" />
    }
  ];

  return (
    <div className="w-full pb-8">
      <div className="w-full">
        
        {/* --- HEADER SECTION --- */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl tracking-tight">
            Profil Utama <span className="text-blue-600">SPI</span>
          </h1>
          <div className="mt-4 flex justify-center">
            <div className="h-1.5 w-24 bg-blue-600 rounded-full"></div>
          </div>
          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Pedoman strategis dan etika Satuan Pengawas Internal dalam menjalankan fungsi pengawasan demi tercapainya tata kelola yang bersih dan akuntabel.
          </p>
        </div>

        {/* --- VISI & MISI SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {/* Visi Card */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col transform transition-all hover:shadow-2xl">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-10 text-white h-full flex flex-col items-center text-center justify-center">
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl mb-6 shadow-inner">
                <Eye className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-6 tracking-wide">VISI</h2>
              <p className="text-xl leading-relaxed italic font-light opacity-95">
                "Menjadi mitra strategis manajemen yang profesional dan terpercaya dalam mewujudkan tata kelola organisasi yang unggul dan berintegritas."
              </p>
            </div>
          </div>

          {/* Misi Card */}
          <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-100 hover:shadow-2xl transition-all">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-blue-100 p-3 rounded-2xl text-blue-600 shadow-sm">
                <Target className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">MISI</h2>
            </div>
            <ul className="space-y-5">
              {pointsMisi.map((item, index) => (
                <li key={index} className="flex items-start gap-4 group">
                  <div className="mt-1 bg-green-100 text-green-600 rounded-full p-1 group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <p className="text-gray-700 leading-relaxed font-medium">
                    {item}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* --- CORE VALUES SECTION --- */}
        <div className="mb-20">
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="h-px w-12 bg-gray-300"></div>
            <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-widest">Core Values</h2>
            <div className="h-px w-12 bg-gray-300"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <ValueCard 
              title="Independen" 
              desc="Bebas dari pengaruh pihak manapun dalam menjalankan tugas pengawasan secara objektif." 
            />
            <ValueCard 
              title="Integritas" 
              desc="Bertindak jujur, tulus, dan memegang teguh prinsip etika dalam setiap tindakan." 
            />
            <ValueCard 
              title="Profesional" 
              desc="Memiliki kompetensi tinggi, disiplin, dan standar kerja yang akurat serta berkualitas." 
            />
          </div>
        </div>

        {/* --- CODE OF ETHICS SECTION --- */}
        <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-blue-50 px-6 py-2 rounded-full text-blue-700 font-bold text-sm uppercase tracking-widest mb-4">
              <BookOpen className="w-4 h-4" /> Code of Ethics
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">Kode Etik Auditor Internal</h2>
            <p className="text-gray-500 mt-2">Standar perilaku profesional yang wajib dijunjung tinggi oleh seluruh personil SPI.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {codeOfEthics.map((item, index) => (
              <div key={index} className="p-6 rounded-2xl border border-gray-50 bg-gray-50/50 hover:bg-white hover:shadow-lg transition-all duration-300 group">
                <div className="mb-4 transform group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper Component untuk Core Values
const ValueCard = ({ title, desc }) => (
  <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all text-center group">
    <div className="text-blue-600 font-black text-xl mb-3 uppercase tracking-tighter group-hover:scale-110 transition-transform tracking-[0.2em]">{title}</div>
    <p className="text-gray-600 text-sm leading-relaxed font-medium">{desc}</p>
  </div>
);

export default VisiMisiSPI;
