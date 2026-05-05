import React, { useState, useEffect } from 'react';
import { Mail, Briefcase, GraduationCap, ShieldCheck, X, CheckCircle2, UserPlus, Loader2, Image as ImageIcon } from 'lucide-react';
import apiClient from "../../../../Shared/api/axios"; // Pastikan path ini benar sesuai struktur folder Anda
import { notifySuccess, notifyError } from '../../../../Shared/utils/notifier';

const ProfilPengawasSPI = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  // State untuk form input baru
  const [newMember, setNewMember] = useState({
    name: "", role: "", specialty: "", education: "", email: "", image: "", bio: "", certs: ""
  });
  const [fileError, setFileError] = useState(""); // pesan kesalahan ukuran file

  // 1. MENGAMBIL DATA DARI LARAVEL SAAT LOAD
  useEffect(() => {
    fetchTeamData();
  }, []);

const fetchTeamData = async () => {
  try {
    setLoading(true);

    const response = await apiClient.get("/api/pengawas");

    const mapped = response.data.map((item) => {
      let imageUrl = item.foto_url;
      const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

      if (imageUrl) {
        // Jika URL mengandung "/storage/", kita ambil bagian setelahnya saja (relatif)
        // Ini untuk membersihkan URL lama yang mungkin tersimpan dengan IP lama di database
        if (imageUrl.includes("/storage/")) {
          imageUrl = imageUrl.split("/storage/").pop();
        }
        
        // Pastikan kita prepend dengan baseUrl + /storage/ jika path-nya relatif
        if (!imageUrl.startsWith('http')) {
          const cleanPath = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
          imageUrl = `${baseUrl}/storage/${cleanPath}`;
        }
      }

      return {
        id: item.id,
        name: item.nama,
        role: item.jabatan,
        specialty: item.keahlian,
        education: item.pendidikan,
        email: item.email,
        image: imageUrl,
        bio: item.bio,
        certs: item.sertifikasi ? item.sertifikasi.split(",") : []
      };
    });

    setTeam(mapped);

  } catch (error) {
    console.error("❌ Gagal memuat data pengawas:", error);
  } finally {
    setLoading(false);
  }
};

  // 2. MENYIMPAN DATA KE LARAVEL
