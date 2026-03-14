import React from "react";

const PelaksanaanTab = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow border">

      <h2 className="font-bold mb-4">Kertas Kerja Audit (KKA)</h2>

      <table className="w-full text-sm">
        <thead className="bg-slate-800 text-white">
          <tr>
            <th className="p-3">No</th>
            <th className="p-3">Uraian</th>
            <th className="p-3">Auditor</th>
            <th className="p-3">No KKA</th>
          </tr>
        </thead>

        <tbody>
          <tr className="border-b">
            <td className="p-3">1</td>
            <td className="p-3">KKA audit pendapatan</td>
            <td className="p-3">Budi Doremi</td>
            <td className="p-3">6576868</td>
          </tr>
        </tbody>
      </table>

    </div>
  );
};

export default PelaksanaanTab;
