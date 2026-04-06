import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../../../Shared/api/apiClient";
import echo from "../../echo";
import { Paperclip, Send, ChevronLeft, MoreVertical, MessageSquare } from "lucide-react";

const quickReplies = [
  "Baik, akan kami proses",
  "Terima kasih atas informasinya",
  "Mohon ditunggu sebentar",
  "Silakan kirim detail tambahan",
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
  const fileInputRef = useRef(null); // Ref untuk input file tersembunyi

  const fetchUser = async () => {
    const res = await apiClient.get("/api/user");
    setUser(res.data);
  };

  const fetchDetail = async () => {
    const res = await apiClient.get(`/api/consulting/${id}`);
    setConsulting(res.data.data);
  };

  const fetchMessages = async () => {
    const res = await apiClient.get(`/api/consulting/${id}/messages`);
    setMessages(res.data.data);
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

// langsung tampil tanpa nunggu echo
setMessages((prev) => [...prev, res.data.data]);

    setText("");
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

  // Fungsi trigger upload file
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  if (!consulting || !user) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-blue-200 rounded-full"></div>
          <p className="text-gray-500 text-sm font-medium">Memuat percakapan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5] font-sans">
      
      {/* HEADER */}
      <header className="px-4 py-3 bg-white border-b flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-sm font-bold text-blue-700 shadow-inner">
            {consulting.proyek?.charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="font-semibold text-slate-900 leading-tight">
              {consulting.proyek}
            </div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              ID: {consulting.kode_consulting}
            </div>
          </div>
        </div>

        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
          <MoreVertical size={20} />
        </button>
      </header>

      {/* CHAT AREA - Background Krem/Warm Beige */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#e5ddd5] bg-opacity-70 relative" 
            style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}>

        {messages.map((msg) => {
          const isMe = msg.sender_id === user.id;

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 mb-2 ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-3.5 py-2 rounded-2xl shadow-sm relative ${
                  isMe
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-white text-slate-800 border-gray-200 rounded-tl-none border"
                }`}
              >
                {!isMe && (
                  <div className="text-[10px] font-bold text-blue-600 mb-0.5">
                    {msg.sender?.name}
                  </div>
                )}

                <div className="text-[13.5px] leading-relaxed break-words">
                  {msg.message}
                </div>

                <div
                  className={`text-[9px] mt-1 flex justify-end items-center gap-1 font-medium ${
                    isMe ? "text-blue-100" : "text-gray-400"
                  }`}
                >
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </main>

      {/* QUICK REPLY DROPDOWN (Muncul di atas input) */}
      {showQuick && (
        <div className="bg-white/90 backdrop-blur-sm p-3 border-t flex flex-wrap gap-2 animate-in slide-in-from-bottom-2 duration-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <div className="w-full text-[10px] font-bold text-blue-600 uppercase mb-1 px-1">Balasan Cepat:</div>
          {quickReplies.map((q, i) => (
            <button
              key={i}
              onClick={() => {
                setText(q);
                setShowQuick(false);
              }}
              className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-blue-100 transition-all shadow-sm active:scale-95"
            >
              {q}
            </button>
          ))}
          <button onClick={() => setShowQuick(false)} className="text-[11px] font-bold text-slate-400 hover:text-slate-600 px-2">Batal</button>
        </div>
      )}

      {/* INPUT AREA */}
      <footer className="bg-white p-3 border-t flex items-center gap-2 shadow-inner">
        
        {/* Input File Tersembunyi */}
        <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => console.log(e.target.files[0])} />

        {/* 1. Tombol Lampirkan File (Peniti) */}
        <button
          onClick={handleFileUpload}
          className="p-2.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 rounded-full transition-all"
          title="Lampirkan File"
        >
          <Paperclip size={22} />
        </button>

        {/* 2. Tombol Balasan Cepat (MessageSquare) */}
        <button
            onClick={() => setShowQuick(!showQuick)}
            className={`p-2.5 rounded-full transition-all ${showQuick ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-100 hover:text-blue-600'}`}
            title="Balasan Cepat"
        >
            <MessageSquare size={22} />
        </button>

        {/* 3. Input Utama */}
        <div className="flex-1">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-slate-100 border-none rounded-2xl px-4 py-2.5 text-[13.5px] outline-none focus:ring-2 focus:ring-blue-100 transition-all"
            placeholder="Tulis pesan..."
          />
        </div>

        {/* 4. Tombol Kirim */}
        <button
          onClick={sendMessage}
          disabled={!text.trim()}
          className={`p-2.5 rounded-full transition-all shadow-md ${
            text.trim() 
            ? "bg-blue-600 text-white hover:bg-blue-700 scale-100" 
            : "bg-gray-300 text-gray-500 scale-90 cursor-not-allowed shadow-none"
          }`}
        >
          <Send size={20} fill={text.trim() ? "currentColor" : "none"} />
        </button>
      </footer>
    </div>
  );
};

export default ConsultingDetail;