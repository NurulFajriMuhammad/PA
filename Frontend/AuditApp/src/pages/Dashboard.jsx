import React, { useState, useEffect } from 'react';
// import apiClient from '../api/axios'; 

// 1. IMPORT CHART.JS
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler 
} from 'chart.js';

// 2. IMPORT SEMUA IKON YANG DIPERLUKAN
import { 
  BsBarChartFill, 
  BsClockHistory, 
  BsSearch, 
  BsCheckCircleFill,
  BsPlusLg,
  BsExclamationTriangleFill, // <-- Ikon baru
  BsInfoCircleFill           // <-- Ikon baru
} from 'react-icons/bs';

// 3. DAFTARKAN KOMPONEN CHART.JS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Data dummy untuk 4 GARIS TREN (12 Bulan)
const dummyTrendData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'],
  auditsCreated: [10, 12, 15, 14, 18, 20, 22, 25, 23, 28, 30, 32],
  auditsOngoing: [2, 3, 2, 4, 3, 5, 4, 3, 5, 6, 4, 5],
  findingsFound: [15, 20, 18, 22, 25, 30, 28, 35, 40, 45, 50, 48],
  auditsDone: [8, 10, 13, 12, 15, 18, 20, 22, 20, 25, 28, 30],
};

// Data dummy untuk 4 KOTAK (dihitung dari data tren)
const calculatedStats = {
  total_audit: dummyTrendData.auditsCreated.reduce((a, b) => a + b, 0),
  audit_berlangsung: dummyTrendData.auditsOngoing[dummyTrendData.auditsOngoing.length - 1],
  total_temuan: dummyTrendData.findingsFound.reduce((a, b) => a + b, 0),
  audit_selesai: dummyTrendData.auditsDone.reduce((a, b) => a + b, 0),
};