const handleAddMember = async (e) => {
  e.preventDefault();

  if (fileError) {
    notifyError(fileError);
    return;
  }

  try {
    const formData = new FormData();

    formData.append("name", newMember.name);
    formData.append("role", newMember.role);
    formData.append("specialty", newMember.specialty || "");
    formData.append("education", newMember.education || "");
    formData.append("email", newMember.email || "");
    formData.append("bio", newMember.bio || "");

    if (newMember.image) {
      // double‑check size before sending
      if (newMember.image.size > 2048 * 1024) {
        throw new Error("FileTooLarge");
      }
      formData.append("image", newMember.image, newMember.image.name);
    }

    if (newMember.certs) {
      formData.append(
        "certs",
        JSON.stringify(newMember.certs.split(",").map(c => c.trim()))
      );
    }

    // remove manual Content‑Type header; axios will auto‑generate the correct
    // boundary. setting it yourself often causes PHP to see an empty body and
    // triggers a 422 validation error since required fields are missing.
    const response = await apiClient.post("/api/pengawas", formData);

    console.log(response.data);
    notifySuccess("Data pengawas berhasil ditambahkan");
    fetchTeamData();
    setShowForm(false);
  } catch (error) {
    // log full response to developer console for easier debugging
    console.error("store pengawas error", error.response?.data || error);
    if (error.message === "FileTooLarge") {
      notifyError("Foto terlalu besar (maks 20MB). Silakan kompres atau gunakan gambar lain.");
    } else {
      notifyError(error);
    }
  }
};

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              <ShieldCheck size={14} /> Organization Personnel
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
              Profil <span className="text-blue-600">Pengawas Internal</span>
            </h1>
            <p className="mt-4 text-gray-600 max-w-2xl">
              Dikelola oleh tenaga ahli yang kompeten dan bersertifikasi profesional dalam menjaga integritas organisasi.
            </p>
          </div>
          
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            <UserPlus size={20} /> Tambah Pengawas
          </button>
        </div>

        {/* --- LOADING STATE --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-bold uppercase tracking-widest text-xs">Sinkronisasi Data...</p>
          </div>
        ) : (
          /* --- TEAM GRID --- */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {team.length > 0 ? (
              team.map((member, index) => (
                <div key={member.id || index} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative sm:w-48 h-56 sm:h-auto bg-gray-200 overflow-hidden">
                      <img 
                        src={member.image || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=400"} 
                        alt={member.name} 
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110" 
                      />
                    </div>
                    <div className="flex-1 p-6">
                      <p className="text-blue-600 font-bold text-xs uppercase mb-1">{member.role}</p>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 leading-tight">{member.name}</h3>
                      <div className="space-y-2 mb-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2"><Briefcase size={14}/> {member.specialty}</div>
                        <div className="flex items-center gap-2"><GraduationCap size={14}/> {member.education}</div>
                      </div>
                      <div className="flex justify-between items-center border-t pt-4">
                        <a href={`mailto:${member.email}`} className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:text-blue-600 transition-all"><Mail size={16} /></a>
                        <button onClick={() => setSelectedMember(member)} className="text-xs font-bold text-blue-600 uppercase">View Bio →</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
                <p className="text-gray-400 font-bold">Belum ada data pengawas.</p>
              </div>
            )}
          </div>
        )}

        {/* --- FORM INPUT MODAL ---
        {showForm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
            <div className="bg-white rounded-[2.5rem] max-w-2xl w-full p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-gray-800 tracking-tight">INPUT DATA PENGAWAS</h2>
                <button onClick={() => setShowForm(false)} className="p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="Nama Lengkap & Gelar" className="p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} />
                <input required placeholder="Jabatan (Ketua/Sekretaris/Auditor)" className="p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})} />
                <input placeholder="Keahlian Spesifik" className="p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={newMember.specialty} onChange={e => setNewMember({...newMember, specialty: e.target.value})} />
                <input placeholder="Riwayat Pendidikan" className="p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={newMember.education} onChange={e => setNewMember({...newMember, education: e.target.value})} />
                <input placeholder="Email Instansi" className="p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} />
                <input placeholder="URL Foto (Opsional)" className="p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={newMember.image} onChange={e => setNewMember({...newMember, image: e.target.value})} />
                <div className="md:col-span-2">
                  <input placeholder="Sertifikasi (Pisahkan dengan koma: QIA, CISA, CA)" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={newMember.certs} onChange={e => setNewMember({...newMember, certs: e.target.value})} />
                </div>
                <textarea placeholder="Bio Singkat" className="md:col-span-2 p-4 bg-gray-50 border border-gray-100 rounded-xl h-24 focus:ring-2 focus:ring-blue-500 outline-none" value={newMember.bio} onChange={e => setNewMember({...newMember, bio: e.target.value})} />
                
                <button type="submit" className="md:col-span-2 w-full py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 uppercase tracking-widest">
                  Simpan ke Database
                </button>
              </form>
            </div>
          </div>
        )} */}

        {/* --- FORM INPUT MODAL --- */}
{showForm && (
  <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md transition-all duration-300">
    {/* Container Modal dengan Animasi Slide Up */}
    <div className="bg-white rounded-[2rem] max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
      
      {/* Header Modal - Lebih Berwarna */}
      <div className="bg-blue-600 px-8 py-6 text-white flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Tambah Pengawas Baru</h2>
          <p className="text-blue-100 text-xs mt-1">Lengkapi data personel Satuan Audit Internal</p>
        </div>
        <button 
          onClick={() => setShowForm(false)} 
          className="p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
      </div>
      
      {/* Body Form */}
      <div className="p-8 overflow-y-auto max-h-[75vh]">
        <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Group: Nama */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Nama & Gelar</label>
            <input 
              required 
              placeholder="Contoh: Dr. Budi, M.Ak." 
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm" 
              value={newMember.name} 
              onChange={e => setNewMember({...newMember, name: e.target.value})} 
            />
          </div>

          {/* Group: Jabatan */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Jabatan</label>
            <input 
              required 
              placeholder="Contoh: Auditor Ahli" 
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm" 
              value={newMember.role} 
              onChange={e => setNewMember({...newMember, role: e.target.value})} 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Keahlian Spesifik</label>
            <input 
              placeholder="Contoh: Audit IT / Forensik" 
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm" 
              value={newMember.specialty} 
              onChange={e => setNewMember({...newMember, specialty: e.target.value})} 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Pendidikan Terakhir</label>
            <input 
              placeholder="Contoh: S2 Akuntansi UI" 
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm" 
              value={newMember.education} 
              onChange={e => setNewMember({...newMember, education: e.target.value})} 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Email Aktif</label>
            <input 
              type="email"
              placeholder="nama@instansi.com" 
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm" 
              value={newMember.email} 
              onChange={e => setNewMember({...newMember, email: e.target.value})} 
            />
          </div>

<div className="space-y-1">
  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Foto Profil</label>
  <div className="relative">
    <input 
      type="file"
      id="file-upload"
      className="hidden"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files[0];
        if (file) {
          if (file.size > 2048 * 1024) {
            setFileError("Ukuran file tidak boleh lebih dari 2 MB");
            setNewMember(prev => ({ ...prev, image: null }));
            setImagePreview(null);
            return;
          }
          setFileError("");
          setNewMember(prev => ({ ...prev, image: file }));
          // Optional: Buat preview untuk UI
          setImagePreview(URL.createObjectURL(file));
        }
      }}
    />
    <label 
      htmlFor="file-upload"
      className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl border-dashed flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all text-sm text-gray-500"
    >
      <ImageIcon size={18} className="text-blue-500" />
      {newMember.image ? newMember.image.name : "Pilih Foto Personel"}
    </label>
    {fileError && (
      <p className="mt-1 text-xs text-red-500">{fileError}</p>
    )}
  </div>
</div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Sertifikasi (Pisahkan dengan koma)</label>
            <input 
              placeholder="Contoh: QIA, CISA, CA, CFE" 
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm" 
              value={newMember.certs} 
              onChange={e => setNewMember({...newMember, certs: e.target.value})} 
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Bio Singkat</label>
            <textarea 
              placeholder="Ceritakan singkat pengalaman profesional..." 
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl h-24 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm resize-none" 
              value={newMember.bio} 
              onChange={e => setNewMember({...newMember, bio: e.target.value})} 
            />
          </div>
          
          <div className="md:col-span-2 pt-4">
            <button 
              type="submit" 
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={20} />
              Simpan Data Personel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}

        {/* --- MODAL DETAIL BIO --- */}
        {selectedMember && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] max-w-lg w-full overflow-hidden shadow-2xl">
              <div className="relative h-24 bg-blue-600">
                <button onClick={() => setSelectedMember(null)} className="absolute top-4 right-4 p-2 bg-black/20 text-white rounded-full"><X size={20} /></button>
              </div>
              <div className="px-8 pb-8">
                <div className="relative -mt-12 mb-4">
                  <img src={selectedMember.image || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=400"} className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg" alt="" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedMember.name}</h3>
                <p className="text-blue-600 font-bold text-sm uppercase mb-4">{selectedMember.role}</p>
                <p className="text-gray-600 text-sm leading-relaxed italic mb-6">"{selectedMember.bio}"</p>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Sertifikasi</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(selectedMember.certs) && selectedMember.certs.map(cert => (
                      <span key={cert} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold border border-blue-100">
                        <CheckCircle2 size={12} /> {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

                {/* --- INFO BOX --- */}
        <div className="mt-16 bg-blue-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div>
              <h2 className="text-2xl font-bold mb-2">Sertifikasi Profesional</h2>
              <p className="text-blue-200 max-w-md text-sm leading-relaxed">
                Seluruh auditor kami wajib memiliki sertifikasi keahlian seperti QIA, CISA, CA, atau CFE untuk menjamin kualitas hasil audit.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {['QIA', 'CISA', 'CPA', 'CFE'].map((cert) => (
                <span key={cert} className="px-5 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 font-black text-sm tracking-tighter hover:bg-white/20 transition-colors">
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilPengawasSPI;
