import React from 'react';
import { useParams } from 'react-router-dom';
import TemplateKKA from './templateKKA';
import ChecklistPemeriksaan from './checklist';

const MasterDataPage = () => {
  const { slug } = useParams();

  const renderContent = () => {
    switch (slug) {

      case 'template-kka':
        return <TemplateKKA />;

      case 'checklist-pemeriksaan':
        return <ChecklistPemeriksaan />;



      default:
        return (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
            <h1 className="text-4xl font-bold text-gray-300 mb-4">404</h1>
            <p className="text-gray-500">
              Maaf, modul audit <strong>{slug}</strong> tidak ditemukan atau sedang dalam pengembangan.
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

export default MasterDataPage;
