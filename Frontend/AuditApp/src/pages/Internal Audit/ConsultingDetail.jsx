import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../../../Shared/api/apiClient";
import echo from "../../echo";
import { 
  Paperclip, 
  Send, 
  ChevronLeft, 
  Zap, 
  Info,
  CheckCircle
} from "lucide-react";
import { notifySuccess, notifyError, notifyConfirm } from "../../../../Shared/utils/notifier.jsx";

// Template balasan cepat
const quickReplies = [
  "Baik, akan kami pelajari lebih lanjut.",
  "Terima kasih atas informasinya.",
  "Mohon ditunggu, sedang kami proses.",
  "Silakan lampirkan dokumen pendukungnya.",
  "Apakah ada dokumen tambahan terkait hal ini?",
  "Kami akan menjadwalkan meeting untuk membahas detailnya.",
  "Noted. Informasi ini akan kami masukkan ke dalam catatan.",
  "Bisa tolong jelaskan lebih detail mengenai proses tersebut?",
  "Dokumen sudah kami terima dan sedang dalam tahap review.",
  "Terkait hal tersebut, kami merekomendasikan penyesuaian SOP.",
  "Silakan lengkapi form mitigasi risiko terkait temuan ini.",
  "Sesuai regulasi, hal ini perlu mendapat persetujuan manajemen.",
  "Update progres akan kami sampaikan pada akhir minggu ini.",
  "Apakah proses ini sudah melalui review dari tim Legal/Compliance?",
  "Mohon konfirmasi jika perbaikan sudah diimplementasikan.",
];

const ConsultingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [user, setUser] = useState(null);
  const [consulting, setConsulting] = useState(null);
  const [showQuick, setShowQuick] = useState(false);
  const [sending, setSending] = useState(false);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null); 

  const fetchUser = async () => {
    try {
      const res = await apiClient.get("/api/user");
      setUser(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDetail = async () => {
    try {
      const res = await apiClient.get(`/api/consulting/${id}`);
      setConsulting(res.data.data || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await apiClient.get(`/api/consulting/${id}/messages`);
      setMessages(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchDetail();
    fetchMessages();
  }, [id]);

  useEffect(() => {
    const channel = echo.private(`consulting.${id}`);
    channel.listen("message.sent", (e) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === e.message.id)) return prev;
        return [...prev, e.message];
      });
    });
    return () => echo.leave(`consulting.${id}`);
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || sending) return;

    setSending(true);

    try {
      const res = await apiClient.post("/api/consulting/send", {
        consulting_id: id,
        message: text,
      });

      setMessages((prev) => [...prev, res.data.data || res.data]);
      setText("");
      setShowQuick(false); 
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  // --- FITUR TUTUP KONSULTASI ---
  const handleCloseConsulting = () => {
    notifyConfirm("Akhiri sesi konsultasi ini? Ruang diskusi akan ditutup permanen.", async () => {
      try {
        await apiClient.put(`/api/consulting/${id}`, {
          ...consulting,
          tahap: 'Selesai',
          status: 'Selesai'
        });
        fetchDetail(); 
        notifySuccess("Sesi konsultasi ditutup.");
      } catch (err) {
        console.error(err);
        notifyError("Gagal menutup konsultasi.");
      }
    });
  };

  if (!consulting || !user) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-violet-200 rounded-full flex items-center justify-center">
             <Zap className="text-violet-400" size={24} fill="currentColor" />
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Membuka Ruang Diskusi...</p>
        </div>
      </div>
    );
  }

  // --- LOGIKA ROLE & STATUS ---
  const isAuditor = user?.roles?.some(r => r.name.toLowerCase().includes('auditor') || r.name.toLowerCase().includes('admin'));
  const isClosed = consulting?.tahap?.toLowerCase() === 'selesai' || consulting?.status?.toLowerCase() === 'selesai';

  return (
    // Memperbaiki container utama agar persis seperti asal (h-full saja, tidak pakai flex-col & calc height di level teratas jika itu mengacaukan layout global)
    // Di sini kita pastikan elemen child-nya yang mengisi space.
    <div className="flex flex-col h-full bg-slate-50 font-sans relative">
      
      {/* --- HEADER CHAT (Kembali menggunakan header normal dengan padding yang pas) --- */}
      <header className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="relative hidden md:block">
            <div className="w-10 h-10 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center text-sm font-black text-violet-700 shadow-inner">
              {consulting.proyek?.charAt(0).toUpperCase()}
            </div>
            <div className={`absolute bottom-0 right-0 w-3 h-3 border-[1.5px] border-white rounded-full ${isClosed ? 'bg-slate-400' : 'bg-emerald-500'}`}></div>
          </div>

          <div className="flex flex-col">
            <div className="font-bold text-slate-900 leading-tight flex items-center gap-2">
              {consulting.proyek}
              {isClosed && <span className="bg-slate-100 text-slate-500 text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider border border-slate-200">Closed</span>}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
               <span className="text-[9px] font-bold text-violet-600 uppercase tracking-widest hidden md:inline-block">
                 {consulting.kode_consulting}
               </span>
               <span className="text-[11px] font-medium text-slate-500">
                 • Klien: {consulting.klien}
               </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tombol Tutup Konsultasi */}
          {isAuditor && !isClosed && (
            <button 
              onClick={handleCloseConsulting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-600 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
            >
              <CheckCircle size={14} /> Selesai
            </button>
          )}
          <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <Info size={20} />
          </button>
        </div>
      </header>

      {/* --- CHAT AREA --- */}
      <main 
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[#e5ddd5] bg-opacity-70 scroll-smooth relative"
        style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}
      >
        <div className="flex justify-center mb-6">
           <div className="bg-white/90 backdrop-blur-sm border border-slate-200 shadow-sm text-slate-500 text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-wider">
             Ruang diskusi diamankan dengan Enkripsi E2E
           </div>
        </div>

        {messages.map((msg, index) => {
          const isMe = msg.sender_id === user.id;
          const isFirstInGroup = index === 0 || messages[index - 1].sender_id !== msg.sender_id;

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"} ${isFirstInGroup ? "mt-4" : "mt-1"}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[65%] px-4 py-2.5 shadow-sm relative group ${
                  isMe
                    ? "bg-violet-600 text-white rounded-2xl rounded-br-sm"
                    : "bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-bl-sm"
                }`}
              >
                {!isMe && isFirstInGroup && (
                  <div className="text-[10px] font-black text-violet-600 mb-1 capitalize flex items-center gap-1.5">
                    {msg.sender?.name} <span className="text-slate-400 text-[8px] font-normal">• {msg.sender?.roles?.[0]?.name || 'User'}</span>
                  </div>
                )}

                <div className="text-[13.5px] leading-relaxed break-words font-medium">
                  {msg.message}
                </div>

                <div
                  className={`text-[9px] mt-1 flex justify-end items-center gap-1 font-bold ${
                    isMe ? "text-violet-200" : "text-slate-400"
                  }`}
                >
                  {new Date(msg.created_at).toLocaleTimeString('id-ID', {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} className="h-4" /> 
      </main>

      {/* --- QUICK REPLY DROPDOWN --- */}
      <div className="relative z-20 shrink-0">
        {showQuick && !isClosed && (
          <div className="absolute bottom-full left-0 w-full bg-white/95 backdrop-blur-md p-3 border-t border-slate-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="text-[10px] font-black text-violet-600 uppercase tracking-widest flex items-center gap-1.5">
                <Zap size={12} fill="currentColor" /> Template Balasan Cepat
              </div>
              <button onClick={() => setShowQuick(false)} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-0.5 rounded uppercase">
                Tutup
              </button>
            </div>
            
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1 pb-1">
              {quickReplies.map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setText(q);
                    setShowQuick(false);
                  }}
                  className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 transition-all text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- INPUT AREA --- */}
        <footer className="bg-white p-3 border-t border-slate-200 flex items-center gap-2 shrink-0 shadow-inner">
          
          {isClosed ? (
            <div className="w-full text-center py-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 font-bold text-sm">
              Sesi konsultasi ini telah ditutup. Tidak dapat mengirim pesan baru.
            </div>
          ) : (
            <>
              <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => console.log(e.target.files[0])} />

              <button
                onClick={handleFileUpload}
                className="p-2.5 text-slate-400 hover:bg-slate-100 hover:text-violet-600 rounded-full transition-all hidden md:block"
              >
                <Paperclip size={20} />
              </button>

              <button
                onClick={() => setShowQuick(!showQuick)}
                className={`p-2.5 rounded-full transition-all ${showQuick ? 'bg-violet-100 text-violet-700' : 'text-slate-400 hover:bg-slate-100 hover:text-violet-600'}`}
              >
                <Zap size={20} className={showQuick ? "fill-violet-700" : ""} />
              </button>

              <div className="flex-1">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-slate-100 border-none rounded-2xl px-4 py-2.5 text-[13.5px] font-medium text-slate-700 outline-none focus:ring-2 focus:ring-violet-200 transition-all placeholder:text-slate-400"
                  placeholder="Ketik pesan diskusi..."
                  autoFocus
                />
              </div>

              <button
                onClick={sendMessage}
                disabled={!text.trim() || sending}
                className={`p-2.5 rounded-full transition-all flex items-center justify-center ${
                  text.trim() && !sending
                  ? "bg-violet-600 text-white hover:bg-violet-700 shadow-md scale-100" 
                  : "bg-slate-100 text-slate-300 scale-95 cursor-not-allowed"
                }`}
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Send size={18} className={text.trim() ? "ml-0.5" : ""} />
                )}
              </button>
            </>
          )}
        </footer>
      </div>

    </div>
  );
};

export default ConsultingDetail;
