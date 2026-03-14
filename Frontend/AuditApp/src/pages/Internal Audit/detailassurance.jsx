import React, { useState } from "react";
import { useParams } from "react-router-dom";

import PerencanaanTab from "./tabs/PerencanaanTab";
import PelaksanaanTab from "./tabs/PelaksanaanTab";
import AnalisisTab from "./tabs/AnalisisTab";

const AssuranceDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("perencanaan");

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="bg-slate-800 text-white p-6 rounded-xl mb-6">
        <h1 className="text-xl font-bold">
          Audit Operasional Pengadaan Barang & Jasa
        </h1>
        <p className="text-sm opacity-80">
          Project ID : AUDIT-{id}
        </p>
      </div>

      {/* TAB MENU */}
      <div className="flex gap-6 border-b mb-6 text-sm font-semibold">

        <button
          onClick={() => setActiveTab("perencanaan")}
          className={activeTab === "perencanaan" ? "text-red-600 border-b-2 border-red-600 pb-2" : "text-gray-500"}
        >
          Informasi Umum
        </button>

        <button
          onClick={() => setActiveTab("pelaksanaan")}
          className={activeTab === "pelaksanaan" ? "text-red-600 border-b-2 border-red-600 pb-2" : "text-gray-500"}
        >
          Pelaksanaan (KKA)
        </button>

        <button
          onClick={() => setActiveTab("analisis")}
          className={activeTab === "analisis" ? "text-red-600 border-b-2 border-red-600 pb-2" : "text-gray-500"}
        >
          Analisis Penyebab
        </button>

      </div>

      {/* TAB CONTENT */}
      {activeTab === "perencanaan" && <PerencanaanTab />}
      {activeTab === "pelaksanaan" && <PelaksanaanTab />}
      {activeTab === "analisis" && <AnalisisTab />}

    </div>
  );
};

export default AssuranceDetail;
