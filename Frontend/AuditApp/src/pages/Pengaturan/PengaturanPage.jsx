import React from 'react';
import { useParams } from 'react-router-dom';
import StatusPengajuan from './statuspengajuan.jsx'; 
import SettingPengajuan from './settingpengajuan.jsx';
import HakAkses from './readonly.jsx';
import StatusTemuan from './statustemuan.jsx';
import PeriodeAudit from './periodeaudit.jsx';

const PengaturanPage = () => {
  const { slug } = useParams();

  const renderContent = () => {
    switch (slug) {
      case 'status-pengajuan':
        return <StatusPengajuan />;

        case 'setting-pengajuan':
            return <SettingPengajuan />;
        
        case 'read-only':
            return <HakAkses />;

        case 'status-temuan':
            return <StatusTemuan />;
        
        case 'periode':
            return <PeriodeAudit />;

      default:
        return (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center m-6">
            <h1 className="text-4xl font-bold text-gray-300 mb-4">404</h1>
            <p className="text-gray-500">
              Maaf, modul pengaturan <strong>{slug}</strong> tidak ditemukan atau sedang dalam pengembangan.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {renderContent()}
    </div>
  );
};

export default PengaturanPage;
