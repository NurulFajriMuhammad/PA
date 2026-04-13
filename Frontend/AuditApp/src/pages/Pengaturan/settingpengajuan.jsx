import React, { useState, useEffect } from 'react';
import apiClient from "../../../../Shared/api/apiClient";
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

  const [loading, setLoading] = useState(false);

  // 🔥 FETCH DATA
  useEffect(() => {
    fetchSetting();
  }, []);

  const fetchSetting = async () => {
    try {
      const res = await apiClient.get('/api/setting-pengajuan');

      if (res.data) {
        setSettings({
          maxRevision: res.data.max_revision,
          deadlineDays: res.data.deadline_days,
          autoReminder: res.data.auto_reminder,
          restrictEditing: res.data.restrict_editing,
          notifEmail: res.data.notif_email
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 HANDLE INPUT
  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 🔥 SAVE
  const handleSave = async () => {
    try {
      setLoading(true);

      await apiClient.put('/api/setting-pengajuan', {
        max_revision: Number(settings.maxRevision),
        deadline_days: Number(settings.deadlineDays),
        auto_reminder: settings.autoReminder,
        restrict_editing: settings.restrictEditing,
        notif_email: settings.notifEmail
      });

      alert("✅ Berhasil disimpan!");
    } catch (err) {
      console.error(err);
      alert("❌ Gagal simpan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="mb-8">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BsGearWideConnected /> Setting Pengajuan
        </h2>
        <p className="text-sm text-slate-500">
          Konfigurasi parameter global untuk alur kerja pengajuan audit.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">

          {/* WAKTU */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="text-sm font-bold mb-6 flex items-center gap-2">
              <BsClockHistory /> Batasan Waktu & Revisi
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* MAX REVISION */}
              <div>
                <label className="text-xs font-semibold">Maksimal Revisi</label>
                <input
                  type="number"
                  value={settings.maxRevision}
                  onChange={(e) => handleChange("maxRevision", e.target.value)}
                  className="w-full p-2 border rounded mt-1"
                />
              </div>

              {/* DEADLINE */}
              <div>
                <label className="text-xs font-semibold">Deadline (Hari)</label>
                <input
                  type="number"
                  value={settings.deadlineDays}
                  onChange={(e) => handleChange("deadlineDays", e.target.value)}
                  className="w-full p-2 border rounded mt-1"
                />
              </div>

            </div>
          </div>

          {/* SECURITY */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="text-sm font-bold mb-6 flex items-center gap-2">
              <BsShieldLock /> Keamanan & Akses
            </h3>

            <ToggleItem
              label="Kunci Editing Saat Review"
              desc="Tidak bisa edit saat review"
              checked={settings.restrictEditing}
              onChange={(val) => handleChange("restrictEditing", val)}
            />

            <ToggleItem
              label="Log Riwayat Perubahan"
              desc="Selalu aktif"
              checked={true}
              disabled={true}
            />
          </div>

        </div>

        {/* RIGHT */}
        <div className="space-y-6">

          {/* NOTIF */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="text-sm font-bold mb-6 flex items-center gap-2">
              <BsBell /> Notifikasi
            </h3>

            <ToggleItem
              label="Reminder Email"
              checked={settings.notifEmail}
              onChange={(val) => handleChange("notifEmail", val)}
            />

            <ToggleItem
              label="Auto Reminder"
              checked={settings.autoReminder}
              onChange={(val) => handleChange("autoReminder", val)}
            />
          </div>

          {/* SAVE */}
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold"
          >
            {loading ? "Menyimpan..." : "Simpan Konfigurasi"}
          </button>

          {/* INFO */}
          <div className="p-4 bg-amber-50 rounded-xl flex gap-3">
            <BsInfoCircle />
            <p className="text-xs">
              Berlaku untuk semua pengajuan baru setelah disimpan.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

// 🔥 TOGGLE FIX
const ToggleItem = ({ label, desc, checked, onChange, disabled = false }) => (
  <div className="flex justify-between items-center mb-3">
    <div>
      <p className="text-sm font-semibold">{label}</p>
      {desc && <p className="text-xs text-gray-400">{desc}</p>}
    </div>

    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange && onChange(e.target.checked)}
    />
  </div>
);

export default SettingPengajuan;