import { useEffect } from "react";
import echo from "../echo";

/**
 * Hook untuk sinkronisasi data real-time.
 * @param {string|string[]} tables - Nama tabel atau array nama tabel yang ingin dipantau.
 * @param {Function} onUpdate - Callback yang dijalankan saat ada perubahan data.
 */
const useRealTime = (tables, onUpdate) => {
  useEffect(() => {
    const channel = echo.channel("public-data-updates");

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

    return () => {
      channel.stopListening(".entity.updated");
    };
  }, [tables, onUpdate]);
};

export default useRealTime;
