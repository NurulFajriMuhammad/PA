import React, { useState, useEffect } from 'react'; // <-- Import hook
import apiClient from '../api/axios'; // <-- Import apiClient Anda

export default function Dashboard() {
  // 1. Buat state untuk menampung data statistik, loading, dan error
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data placeholder untuk aktivitas terbaru (ini masih statis)
  const recentActivities = [
    { id: 1, text: 'Audit A-123 telah disetujui.', time: '2 jam lalu' },
    { id: 2, text: 'Temuan baru ditambahkan pada Audit B-456.', time: '5 jam lalu' },
    { id: 3, text: 'Auditee (User X) mengirim pesan baru.', time: '1 hari lalu' },
  ];

  // 2. Gunakan useEffect untuk mengambil data saat komponen dimuat
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setError(null); // Reset error
        setLoading(true); // Mulai loading
        
        // Panggil endpoint API yang baru kita buat
        const response = await apiClient.get('/api/dashboard-stats');
        
        if (response.data && response.data.success) {
          setStats(response.data.data); // Simpan data ke state
        } else {
          setError('Gagal mengambil data statistik.');
        }
      } catch (err) {
        console.error(err);
        setError('Terjadi kesalahan koneksi ke server.');
      } finally {
        setLoading(false); // Selesai loading
      }
    };

    fetchDashboardStats();
  }, []); // [] berarti hanya dijalankan sekali saat komponen dimuat

  // 3. Fungsi untuk render kartu statistik (agar lebih rapi)
  const renderStatCards = () => {
    if (loading) {
      return (
        // Tampilkan placeholder saat loading
        <>
          <div className="stat-card loading">Memuat...</div>
          <div className="stat-card loading">Memuat...</div>
          <div className="stat-card loading">Memuat...</div>
          <div className="stat-card loading">Memuat...</div>
        </>
      );
    }
    
    if (error || !stats) {
      return <p className="error-message">{error || 'Data statistik tidak tersedia.'}</p>;
    }

    // Tampilkan data dari state jika sukses
    return (
      <>
        <div className="stat-card">
          <h3>Total Audit</h3>
          <p>{stats.total_audit}</p>
        </div>
        <div className="stat-card">
          <h3>Audit Berlangsung</h3>
          <p>{stats.audit_berlangsung}</p>
        </div>
        <div className="stat-card">
          <h3>Temuan</h3>
          <p>{stats.total_temuan}</p>
        </div>
        <div className="stat-card">
          <h3>Selesai</h3>
          <p>{stats.audit_selesai}</p>
        </div>
      </>
    );
  };

  return (
    <>
      <style>
        {`
          .dashboard-container {
            font-family: Arial, sans-serif;
            padding: 24px;
            max-width: 1200px;
            margin: 0 auto;
            background-color: #f4f7f6;
          }

          .dashboard-header {
            border-bottom: 2px solid #eee;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }

          .dashboard-header h1 {
            margin: 0;
            color: #333;
          }

          .dashboard-header p {
            margin: 4px 0 0;
            font-size: 1.1em;
            color: #555;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 24px;
          }

          .stat-card {
            background-color: #ffffff;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            transition: transform 0.2s;
          }

          .stat-card:hover {
            transform: translateY(-5px);
          }

          .stat-card h3 {
            margin: 0 0 10px;
            font-size: 1.1em;
            color: #444;
          }

          .stat-card p {
            margin: 0;
            font-size: 2em;
            font-weight: bold;
            color: #007bff;
          }

          .recent-activity,
          .quick-actions {
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 24px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }

          .recent-activity h2,
          .quick-actions h2 {
            margin-top: 0;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
          }

          .recent-activity ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .recent-activity li {
            padding: 12px 0;
            border-bottom: 1px solid #f0f0f0;
          }

          .recent-activity li:last-child {
            border-bottom: none;
          }

          .recent-activity p {
            margin: 0;
            font-size: 1em;
          }

          .recent-activity span {
            font-size: 0.9em;
            color: #888;
          }

          .quick-actions button {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1em;
            margin-right: 10px;
            transition: background-color 0.2s;
          }

          .quick-actions button:hover {
            background-color: #0056b3;
          }

          .dashboard-container {
            font-family: Arial, sans-serif;
            padding: 24px;
            max-width: 1200px;
            margin: 0 auto;
            background-color: #f4f7f6;
          }
          .dashboard-header {
            border-bottom: 2px solid #eee;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .dashboard-header h1 { margin: 0; color: #333; }
          .dashboard-header p { margin: 4px 0 0; font-size: 1.1em; color: #555; }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 24px;
          }
          .stat-card {
            background-color: #ffffff;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            transition: transform 0.2s;
          }
          .stat-card:hover { transform: translateY(-5px); }
          .stat-card h3 { margin: 0 0 10px; font-size: 1.1em; color: #444; }
          .stat-card p { margin: 0; font-size: 2em; font-weight: bold; color: #007bff; }
          .recent-activity,
          .quick-actions {
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 24px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }
          .recent-activity h2,
          .quick-actions h2 { margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          .recent-activity ul { list-style: none; padding: 0; margin: 0; }
          .recent-activity li { padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
          .recent-activity li:last-child { border-bottom: none; }
          .recent-activity p { margin: 0; font-size: 1em; }
          .recent-activity span { font-size: 0.9em; color: #888; }
          .quick-actions button {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1em;
            margin-right: 10px;
            transition: background-color 0.2s;
          }
          .quick-actions button:hover { background-color: #0056b3; }

          /* 4. Style tambahan untuk loading dan error */
          .stat-card.loading {
            background-color: #f9f9f9;
            color: #aaa;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1em;
          }
          .error-message {
            grid-column: 1 / -1; /* Lebarkan pesan error di semua kolom grid */
            text-align: center;
            padding: 20px;
            background-color: #ffebee;
            color: #c62828;
            border-radius: 8px;
          }
        `}
      </style>

      {/* Konten JSX/HTML */}
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Dashboard Audit Management</h1>
          <p>Selamat datang, [Nama User]!</p>
        </header>

        {/* 5. Panggil fungsi render kartu statistik */}
        <div className="stats-grid">
          {renderStatCards()}
        </div>

        {/* Aktivitas Terbaru (masih statis) */}
        <div className="recent-activity">
          <h2>Aktivitas Terbaru</h2>
          <ul>
            {recentActivities.map((activity) => (
              <li key={activity.id}>
                <p>{activity.text}</p>
                <span>{activity.time}</span>
              </li>
            ))}
</ul>
        </div>

        {/* Tombol Aksi Cepat (masih statis) */}
        <div className="quick-actions">
          <h2>Aksi Cepat</h2>
          <button>+ Buat Audit Baru</button>
          <button>Lihat Semua Temuan</button>
        </div>
      </div>
    </>
  );
}