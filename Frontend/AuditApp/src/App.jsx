import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// ✅ Layout & guard tidak perlu lazy (kecil, selalu dipakai)
import MainLayout from "../../Shared/components/MainLayout.jsx";
import ProtectedRouter from "../../Shared/components/ProtectedRoute.jsx";

// ✅ Semua halaman di-lazy load — browser hanya download chunk yang dibutuhkan
const LoginPage        = lazy(() => import('./pages/LoginPage.jsx'));
const Dashboard        = lazy(() => import('./pages/Dashboard.jsx'));
const UserManagementPage = lazy(() => import('./pages/UserManagementPage.jsx'));
const ProfilSpiPage    = lazy(() => import('./pages/Profil SPI/ProfilSPIPage.jsx'));
const InternalAuditPage = lazy(() => import('./pages/Internal Audit/InternalAuditPage.jsx'));
const ExternalAudit    = lazy(() => import('./pages/eksternalaudit.jsx'));
const AuditFindings    = lazy(() => import('./pages/temuanaudit.jsx'));
const FollowUp         = lazy(() => import('./pages/tindaklanjut.jsx'));
const MasterDataPage   = lazy(() => import('./pages/Master Data/MasterDataPage.jsx'));
const PengaturanPage   = lazy(() => import('./pages/Pengaturan/PengaturanPage.jsx'));
const DocumentRepository = lazy(() => import('./pages/DocumentRepository.jsx'));
const AssuranceDetail  = lazy(() => import('./pages/Internal Audit/detailassurance.jsx'));
const ExternalAuditDetail = lazy(() => import('./pages/ExternalAuditDetail.jsx'));
const ConsultingDetail = lazy(() => import('./pages/Internal Audit/ConsultingDetail.jsx'));

// Fallback loading spinner saat chunk sedang di-download
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
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
              <Route path="/external/audit/:id" element={<ExternalAuditDetail />} />
              <Route path="/consulting/:id" element={<ConsultingDetail />} />

              {/* Tambahkan rute lain di sini */}
            </Route>
          </Route>

      </Routes>
    </Suspense>
  );
}

export default App;
