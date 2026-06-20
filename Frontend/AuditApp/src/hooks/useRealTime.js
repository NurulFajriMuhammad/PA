import { useEffect, useRef } from "react";

/**
 * Hook untuk sinkronisasi data real-time.
 * Echo/Pusher di-load secara lazy setelah komponen mount,
 * sehingga tidak memblokir initial render.
 * @param {string|string[]} tables - Nama tabel atau '*' untuk semua.
 * @param {Function} onUpdate - Callback saat ada perubahan data.
 */
const useRealTime = (tables, onUpdate) => {
  const channelRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    // ✅ Dynamic import: pusher-js + laravel-echo hanya dimuat setelah
    // komponen selesai render pertama kali (tidak memblokir FCP/LCP)
    import("../echo").then(({ default: echo }) => {
      if (cancelled) return;

      const channel = echo.channel("public-data-updates");
      channelRef.current = channel;

      channel.listen(".entity.updated", (e) => {
        // Jika tables adalah '*', pantau semua
        if (tables === "*") {
          onUpdate(e);
          return;
        }

        // Pastikan tables dalam bentuk array
        const targetTables = Array.isArray(tables) ? tables : [tables];

        if (targetTables.includes(e.table)) {
          console.log(`[RealTime] Data updated on table: ${e.table}`, e);
          onUpdate(e);
        }
      });
    });

    return () => {
      cancelled = true;
      if (channelRef.current) {
        channelRef.current.stopListening(".entity.updated");
        channelRef.current = null;
      }
    };
  }, [tables, onUpdate]);
};

export default useRealTime;

