import React, { useState } from 'react';
import { 
  BsGearWideConnected, BsClockHistory, BsShieldLock, 
  BsBell, BsSave2, BsInfoCircle 
} from 'react-icons/bs';

const SettingPengajuan = () => {
  const [settings, setSettings] = useState({
    maxRevision: 3,
    deadlineDays: 7,
    autoReminder: true,
    restrictEditing: true,
    notifEmail: true
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <BsGearWideConnected className="text-blue-600" /> Setting Pengajuan
        </h2>
        <p className="text-sm text-slate-500">Konfigurasi parameter global untuk alur kerja pengajuan audit.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-700 mb-6 uppercase tracking-wider flex items-center gap-2">
              <BsClockHistory /> Batasan Waktu & Revisi
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Maksimal Revisi Dokumen</label>
                <input 
                  type="number" 
                  value={settings.maxRevision}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
                <p className="text-[10px] text-slate-400 italic">*Jumlah maksimal pengembalian draft ke auditor.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Batas Waktu Review (Hari)</label>
                <input 
                  type="number" 
                  value={settings.deadlineDays}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
                <p className="text-[10px] text-slate-400 italic">*Waktu maksimal atasan memberikan respon.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-700 mb-6 uppercase tracking-wider flex items-center gap-2">
              <BsShieldLock /> Keamanan & Akses
            </h3>
            
            <div className="space-y-4">
              <ToggleItem 
                label="Kunci Editing Saat Review" 
                desc="Auditor tidak dapat mengubah data jika status sedang di-review."
                checked={settings.restrictEditing}
              />
              <ToggleItem 
                label="Log Riwayat Perubahan" 
                desc="Catat setiap perubahan detail pada dokumen secara otomatis."
                checked={true}
                disabled={true}
              />
            </div>
          </div>
        </div>

        {/* Sidebar Settings / Notifikasi */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-700 mb-6 uppercase tracking-wider flex items-center gap-2">
              <BsBell /> Notifikasi
            </h3>
            <div className="space-y-4">
              <ToggleItem 
                label="Reminder Email" 
                desc="Kirim email otomatis jika mendekati deadline."
                checked={settings.notifEmail}
              />
              <ToggleItem 
                label="Auto Reminder System" 
                desc="Notifikasi di dashboard setiap login."
                checked={settings.autoReminder}
              />
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg border-none cursor-pointer">
            <BsSave2 /> Simpan Konfigurasi
          </button>
          
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
            <BsInfoCircle className="text-amber-500 shrink-0" />
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Perubahan pada pengaturan ini akan berdampak pada <strong>seluruh pengajuan baru</strong> yang dibuat setelah tombol simpan ditekan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-komponen Toggle
const ToggleItem = ({ label, desc, checked, disabled = false }) => (
  <div className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
    <div className="flex-1">
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      <p className="text-[11px] text-slate-400">{desc}</p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} disabled={disabled} className="sr-only peer" readOnly />
      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 opacity-80 peer-checked:opacity-100"></div>
    </label>
  </div>
);

export default SettingPengajuan;