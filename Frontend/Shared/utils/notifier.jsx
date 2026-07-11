import React from "react";
import { toast } from "react-hot-toast";
import { BsTrash, BsX, BsExclamationCircle } from "react-icons/bs";

/**
 * Menampilkan notifikasi sukses kustom.
 */
export const notifySuccess = (message) => {
  const cleanMessage = typeof message === 'string' ? message.replace(/^[✅❌]\s*/, '') : message;
  toast.success(cleanMessage, {
    duration: 3000,
    style: {
      borderRadius: '16px',
      background: '#10b981',
      color: '#ffffff',
      fontWeight: 'bold',
      fontSize: '14px',
      padding: '16px',
      boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)',
      border: 'none',
      marginTop: '80px'
    },
    iconTheme: {
      primary: '#ffffff',
      secondary: '#10b981',
    },
  });
};

/**
 * Menampilkan notifikasi error kustom.
 */
export const notifyError = (error) => {
  let message = "Terjadi kesalahan. Silakan coba lagi.";
  let status = error?.response?.status;

  if (typeof error === "string") {
    message = error;
  } else if (error.response?.data?.errors) {
    const errors = error.response.data.errors;
    const firstErrorKey = Object.keys(errors)[0];
    message = errors[firstErrorKey][0];
  } else if (error.response?.data?.message) {
    message = error.response.data.message;
  } else if (status) {
    switch (status) {
      case 401: message = "Sesi Anda telah habis. Silakan login kembali."; break;
      case 403: message = "Anda tidak memiliki izin."; break;
      case 404: message = "Data tidak ditemukan."; break;
      case 500: message = "Kesalahan internal server."; break;
      default: message = `Terjadi kesalahan [Code: ${status}]`;
    }
  } else if (error.message) {
    message = error.message;
  }

  const cleanMessage = typeof message === 'string' ? message.replace(/^[✅❌]\s*/, '') : message;

  toast.error(cleanMessage, {
    duration: 6000,
    style: {
      borderRadius: '16px',
      background: '#ef4444',
      color: '#ffffff',
      fontWeight: 'bold',
      fontSize: '14px',
      padding: '16px',
      boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.2)',
      border: 'none',
      marginTop: '80px'
    },
    iconTheme: {
      primary: '#ffffff',
      secondary: '#ef4444',
    },
  });
};

/**
 * Menampilkan notifikasi konfirmasi kustom.
 */
export const notifyConfirm = (message, onConfirm, onCancel, options = {}) => {
  const {
    title = "Konfirmasi Tindakan",
    confirmText = "Ya, Lanjutkan",
    cancelText = "Batal",
    confirmColor = "bg-red-600",
    confirmHoverColor = "hover:bg-red-700",
    icon: Icon = BsExclamationCircle,
    iconColor = "bg-red-600",
    iconShadow = "shadow-red-200"
  } = options;

  toast(
    (t) => (
      <div className="flex flex-col items-center gap-6 p-4 min-w-[320px]">
        {/* Animated Icon */}
        <div className="relative">
          <div className={`absolute inset-0 ${iconColor.replace('bg-', 'bg-')} rounded-full animate-ping opacity-20`}></div>
          <div className={`relative w-20 h-20 rounded-full ${iconColor} flex items-center justify-center text-white shadow-xl ${iconShadow}`}>
            <Icon size={36} />
          </div>
        </div>

        {/* Message */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-black text-white uppercase tracking-tight">{title}</h3>
          <p className="text-sm font-medium text-slate-300 leading-relaxed px-4">{message}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full gap-4 mt-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              if (onCancel) onCancel();
            }}
            className="flex-1 px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 border border-white/10 backdrop-blur-md"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              if (onConfirm) onConfirm();
            }}
            className={`flex-1 px-6 py-4 ${confirmColor} ${confirmHoverColor} text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-black/40 active:scale-95 flex items-center justify-center gap-2`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    ),
    {
      duration: Infinity,
      position: "top-center",
      style: {
        marginTop: '15vh',
        borderRadius: '32px',
        background: '#111827',
        color: '#fff',
        padding: '30px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
        border: '1px solid rgba(255,255,255,0.1)',
        maxWidth: '450px'
      }
    }
  );
};
