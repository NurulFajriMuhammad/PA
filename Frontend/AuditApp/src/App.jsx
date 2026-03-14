import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UserManagementPage from './pages/UserManagementPage.jsx'; 
import LoginPage from './pages/LoginPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MainLayout from "../../Shared/components/MainLayout.jsx";
import ProtectedRouter from "../../Shared/components/ProtectedRoute.jsx";
import ProfilSpiPage from './pages/Profil SPI/ProfilSPIPage.jsx';
import InternalAuditPage from './pages/Internal Audit/InternalAuditPage.jsx';
import ExternalAudit from './pages/eksternalaudit.jsx';
import AuditFindings from './pages/temuanaudit.jsx';
import FollowUp from './pages/tindaklanjut.jsx'; 
import MasterDataPage from './pages/Master Data/MasterDataPage.jsx';
import PengaturanPage from './pages/Pengaturan/PengaturanPage.jsx';
import DocumentRepository from './pages/DocumentRepository.jsx';
import AssuranceDetail from './pages/Internal Audit/detailassurance.jsx';


function App() {
  
  return (
    <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<ProtectedRouter />}> 
          <Route element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="admin/users" element={<UserManagementPage />} />
            <Route path="profil/:slug" element={<ProfilSpiPage />} />
            <Route path="/internal/assurance/:id" element={<AssuranceDetail />} />
            <Route path="/internal/:slug" element={<InternalAuditPage />} />
            <Route path="/external-audit" element={<ExternalAudit />} />
            <Route path="/audit-findings" element={<AuditFindings />} />
            <Route path="/follow-up" element={<FollowUp />} />
            <Route path="master-data/:slug" element={<MasterDataPage />} />
            <Route path="pengaturan/:slug" element={<PengaturanPage />} />
            <Route path="/document-repository" element={<DocumentRepository />} />


            {/* Tambahkan rute lain di sini */}
          </Route>
        </Route>

    </Routes>
  );
}

export default App;