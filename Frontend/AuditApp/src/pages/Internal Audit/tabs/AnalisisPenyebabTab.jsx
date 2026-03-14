import React from "react";

const AnalisisTab = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow border">

      <h2 className="font-bold mb-4">
        Selisih Pendapatan dengan laporan keuangan
      </h2>

      <div className="text-sm space-y-2">
        <p><b>Kondisi :</b> Kelalaian</p>
        <p><b>Kriteria :</b> Fraud</p>
        <p><b>Sebab :</b> Human error</p>
        <p><b>Akibat :</b> Kerugian perusahaan</p>
      </div>

    </div>
  );
};

export default AnalisisTab;