export default function Dashboard() {
  const [stats, setStats] = useState(calculatedStats);
  const [trend, setTrend] = useState(dummyTrendData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const recentActivities = [
    { id: 1, text: 'Audit A-123 telah disetujui', time: '2 jam lalu', type: 'success' },
    { id: 2, text: 'Temuan baru ditambahkan pada Audit B-456', time: '5 jam lalu', type: 'warning' },
    { id: 3, text: 'Auditee (User X) mengirim pesan baru', time: '1 hari lalu', type: 'info' },
  ];
  
  // Data & Options untuk 4 GARIS LINE CHART
  const lineChartData = {
    labels: trend.labels,
    datasets: [
      {
        label: 'Audit Dibuat',
        data: trend.auditsCreated,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
        fill: true, // <-- Hanya 1 area
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: 'Audit Berlangsung', 
        data: trend.auditsOngoing,
        borderColor: '#f59e0b',
        fill: false, // <-- Garis
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: 'Temuan Ditemukan', 
        data: trend.findingsFound,
        borderColor: '#ef4444',
        fill: false, // <-- Garis
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: 'Audit Selesai', 
        data: trend.auditsDone,
        borderColor: '#10b981',
        fill: false, // <-- Garis
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true, 
        position: 'bottom', 
        labels: { color: '#ecf0f1', padding: 25, font: { size: 14 } }
      },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af' }, 
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.1)', borderColor: 'transparent' },
        ticks: { color: '#9ca3af' }, 
      },
    },
  };

  // 4. FUNGSI UNTUK MEMILIH IKON AKTIVITAS
  const getActivityIcon = (type) => {
    switch (type) {
      case 'success':
        return <BsCheckCircleFill className="icon-success" />;
      case 'warning':
        return <BsExclamationTriangleFill className="icon-warning" />;
      case 'info':
        return <BsInfoCircleFill className="icon-info" />;
      default:
        return <BsInfoCircleFill className="icon-info" />;
    }
  };

  return (
    <>
      <style>
        {`
          * { box-sizing: border-box; }
          .dashboard-container {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            padding: 32px;
            max-width: 1400px;
            margin: 0 auto;
            background-color: #f8f9fa;
            min-height: 100vh;
          }
          .dashboard-header { margin-bottom: 32px; padding: 0; border: none; }
          .dashboard-header h1 { margin: 0 0 8px 0; color: #1a1a1a; font-size: 2em; font-weight: 700; }
          .dashboard-header p { margin: 0; font-size: 1em; color: #6b7280; font-weight: 400; }

          /* --- CSS KARTU GRAFIK UTAMA (TIDAK BERUBAH) --- */
          .main-graphic-card {
            background-color: #2c3e50; 
            color: #ecf0f1; 
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
            margin-bottom: 32px;
          }
          .snapshot-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 20px;
            margin-bottom: 24px;
            padding-bottom: 24px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          .snapshot-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            border-radius: 8px;
            background-color: rgba(255, 255, 255, 0.05);
            transition: background-color 0.2s;
          }
          .snapshot-item:hover { background-color: rgba(255, 255, 255, 0.1); }
          .snapshot-icon {
            font-size: 1.5em;
            padding: 10px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .snapshot-info h3 { margin: 0 0 4px 0; font-size: 0.8em; color: #bdc3c7; text-transform: uppercase; font-weight: 500; }
          .snapshot-info p { margin: 0; font-size: 1.8em; color: #ffffff; font-weight: 600; line-height: 1; }
          .snapshot-icon.total { background-color: rgba(59, 130, 246, 0.2); color: #3b82f6; }
          .snapshot-icon.berlangsung { background-color: rgba(245, 158, 11, 0.2); color: #f59e0b; }
          .snapshot-icon.temuan { background-color: rgba(239, 68, 68, 0.2); color: #ef4444; }
          .snapshot-icon.selesai { background-color: rgba(16, 185, 129, 0.2); color: #10b981; }
          .trend-chart-container { height: 350px; }

          /* --- 5. PERBAIKAN CSS BAGIAN BAWAH --- */
          .content-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; /* <-- DIUBAH JADI 50/50 */
            gap: 24px; 
            margin-bottom: 24px; 
            
            @media (max-width: 1024px) { 
              grid-template-columns: 1fr; /* Tumpuk di layar kecil */
            }
          }
          
          .recent-activity, .quick-actions { 
            background-color: #ffffff; 
            border: 1px solid transparent; /* <-- HAPUS BORDER */
            border-radius: 12px; 
            padding: 24px; 
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* <-- GANTI SHADOW */
            height: 100%; /* <-- BUAT TINGGI SAMA */
          }
          
          .recent-activity h2, .quick-actions h2 { margin: 0 0 20px; font-size: 1.3em; color: #1a1a1a; font-weight: 600; padding-bottom: 12px; border-bottom: 2px solid #f3f4f6; }
          
          .recent-activity ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
          
          .recent-activity li { 
            padding: 16px; 
            border-radius: 8px; 
            background-color: #f9fafb; 
            border-left: none; /* <-- Hapus border kiri lama */
            transition: all 0.2s ease;
            display: flex; /* <-- BUAT FLEX */
            align-items: center;
            gap: 12px; /* <-- Jarak ikon & teks */
          }
          
          .activity-icon {
            font-size: 1.3em;
            flex-shrink: 0;
          }
          .icon-success { color: #10b981; }
          .icon-warning { color: #f59e0b; }
          .icon-info { color: #3b82f6; }

          .activity-text p { margin: 0 0 6px; font-size: 0.95em; color: #374151; font-weight: 500; }
          .activity-text span { font-size: 0.85em; color: #9ca3af; }

          .quick-actions { 
            display: flex; /* <-- BUAT FLEX */
            flex-direction: column; 
          }
          
          .action-buttons { 
            display: flex; 
            flex-direction: column; 
            gap: 12px;
            margin-top: auto; /* Mendorong ke tengah/bawah */
            margin-bottom: auto; /* Mendorong ke tengah/atas */
          }
          
          .quick-actions button { background-color: #3b82f6; color: white; border: none; padding: 14px 20px; border-radius: 8px; cursor: pointer; font-size: 0.95em; font-weight: 500; display: flex; align-items: center; justify-content: center; gap: 8px; }
          .quick-actions button .btn-icon { font-size: 1.1em; }
          .quick-actions button.secondary { background-color: #ffffff; color: #3b82f6; border: 2px solid #3b82f6; }
          
          /* ... (Media query sisa) ... */
        `}
      </style>

      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Dashboard Audit Management</h1>
          <p>Selamat datang! Berikut ringkasan aktivitas hari ini.</p>
        </header>

        {/* --- KARTU GRAFIK UTAMA (TIDAK BERUBAH) --- */}
        <div className="main-graphic-card">
          <div className="snapshot-grid">
            <div className="snapshot-item">
              <span className="snapshot-icon total"><BsBarChartFill /></span>
              <div className="snapshot-info">
                <h3>Total Audit</h3>
                <p>{stats.total_audit}</p>
              </div>
            </div>
            <div className="snapshot-item">
              <span className="snapshot-icon berlangsung"><BsClockHistory /></span>
              <div className="snapshot-info">
                <h3>Berlangsung</h3>
                <p>{stats.audit_berlangsung}</p>
              </div>
            </div>
            <div className="snapshot-item">
              <span className="snapshot-icon temuan"><BsSearch /></span>
              <div className="snapshot-info">
                <h3>Total Temuan</h3>
                <p>{stats.total_temuan}</p>
              </div>
            </div>
            <div className="snapshot-item">
              <span className="snapshot-icon selesai"><BsCheckCircleFill /></span>
              <div className="snapshot-info">
                <h3>Selesai</h3>
                <p>{stats.audit_selesai}</p>
              </div>
            </div>
          </div>
          <div className="trend-chart-container">
            {loading ? (
              <div>Loading Chart...</div>
            ) : error ? (
              <div>Error memuat data...</div>
            ) : (
              <Line options={lineChartOptions} data={lineChartData} />
            )}
          </div>
        </div>

        {/* --- 6. JSX BAGIAN BAWAH DIPERBARUI --- */}
        <div className="content-grid">
          <div className="recent-activity">
            <h2>Aktivitas Terbaru</h2>
            <ul>
              {recentActivities.map((activity) => (
                <li key={activity.id}>
                  <span className="activity-icon">
                    {getActivityIcon(activity.type)}
                  </span>
                  <div className="activity-text">
                    <p>{activity.text}</p>
                    <span>{activity.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="quick-actions">
            <h2>Aksi Cepat</h2>
            <div className="action-buttons">
              <button>
                <span className="btn-icon"><BsPlusLg /></span>
                Buat Audit Baru
              </button>
              <button className="secondary">
                <span className="btn-icon"><BsSearch /></span>
                Lihat Semua Temuan
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}