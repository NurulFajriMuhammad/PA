import React from 'react';
import { useParams } from 'react-router-dom';
import VisiMisiSPI from './visimisi';
import StrategiPengawasanSPI from './tujuan-sasarn';
import PiagamAuditSPI from './piagamauditinternal';
import StrukturSpiPage from './strukturSPI';
import ProfilPengawas from './profilpengawasSPI';
import AchievementSPI from './achievementSPI';
import AuditUniverseSPI from './audituniverse';
import RenstraSPI from './renstraSPI';
import PKPTSpiPage from './PKPTSPI';
import RKASpiPage from './RKASPI';
import DasarHukumSpiPage from './dasarhukumSPI';
import StandarAuditSpiPage from './standaraudit';

const ProfilSpiPage = () => {
  const { slug } = useParams();

  const renderContent = () => {
    switch (slug) {
      case 'visi-misi':
        return <VisiMisiSPI />;
      
      case 'tujuan-sasaran':
        return <StrategiPengawasanSPI />;

      case 'piagam-audit':
        return <PiagamAuditSPI />;

      case 'struktur-organisasi':
        return <StrukturSpiPage />;

      case 'profil-pengawas':
        return <ProfilPengawas />;
      
      case 'achievement':
        return <AchievementSPI />;

      case 'audit-universe':
        return <AuditUniverseSPI />;

      case 'rencana-panjang': 
        return <RenstraSPI />;

      case 'rencana-tahunan':
        return <PKPTSpiPage />;
      
      case 'rencana-anggaran':
        return <RKASpiPage />;
      
      case 'dasar-hukum':
        return <DasarHukumSpiPage />;
      
      case 'standar-audit':
        return <StandarAuditSpiPage />;

      default:
        return (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
            <h1 className="text-4xl font-bold text-gray-300 mb-4">404</h1>
            <p className="text-gray-500">Maaf, halaman profil <strong>{slug}</strong> tidak ditemukan.</p>
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

export default ProfilSpiPage;