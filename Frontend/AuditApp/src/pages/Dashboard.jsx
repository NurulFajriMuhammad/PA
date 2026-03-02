import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler 
} from 'chart.js';
import { 
  BsBarChartFill, BsClockHistory, BsSearch, BsCheckCircleFill,
  BsPlusLg, BsExclamationTriangleFill, BsInfoCircleFill, 
  BsArrowRightShort, BsFilterRight
} from 'react-icons/bs';
import { notifySuccess } from '../../../Shared/utils/notifier';

// Registrasi ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function Dashboard() {
  const [loading] = useState(false);

  // Data Tren Audit (12 Bulan)
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'],
    datasets: [
      {
        label: 'Audit Selesai',
        data: [8, 12, 15, 11, 18, 22, 20, 25, 28, 30, 35, 40],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#10b981',
      },
      {
        label: 'Temuan Baru',
        data: [15, 25, 20, 30, 35, 45, 40, 50, 55, 60, 58, 65],
        borderColor: '#ef4444',
        fill: false,
        tension: 0.4,
        borderDash: [5, 5],
        pointRadius: 0,
      }
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', align: 'end', labels: { boxWidth: 10, font: { size: 12, weight: 'bold' }, color: '#64748b' } },
      tooltip: { backgroundColor: '#1e293b', padding: 12, titleFont: { size: 14 }, bodyFont: { size: 13 }, cornerRadius: 8 },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
      y: { border: { display: false }, grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8' } },
    },
  };

  const handleCreateAudit = () => {
    notifySuccess("Modul pembuatan audit baru sedang disiapkan.");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <style>{`
        .glass-card { background: white; border: 1px solid #e2e8f0; border-radius: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .stat-icon { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 14px; }
        .progress-bar { height: 8px; border-radius: 10px; background: #f1f5f9; overflow: hidden; }
        .progress-inner { height: 100%; border-radius: 10px; transition: width 1s ease-in-out; }
      `}</style>

      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Executive Summary</h1>
          <p className="text-slate-500 text-sm font-medium">Sistem Informasi Pengawasan Internal • T.A 2026</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">
            <BsFilterRight size={18} /> Filter Periode
          </button>
          <button 
            onClick={handleCreateAudit}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <BsPlusLg /> Audit Baru
          </button>
        </div>
      </div>

      {/* --- KPI STATS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatBox label="Total Objek Audit" value="124" trend="+4" icon={<BsBarChartFill />} color="bg-blue-50 text-blue-600" />
        <StatBox label="Audit Berjalan" value="12" trend="On Track" icon={<BsClockHistory />} color="bg-amber-50 text-amber-600" />
        <StatBox label="Temuan Open" value="42" trend="High Priority" icon={<BsSearch />} color="bg-red-50 text-red-600" />
        <StatBox label="Penyelesaian" value="88%" trend="+2.4%" icon={<BsCheckCircleFill />} color="bg-emerald-50 text-emerald-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- MAIN CHART (2/3 Width) --- */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Tren Pengawasan Tahunan</h3>
            <select className="text-xs font-bold bg-slate-100 border-none rounded-lg px-3 py-1.5 outline-none cursor-pointer">
              <option>Tahun 2026</option>
              <option>Tahun 2025</option>
            </select>
          </div>
          <div className="h-[350px]">
            <Line options={lineChartOptions} data={lineChartData} />
          </div>
        </div>

        {/* --- RECENT ACTIVITY (1/3 Width) --- */}
        <div className="glass-card p-6 overflow-hidden">
          <h3 className="font-bold text-slate-800 mb-6 flex justify-between items-center">
            Aktivitas Terkini
            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md uppercase tracking-wider">Live</span>
          </h3>
          <div className="space-y-6">
            <ActivityRow 
              title="LHA Terbit: Biro Umum" 
              time="12 Menit Lalu" 
              icon={<BsCheckCircleFill />} 
              color="text-emerald-500" 
              desc="Audit sarana prasarana diselesaikan."
            />
            <ActivityRow 
              title="Temuan Baru: IT Security" 
              time="2 Jam Lalu" 
              icon={<BsExclamationTriangleFill />} 
              color="text-amber-500" 
              desc="Kerentanan pada server database akademik."
            />
            <ActivityRow 
              title="Respon Auditee: Keuangan" 
              time="5 Jam Lalu" 
              icon={<BsInfoCircleFill />} 
              color="text-blue-500" 
              desc="Mengunggah bukti tindak lanjut temuan #42."
            />
          </div>
          <button className="w-full mt-8 py-3 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1">
            Lihat Semua Log <BsArrowRightShort size={20} />
          </button>
        </div>
      </div>

      {/* --- LOWER SECTION: AUDITEE PROGRESS --- */}
      <div className="mt-8 glass-card p-6">
        <h3 className="font-bold text-slate-800 mb-6">Progres Penyelesaian per Unit Kerja</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ProgressItem label="Biro Perencanaan" value={92} color="bg-emerald-500" />
          <ProgressItem label="Fakultas Kedokteran" value={45} color="bg-red-500" />
          <ProgressItem label="Lembaga Penelitian" value={78} color="bg-blue-500" />
        </div>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

const StatBox = ({ label, value, trend, icon, color }) => (
  <div className="glass-card p-5 flex items-center gap-4 transition-transform hover:scale-[1.02] cursor-default">
    <div className={`stat-icon ${color}`}>{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black text-slate-800">{value}</span>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{trend}</span>
      </div>
    </div>
  </div>
);

const ActivityRow = ({ title, time, icon, color, desc }) => (
  <div className="flex gap-4 group cursor-pointer">
    <div className={`${color} mt-1 transition-transform group-hover:scale-110`}>{icon}</div>
    <div className="flex-1 border-b border-slate-50 pb-4">
      <div className="flex justify-between items-start mb-1">
        <h4 className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{title}</h4>
        <span className="text-[10px] text-slate-400 font-medium">{time}</span>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const ProgressItem = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between text-xs font-bold mb-2">
      <span className="text-slate-600">{label}</span>
      <span className="text-slate-800">{value}%</span>
    </div>
    <div className="progress-bar">
      <div className={`progress-inner ${color}`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);