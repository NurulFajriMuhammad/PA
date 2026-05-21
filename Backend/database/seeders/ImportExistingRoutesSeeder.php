<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ApiRoute;

class ImportExistingRoutesSeeder extends Seeder
{
    public function run()
    {
        // Truncate to start fresh
        ApiRoute::truncate();

        $routes = [
            // Dashboard
            ['method' => 'GET', 'path' => 'dashboard-stats', 'controller' => 'DashboardController', 'action' => 'getStats'],

            // Users
            ['method' => 'GET', 'path' => 'users', 'controller' => 'UserController', 'action' => 'index'],
            ['method' => 'POST', 'path' => 'users', 'controller' => 'UserController', 'action' => 'store'],
            ['method' => 'PUT', 'path' => 'users/{user}', 'controller' => 'UserController', 'action' => 'update'],
            ['method' => 'DELETE', 'path' => 'users/{user}', 'controller' => 'UserController', 'action' => 'destroy'],
            ['method' => 'GET', 'path' => 'users-list', 'controller' => 'UserController', 'action' => 'getUsersForDropdown'],

            // Roles
            ['method' => 'GET', 'path' => 'roles', 'controller' => 'RoleController', 'action' => 'index'],
            ['method' => 'POST', 'path' => 'roles', 'controller' => 'RoleController', 'action' => 'store'],
            ['method' => 'PUT', 'path' => 'roles/{role}', 'controller' => 'RoleController', 'action' => 'update'],
            ['method' => 'DELETE', 'path' => 'roles/{role}', 'controller' => 'RoleController', 'action' => 'destroy'],

            // Permissions
            ['method' => 'GET', 'path' => 'permissions', 'controller' => 'PermissionController', 'action' => 'index'],
            ['method' => 'POST', 'path' => 'permissions', 'controller' => 'PermissionController', 'action' => 'store'],
            ['method' => 'PUT', 'path' => 'permissions/{permission}', 'controller' => 'PermissionController', 'action' => 'update'],
            ['method' => 'DELETE', 'path' => 'permissions/{permission}', 'controller' => 'PermissionController', 'action' => 'destroy'],

            // API Routes Management
            ['method' => 'GET', 'path' => 'api-routes', 'controller' => 'ApiRouteController', 'action' => 'index'],
            ['method' => 'POST', 'path' => 'api-routes', 'controller' => 'ApiRouteController', 'action' => 'store'],
            ['method' => 'PUT', 'path' => 'api-routes/{api_route}', 'controller' => 'ApiRouteController', 'action' => 'update'],
            ['method' => 'DELETE', 'path' => 'api-routes/{api_route}', 'controller' => 'ApiRouteController', 'action' => 'destroy'],

            // Internal Audit Charter
            ['method' => 'POST', 'path' => 'charter/upload', 'controller' => 'InternalAuditCharterController', 'action' => 'upload'],
            ['method' => 'GET', 'path' => 'charter/latest', 'controller' => 'InternalAuditCharterController', 'action' => 'getLatest'],
            ['method' => 'GET', 'path' => 'charter/download/{filename}', 'controller' => 'InternalAuditCharterController', 'action' => 'download'],

            // Pengawas
            ['method' => 'GET', 'path' => 'pengawas', 'controller' => 'PengawasController', 'action' => 'index'],
            ['method' => 'POST', 'path' => 'pengawas', 'controller' => 'PengawasController', 'action' => 'store'],
            ['method' => 'DELETE', 'path' => 'pengawas/{id}', 'controller' => 'PengawasController', 'action' => 'destroy'],

            // Audit Universe
            ['method' => 'GET', 'path' => 'audit-universe', 'controller' => 'AuditUniverseController', 'action' => 'index'],
            ['method' => 'POST', 'path' => 'audit-universe', 'controller' => 'AuditUniverseController', 'action' => 'store'],
            ['method' => 'DELETE', 'path' => 'audit-universe/{id}', 'controller' => 'AuditUniverseController', 'action' => 'destroy'],

            // SPI Jangka Panjang
            ['method' => 'GET', 'path' => 'spijangkapanjang', 'controller' => 'spijangkapanjangController', 'action' => 'index'],
            ['method' => 'POST', 'path' => 'spijangkapanjang', 'controller' => 'spijangkapanjangController', 'action' => 'store'],
            ['method' => 'DELETE', 'path' => 'spijangkapanjang/{id}', 'controller' => 'spijangkapanjangController', 'action' => 'destroy'],

            // PKPT SPI
            ['method' => 'GET', 'path' => 'pkptspi', 'controller' => 'pkptspicontroller', 'action' => 'index'],
            ['method' => 'POST', 'path' => 'pkptspi', 'controller' => 'pkptspicontroller', 'action' => 'store'],
            ['method' => 'DELETE', 'path' => 'pkptspi/{id}', 'controller' => 'pkptspicontroller', 'action' => 'destroy'],

            // RKA SPI
            ['method' => 'GET', 'path' => 'rka', 'controller' => 'rkaspicontroller', 'action' => 'index'],
            ['method' => 'POST', 'path' => 'rka', 'controller' => 'rkaspicontroller', 'action' => 'store'],
            ['method' => 'DELETE', 'path' => 'rka/{id}', 'controller' => 'rkaspicontroller', 'action' => 'destroy'],

            // Surat Tugas
            ['method' => 'GET', 'path' => 'surat-tugas', 'controller' => 'surattugascontroller', 'action' => 'index'],
            ['method' => 'POST', 'path' => 'surat-tugas', 'controller' => 'surattugascontroller', 'action' => 'store'],
            ['method' => 'PUT', 'path' => 'surat-tugas/{id}', 'controller' => 'surattugascontroller', 'action' => 'update'],
            ['method' => 'DELETE', 'path' => 'surat-tugas/{id}', 'controller' => 'surattugascontroller', 'action' => 'destroy'],

            // Assurance
            ['method' => 'GET', 'path' => 'assurance', 'controller' => 'assurancecontroller', 'action' => 'index'],
            ['method' => 'POST', 'path' => 'assurance', 'controller' => 'assurancecontroller', 'action' => 'store'],
            ['method' => 'GET', 'path' => 'assurance/{id}', 'controller' => 'assurancecontroller', 'action' => 'show'],
            ['method' => 'PUT', 'path' => 'assurance/{id}', 'controller' => 'assurancecontroller', 'action' => 'update'],
            ['method' => 'DELETE', 'path' => 'assurance/{id}', 'controller' => 'assurancecontroller', 'action' => 'destroy'],

            // KKA Templates
            ['method' => 'GET', 'path' => 'kka-templates', 'controller' => 'kkacontroller', 'action' => 'index'],

            // Perencanaan KKA
            ['method' => 'GET', 'path' => 'assurance/{assuranceId}/kka-perencanaan', 'controller' => 'perencanaancontroller', 'action' => 'getKka'],
            ['method' => 'POST', 'path' => 'assurance/{assuranceId}/kka-perencanaan', 'controller' => 'perencanaancontroller', 'action' => 'storeKka'],
            ['method' => 'GET', 'path' => 'assurance/{assuranceId}/documents', 'controller' => 'perencanaancontroller', 'action' => 'getDocs'],
            ['method' => 'POST', 'path' => 'assurance/{assuranceId}/documents', 'controller' => 'perencanaancontroller', 'action' => 'storeDoc'],
            ['method' => 'DELETE', 'path' => 'documents/{id}', 'controller' => 'perencanaancontroller', 'action' => 'destroyDoc'],
            ['method' => 'DELETE', 'path' => 'kka-perencanaan/{id}', 'controller' => 'perencanaancontroller', 'action' => 'destroyKka'],

            // Pelaksanaan KKA
            ['method' => 'GET', 'path' => 'assurance/{assuranceId}/kka-pelaksanaan', 'controller' => 'KkaPelaksanaanController', 'action' => 'index'],
            ['method' => 'POST', 'path' => 'kka/{kkaId}/upload-lhe', 'controller' => 'KkaPelaksanaanController', 'action' => 'uploadLhe'],
            ['method' => 'GET', 'path' => 'kka/{kkaId}/temuan', 'controller' => 'KkaPelaksanaanController', 'action' => 'getTemuan'],
            ['method' => 'POST', 'path' => 'kka/{kkaId}/temuan', 'controller' => 'KkaPelaksanaanController', 'action' => 'storeTemuan'],
            ['method' => 'DELETE', 'path' => 'temuan/{id}', 'controller' => 'KkaPelaksanaanController', 'action' => 'destroyTemuan'],
            ['method' => 'GET', 'path' => 'kka/{kkaId}/lhe', 'controller' => 'KkaPelaksanaanController', 'action' => 'getLhe'],
            ['method' => 'DELETE', 'path' => 'kka/{kkaId}/lhe', 'controller' => 'KkaPelaksanaanController', 'action' => 'deleteLhe'],
            ['method' => 'PUT', 'path' => 'temuan/{id}', 'controller' => 'KkaPelaksanaanController', 'action' => 'updateTemuan'],
            ['method' => 'POST', 'path' => 'temuan/{id}', 'controller' => 'KkaPelaksanaanController', 'action' => 'updateTemuan'],
            ['method' => 'GET', 'path' => 'temuan/{id}', 'controller' => 'KkaPelaksanaanController', 'action' => 'getTemuanById'],

            // Biaya
            ['method' => 'GET', 'path' => 'assurance/{id}/biaya', 'controller' => 'BiayaController', 'action' => 'index'],
            ['method' => 'POST', 'path' => 'biaya', 'controller' => 'BiayaController', 'action' => 'store'],
            ['method' => 'PUT', 'path' => 'biaya/{id}', 'controller' => 'BiayaController', 'action' => 'update'],
            ['method' => 'DELETE', 'path' => 'biaya/{id}', 'controller' => 'BiayaController', 'action' => 'destroy'],

            // Analisis Temuan
            ['method' => 'POST', 'path' => 'temuan/{id}/analisis', 'controller' => 'AnalisisTemuanController', 'action' => 'store'],
            ['method' => 'GET', 'path' => 'temuan/{id}/analisis', 'controller' => 'AnalisisTemuanController', 'action' => 'show'],
            ['method' => 'GET', 'path' => 'analisis/{temuanId}', 'controller' => 'AnalisisTemuanController', 'action' => 'show'],

            // Tindak Lanjut
            ['method' => 'POST', 'path' => 'tindak-lanjut/generate', 'controller' => 'TindakLanjutController', 'action' => 'generate'],
            ['method' => 'GET', 'path' => 'tindak-lanjut', 'controller' => 'TindakLanjutController', 'action' => 'index'],
            ['method' => 'GET', 'path' => 'tindak-lanjut/{id}', 'controller' => 'TindakLanjutController', 'action' => 'show'],
            ['method' => 'PUT', 'path' => 'tindak-lanjut/{id}', 'controller' => 'TindakLanjutController', 'action' => 'update'],
            ['method' => 'DELETE', 'path' => 'tindak-lanjut/{id}', 'controller' => 'TindakLanjutController', 'action' => 'destroy'],
            ['method' => 'POST', 'path' => 'tindak-lanjut/{id}/detail', 'controller' => 'TindakLanjutController', 'action' => 'storeDetail'],
            ['method' => 'PUT', 'path' => 'tindak-lanjut/{id}/review', 'controller' => 'TindakLanjutController', 'action' => 'review'],
            ['method' => 'GET', 'path' => 'tindak-lanjut/detail/{id}', 'controller' => 'TindakLanjutController', 'action' => 'detail'],
            ['method' => 'POST', 'path' => 'tindak-lanjut/temuan/{id}/close', 'controller' => 'TindakLanjutController', 'action' => 'closeTemuan'],
            ['method' => 'POST', 'path' => 'tindak-lanjut/temuan/{id}/rtl', 'controller' => 'TindakLanjutController', 'action' => 'saveRtl'],

            // External Audit
            ['method' => 'GET', 'path' => 'external-audit', 'controller' => 'ExternalAuditController', 'action' => 'index'],
            ['method' => 'POST', 'path' => 'external-audit', 'controller' => 'ExternalAuditController', 'action' => 'store'],
            ['method' => 'GET', 'path' => 'external-audit/{id}', 'controller' => 'ExternalAuditController', 'action' => 'show'],
            ['method' => 'PUT', 'path' => 'external-audit/{id}', 'controller' => 'ExternalAuditController', 'action' => 'update'],
            ['method' => 'DELETE', 'path' => 'external-audit/{id}', 'controller' => 'ExternalAuditController', 'action' => 'destroy'],
            ['method' => 'GET', 'path' => 'external-audit/{id}/temuan', 'controller' => 'ExternalAuditTemuanController', 'action' => 'index'],
            ['method' => 'POST', 'path' => 'external-audit-temuan', 'controller' => 'ExternalAuditTemuanController', 'action' => 'store'],
            ['method' => 'PUT', 'path' => 'external-audit-temuan/{id}', 'controller' => 'ExternalAuditTemuanController', 'action' => 'update'],
            ['method' => 'DELETE', 'path' => 'external-audit-temuan/{id}', 'controller' => 'ExternalAuditTemuanController', 'action' => 'destroy'],
            ['method' => 'GET', 'path' => 'external-audit/{id}/transitions', 'controller' => 'ExternalAuditController', 'action' => 'availableTransitions'],
            ['method' => 'POST', 'path' => 'external-audit/{id}/transition', 'controller' => 'ExternalAuditController', 'action' => 'executeTransition'],
            ['method' => 'POST', 'path' => 'external-audit/{id}/bulk-update-temuan-status', 'controller' => 'ExternalAuditController', 'action' => 'bulkUpdateTemuanStatus'],

            // Advisory Service
            ['method' => 'GET', 'path' => 'advisory-service', 'controller' => 'AdvisoryServiceController', 'action' => 'index'],
            ['method' => 'POST', 'path' => 'advisory-service', 'controller' => 'AdvisoryServiceController', 'action' => 'store'],
            ['method' => 'PUT', 'path' => 'advisory-service/{id}', 'controller' => 'AdvisoryServiceController', 'action' => 'update'],
            ['method' => 'DELETE', 'path' => 'advisory-service/{id}', 'controller' => 'AdvisoryServiceController', 'action' => 'destroy'],

            // Audit Evaluasi
            ['method' => 'GET', 'path' => 'audit-evaluasi', 'controller' => 'AuditEvaluasiController', 'action' => 'index'],
            ['method' => 'POST', 'path' => 'audit-evaluasi', 'controller' => 'AuditEvaluasiController', 'action' => 'store'],
            ['method' => 'PUT', 'path' => 'audit-evaluasi/{id}', 'controller' => 'AuditEvaluasiController', 'action' => 'update'],
            ['method' => 'DELETE', 'path' => 'audit-evaluasi/{id}', 'controller' => 'AuditEvaluasiController', 'action' => 'destroy'],

            // Consulting
            ['method' => 'GET', 'path' => 'consulting', 'controller' => 'ConsultingController', 'action' => 'index'],
            ['method' => 'POST', 'path' => 'consulting', 'controller' => 'ConsultingController', 'action' => 'store'],
            ['method' => 'PUT', 'path' => 'consulting/{id}', 'controller' => 'ConsultingController', 'action' => 'update'],
            ['method' => 'DELETE', 'path' => 'consulting/{id}', 'controller' => 'ConsultingController', 'action' => 'destroy'],

            // Chat Consulting
            ['method' => 'GET', 'path' => 'consulting/{id}', 'controller' => 'ConsultingMessageController', 'action' => 'show'],
            ['method' => 'GET', 'path' => 'consulting/{id}/messages', 'controller' => 'ConsultingMessageController', 'action' => 'messages'],
            ['method' => 'POST', 'path' => 'consulting/send', 'controller' => 'ConsultingMessageController', 'action' => 'send'],

            // Status Pemeriksaan
            ['method' => 'GET', 'path' => 'status-pemeriksaan', 'controller' => 'StatusPemeriksaanController', 'action' => 'index'],
            ['method' => 'POST', 'path' => 'status-pemeriksaan', 'controller' => 'StatusPemeriksaanController', 'action' => 'store'],
            ['method' => 'GET', 'path' => 'status-pemeriksaan/{id}', 'controller' => 'StatusPemeriksaanController', 'action' => 'show'],
            ['method' => 'PUT', 'path' => 'status-pemeriksaan/{id}', 'controller' => 'StatusPemeriksaanController', 'action' => 'update'],
            ['method' => 'DELETE', 'path' => 'status-pemeriksaan/{id}', 'controller' => 'StatusPemeriksaanController', 'action' => 'destroy'],

            // Status Temuan
            ['method' => 'GET', 'path' => 'status-temuan', 'controller' => 'StatusTemuanController', 'action' => 'index'],
            ['method' => 'POST', 'path' => 'status-temuan', 'controller' => 'StatusTemuanController', 'action' => 'store'],
            ['method' => 'PUT', 'path' => 'status-temuan/{id}', 'controller' => 'StatusTemuanController', 'action' => 'update'],
            ['method' => 'DELETE', 'path' => 'status-temuan/{id}', 'controller' => 'StatusTemuanController', 'action' => 'destroy'],

            // Document Repository
            ['method' => 'GET', 'path' => 'document-repository', 'controller' => 'DocumentRepositoryController', 'action' => 'index'],
            ['method' => 'POST', 'path' => 'document-repository/sync', 'controller' => 'DocumentRepositoryController', 'action' => 'sync'],
            ['method' => 'GET', 'path' => 'document-repository/statistics', 'controller' => 'DocumentRepositoryController', 'action' => 'statistics'],
            ['method' => 'GET', 'path' => 'document-repository/download/{id}', 'controller' => 'DocumentRepositoryController', 'action' => 'download'],

            // Semua Temuan
            ['method' => 'GET', 'path' => 'semua-temuan', 'controller' => 'SemuaTemuanController', 'action' => 'index'],

            // Pengajuan Transitions
            ['method' => 'GET', 'path' => 'pengajuan-transitions', 'controller' => 'PengajuanTransitionController', 'action' => 'index'],
            ['method' => 'POST', 'path' => 'pengajuan-transitions', 'controller' => 'PengajuanTransitionController', 'action' => 'store'],
            ['method' => 'PUT', 'path' => 'pengajuan-transitions/{id}', 'controller' => 'PengajuanTransitionController', 'action' => 'update'],
            ['method' => 'DELETE', 'path' => 'pengajuan-transitions/{id}', 'controller' => 'PengajuanTransitionController', 'action' => 'destroy'],

            // Status Pemeriksaan Akses
            ['method' => 'GET', 'path' => 'status-pemeriksaan-akses', 'controller' => 'StatusPemeriksaanAksesController', 'action' => 'index'],
            ['method' => 'POST', 'path' => 'status-pemeriksaan-akses', 'controller' => 'StatusPemeriksaanAksesController', 'action' => 'store'],
            ['method' => 'POST', 'path' => 'status-pemeriksaan-akses/bulk', 'controller' => 'StatusPemeriksaanAksesController', 'action' => 'bulkStore'],
            ['method' => 'DELETE', 'path' => 'status-pemeriksaan-akses/{id}', 'controller' => 'StatusPemeriksaanAksesController', 'action' => 'destroy'],

            // Periode Audit
            ['method' => 'GET', 'path' => 'periode-audit', 'controller' => 'PeriodeAuditController', 'action' => 'index'],
            ['method' => 'POST', 'path' => 'periode-audit', 'controller' => 'PeriodeAuditController', 'action' => 'store'],
            ['method' => 'PUT', 'path' => 'periode-audit/{id}', 'controller' => 'PeriodeAuditController', 'action' => 'update'],
            ['method' => 'DELETE', 'path' => 'periode-audit/{id}', 'controller' => 'PeriodeAuditController', 'action' => 'destroy'],
        ];

        foreach ($routes as $r) {
            ApiRoute::updateOrCreate(
                ['method' => $r['method'], 'path' => $r['path']],
                ['controller' => $r['controller'], 'action' => $r['action'], 'is_active' => true]
            );
        }
    }
}
