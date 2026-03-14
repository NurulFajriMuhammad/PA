import React from "react";

const PerencanaanTab = () => {
  return (
    <div className="grid grid-cols-2 gap-6">

      <div className="bg-white p-6 rounded-xl shadow border">
        <h2 className="font-bold mb-4">Detail Tim Audit</h2>

        <div className="space-y-2 text-sm">
          <p><b>Penanggung Jawab :</b> Dr. Ahmad Auditor</p>
          <p><b>Ketua Tim :</b> Siska Wijaya</p>
          <p><b>Anggota :</b> Budi Doremi</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow border">
        <h2 className="font-bold mb-4">Jadwal & Lokasi</h2>

        <div className="text-sm">
          <p><b>Objek Audit :</b> Biro Sarana & Prasarana</p>
          <p><b>Entry Meeting :</b> 01 Feb 2026</p>
          <p><b>Exit Meeting :</b> 28 Feb 2026</p>
        </div>
      </div>

    </div>
  );
};

export default PerencanaanTab;
