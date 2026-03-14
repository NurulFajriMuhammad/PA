import React from 'react';
import { Gavel, FileCheck, Landmark, Scale, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';

const DasarHukumSpiPage = () => {
  const regulasi = [
    {
      kategori: "Regulasi Nasional",
      icon: <Landmark className="text-red-600" />,
      items: [
        { 
          no: "UU No. 28 Tahun 1999", 
          tentang: "Penyelenggaraan Negara yang Bersih dan Bebas dari Korupsi, Kolusi, dan Nepotisme.",
          url: "https://peraturan.bpk.go.id/Details/45345/uu-no-28-tahun-1999"
        },
        { 
          no: "UU No. 17 Tahun 2003", 
          tentang: "Keuangan Negara.",
          // url: "https://jdih.kemenkeu.go.id/fulltext/2003/17TAHUN2003UU.htm"
          // url: "https://peraturan.bpk.go.id/Download/31132/UU%20Nomor%2017%20Tahun%202003.pdf"
          url: "https://peraturan.bpk.go.id/Details/43017/uu-no-17-tahun-2003"
        },
        { 
          no: "PP No. 60 Tahun 2008", 
          tentang: "Sistem Pengendalian Intern Pemerintah (SPIP).",
          url: "https://peraturan.bpk.go.id/Details/4876/pp-no-60-tahun-2008"
        }
      ]
    },
    {
      kategori: "Regulasi Kementerian",
      icon: <Gavel className="text-blue-600" />,
      items: [
        { 
          no: "Permendikbud No. 47 Tahun 2011", 
          tentang: "Satuan Pengawasan Intern di Lingkungan Kemendikbud.",
          // url: "https://jdih.kemdikbud.go.id/sipedas/pencarian/view?id=1418"
          url: "https://peraturan.bpk.go.id/Details/163982/permendikbud-no-47-tahun-2011"
        },
        { 
          no: "Permenpan-RB No. 5 Tahun 2008", 
          tentang: "Standar Audit Aparat Pengawasan Intern Pemerintah (APIP).",
          // url: "https://jdih.menpan.go.id/puu-633-Peraturan%20Menpan.html"
          url: "https://peraturan.bpk.go.id/Details/132995/permen-pan-rb-no-per05mpan32008-tahun-2008"
        }
      ]
    },
    {
      kategori: "Keputusan Internal",
      icon: <FileCheck className="text-emerald-600" />,
      items: [
        { 
          no: "Statuta Universitas", 
          tentang: "Pedoman dasar penyelenggaraan dan pengelolaan institusi.",
          url: "#" // Ganti dengan link PDF internal universitas jika ada
        },
        { 
          no: "SK Rektor No. 123/2023", 
          tentang: "Pembentukan dan Tata Kerja Satuan Pengawas Internal.",
          url: "#" // Ganti dengan link PDF internal universitas jika ada
        }
      ]
    }
  ];

  // Fungsi untuk membuka link di tab baru
  const handleOpenDoc = (url) => {
    if (url !== "#") {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      alert("Dokumen internal belum tersedia di sistem.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <Scale size={14} /> Legal Basis
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight sm:text-5xl uppercase">
            Dasar <span className="text-amber-600">Hukum</span>
          </h1>
          <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
            Seluruh tugas, wewenang, dan tanggung jawab SPI dilaksanakan berdasarkan ketentuan perundang-undangan dan peraturan yang berlaku.
          </p>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="space-y-10">
          {regulasi.map((group, idx) => (
            <div key={idx} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              {/* Category Header */}
              <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex items-center gap-4">
                <div className="bg-white p-3 rounded-2xl shadow-sm italic">
                  {group.icon}
                </div>
                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">
                  {group.kategori}
                </h2>
              </div>

              {/* Items List */}
              <div className="p-8">
                <div className="grid grid-cols-1 gap-6">
                  {group.items.map((item, i) => (
                    <div 
                      key={i} 
                      className="flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-2xl border border-transparent hover:border-amber-100 hover:bg-amber-50/30 transition-all group"
                    >
                      <div className="shrink-0">
                        <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-xs font-bold font-mono">
                          {item.no}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 font-semibold leading-relaxed group-hover:text-gray-900 transition-colors">
                          Tentang {item.tentang}
                        </p>
                      </div>
                      <div className="shrink-0 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenDoc(item.url)}
                          className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-100/50 md:bg-transparent px-3 py-2 md:p-0 rounded-lg"
                        >
                          LIHAT DOKUMEN <ExternalLink size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- INFO BOX --- */}
        <div className="mt-16 bg-gray-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="bg-amber-500 p-4 rounded-2xl shadow-lg shadow-amber-500/20">
              <ShieldCheck size={32} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 uppercase tracking-wide">Kepatuhan Regulasi</h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
                SPI berkomitmen untuk menjalankan fungsi pengawasan secara konsisten terhadap seluruh regulasi di atas guna mewujudkan tata kelola organisasi yang bersih dan transparan.
              </p>
            </div>
          </div>
          {/* Decor */}
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <BookOpen size={150} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default DasarHukumSpiPage;