import React from 'react';
import { Mail, Linkedin, Award, Briefcase, GraduationCap, ShieldCheck } from 'lucide-react';

const ProfilPengawasSPI = () => {
  const team = [
    {
      name: "Dr. Ahmad Sanusi, M.Si., Ak., CA.",
      role: "Ketua SPI",
      specialty: "Audit Keuangan & Manajemen Risiko",
      education: "S3 Akuntansi - Universitas Indonesia",
      email: "ahmad.sanusi@univ.ac.id",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&h=200&fit=crop"
    },
    {
      name: "Siti Aminah, S.E., M.Ak., QIA.",
      role: "Sekretaris SPI",
      specialty: "Audit Internal Pemerintah & Pengadaan Barang/Jasa",
      education: "S2 Magister Akuntansi - Universitas Gadjah Mada",
      email: "siti.aminah@univ.ac.id",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&h=200&fit=crop"
    },
    {
      name: "Budi Pratama, S.Kom., CISA.",
      role: "Auditor Bidang TI",
      specialty: "Audit Sistem Informasi & Keamanan Siber",
      education: "S1 Teknik Informatika - Institut Teknologi Bandung",
      email: "budi.p@univ.ac.id",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&fit=crop"
    },
    {
      name: "Dewi Lestari, S.H., M.Kn.",
      role: "Auditor Bidang Hukum",
      specialty: "Audit Kepatuhan & Aspek Legal Organisasi",
      education: "S2 Magister Kenotariatan - Universitas Diponegoro",
      email: "dewi.l@univ.ac.id",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&h=200&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <ShieldCheck size={14} /> Meet Our Team
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Profil <span className="text-blue-600">Pengawas Internal</span>
          </h1>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Dikelola oleh tenaga ahli yang kompeten, bersertifikasi profesional, dan berdedikasi tinggi dalam menjaga integritas organisasi.
          </p>
        </div>

        {/* --- TEAM GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {team.map((member, index) => (
            <div key={index} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
              <div className="flex flex-col sm:flex-row">
                
                {/* Image Section */}
                <div className="relative sm:w-48 h-56 sm:h-auto bg-gray-200 overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100"
                  />
                  <div className="absolute top-0 right-0 p-3">
                    <div className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm">
                      <Award size={18} className="text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6 md:p-8">
                  <div className="mb-4">
                    <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-1">
                      {member.role}
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                      {member.name}
                    </h3>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Briefcase size={16} className="shrink-0 text-gray-400" />
                      <p className="text-sm font-medium">{member.specialty}</p>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <GraduationCap size={16} className="shrink-0 text-gray-400" />
                      <p className="text-sm">{member.education}</p>
                    </div>
                  </div>

                  {/* Footer Card */}
                  <div className="pt-5 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex gap-3">
                      <a href={`mailto:${member.email}`} className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
                        <Mail size={16} />
                      </a>
                      <button className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:bg-blue-600 hover:text-white transition-all">
                        <Linkedin size={16} />
                      </button>
                    </div>
                    <button className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider">
                      View Bio
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* --- INFO BOX --- */}
        <div className="mt-16 bg-blue-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-200">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold mb-2">Sertifikasi Profesional</h2>
              <p className="text-blue-200 max-w-md text-sm leading-relaxed">
                Seluruh auditor kami wajib memiliki sertifikasi keahlian seperti QIA, CISA, CA, atau CFE untuk menjamin kualitas hasil audit.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {['QIA', 'CISA', 'CPA', 'CFE'].map((cert) => (
                <span key={cert} className="px-5 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 font-black text-sm tracking-tighter">
                  {cert}
                </span>
              ))}
            </div>
          </div>
          {/* Background Decor */}
          <div className="absolute top-[-50%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full blur-[120px] opacity-20"></div>
        </div>

      </div>
    </div>
  );
};

export default ProfilPengawasSPI;