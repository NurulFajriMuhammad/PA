import React, { useState, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler 
} from 'chart.js';
// ✅ Lucide-react: tree-shaking lebih optimal dibanding react-icons
import { BarChart2, Clock, Search, CheckCircle2, RefreshCw, AlertTriangle } from 'lucide-react';
import apiClient from '../../../Shared/api/apiClient';
import useRealTime from '../hooks/useRealTime';

// Registrasi ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchStats = useCallback(async () => {
    try {
      const res = await apiClient.get(`/api/dashboard-stats?tahun=${selectedYear}`);
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  // ✅ useCallback: callback stabil antar render → useRealTime tidak re-subscribe setiap render
  const handleRealTimeUpdate = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  // Sinkronisasi Real-Time untuk semua data
  useRealTime('*', handleRealTimeUpdate);

  useEffect(() => {
    setLoading(true);
    fetchStats();
  }, [selectedYear]);

  // Data Tren Audit (12 Bulan)
  const lineChartData = {
    labels: stats?.tren?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'],
    datasets: [
      {
        label: 'Audit Selesai',
        data: stats?.tren?.audit_selesai || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#10b981',
      },
      {
        label: 'Temuan Baru',
        data: stats?.tren?.temuan_baru || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now - date) / 1000); // dalam detik

    if (diff < 60) return `${diff} Detik Lalu`;
    if (diff < 3600) return `${Math.floor(diff / 60)} Menit Lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} Jam Lalu`;
    return `${Math.floor(diff / 86400)} Hari Lalu`;
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
          <p className="text-slate-500 text-sm font-medium">Sistem Informasi Pengawasan Internal • T.A {new Date().getFullYear()}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => fetchStats()} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">
            <RefreshCw size={16} /> Refresh Data
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* --- KPI STATS GRID --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatBox label="Total Objek Audit" value={stats?.kpi?.total_objek_audit || 0} trend="Total" icon={<BarChart2 size={20} />} color="bg-blue-50 text-blue-600" />
            <StatBox label="Audit Berjalan" value={stats?.kpi?.audit_berjalan || 0} trend="On Track" icon={<Clock size={20} />} color="bg-amber-50 text-amber-600" />
            <StatBox label="Temuan Open" value={stats?.kpi?.temuan_open || 0} trend="High Priority" icon={<Search size={20} />} color="bg-red-50 text-red-600" />
            <StatBox label="Penyelesaian" value={`${stats?.kpi?.penyelesaian || 0}%`} trend="Overall" icon={<CheckCircle2 size={20} />} color="bg-emerald-50 text-emerald-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* --- MAIN CHART (2/3 Width) --- */}
            <div className="lg:col-span-2 glass-card p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800">Tren Pengawasan Tahunan</h3>
                <select 
                  className="text-xs font-bold bg-slate-100 border-none rounded-lg px-3 py-1.5 outline-none cursor-pointer"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value={new Date().getFullYear()}>Tahun {new Date().getFullYear()}</option>
                  <option value={new Date().getFullYear() - 1}>Tahun {new Date().getFullYear() - 1}</option>
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
                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md uppercase tracking-wider animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span> Live
                </span>
              </h3>
              <div className="space-y-6">
                {stats?.aktivitas?.length > 0 ? (
                  stats.aktivitas.map((act) => (
                    <ActivityRow 
                      key={act.id}
                      title={act.title} 
                      time={formatTimeAgo(act.time)} 
                      icon={act.type === 'audit' ? <Clock size={16} /> : <AlertTriangle size={16} />} 
                      color={act.type === 'audit' ? 'text-blue-500' : 'text-amber-500'} 
                      desc={act.desc}
                    />
                  ))
                ) : (
                  <p className="text-sm text-slate-400 text-center py-10">Belum ada aktivitas terkini.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
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
        <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">{time}</span>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);
