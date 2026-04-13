<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\InternalAuditCharterController;
use App\Http\Controllers\PengawasController;
use App\Http\Controllers\AuditUniverseController;
use App\Http\Controllers\spijangkapanjangController;
use App\Http\Controllers\pkptspicontroller;
use App\Http\Controllers\rkaspicontroller;
use App\Http\Controllers\surattugascontroller;
use App\Http\Controllers\assurancecontroller;
use App\Http\Controllers\kkacontroller;
use App\Http\Controllers\perencanaancontroller;
use App\Http\Controllers\KkaPelaksanaanController;
use App\Http\Controllers\BiayaController;
use App\Http\Controllers\AnalisisTemuanController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TindakLanjutController;
use App\Http\Controllers\ExternalAuditController;
use App\Http\Controllers\ExternalAuditTemuanController;
use App\Http\Controllers\AdvisoryServiceController;
use App\Http\Controllers\AuditEvaluasiController;
use App\Http\Controllers\ConsultingController;
use App\Http\Controllers\ConsultingMessageController;
use App\Http\Controllers\StatusPemeriksaanController;
use App\Http\Controllers\Api\UnitController;
use App\Http\Controllers\Api\JabatanController;
use App\Http\Controllers\Api\PermissionMatrixController;





// -----------------------------------------------------------------
// RUTE PUBLIK (Untuk Login, Register, dll)
// -----------------------------------------------------------------

require __DIR__ . '/auth.php';

Route::get('/report/{id}', [ReportController::class, 'show']);


Route::middleware('auth:sanctum')->group(function () {
     
     // Route::get('/check-auth', function () {
     //      return [
          //           'user' => auth()->user(),
          //           'roles' => auth()->user()->roles->pluck('name'),
          //           'permissions' => auth()->user()->getAllPermissions()->pluck('name')
          //      ];
          // });
          
          
          // Route::get('/user', function (Request $request) {
          //      $user = $request->user();
          //      $user->load('roles', 'permissions');
          //      return $user;
          //      });

    Route::get('/user', function (Request $request) {
        return $request->user()->load(['roles', 'jabatan.permissions.module']);
    });

    // --- MODUL SURAT TUGAS DENGAN PROTEKSI ---
    Route::middleware('check.access:SURAT_TUGAS,can_read')->group(function () {
        Route::get('/surat-tugas', [surattugascontroller::class, 'index']);
    });

    Route::middleware('check.access:SURAT_TUGAS,can_write')->group(function () {
        Route::post('/surat-tugas', [surattugascontroller::class, 'store']);
        Route::put('/surat-tugas/{id}', [surattugascontroller::class, 'update']);
    });

    Route::middleware('check.access:SURAT_TUGAS,can_delete')->group(function () {
        Route::delete('/surat-tugas/{id}', [surattugascontroller::class, 'destroy']);
    });

     Route::apiResource('units', UnitController::class);
     Route::apiResource('jabatans', JabatanController::class);
     Route::get('/permission-matrix', [PermissionMatrixController::class, 'index']);
     Route::post('/permission-matrix/update', [PermissionMatrixController::class, 'updateMatrix']);
     // Route::apiResource('/routes', 'ApiRouteController');
     // Route::apiResource('/routes', ApiRouteController::class);

     // Route::get('/users', [UserController::class, 'index']);
     // //     ->middleware('permission:view users');
     // Route::post('/users', [UserController::class, 'store'])
     //      ->middleware('permission:create users');
     // Route::put('/users/{user}', [UserController::class, 'update'])
     //      ->middleware('permission:edit users');
     // Route::delete('/users/{user}', [UserController::class, 'destroy'])
     //      ->middleware('permission:delete users');

     // Route::get('/roles', [RoleController::class, 'index']);
     //      // ->middleware('permission:view roles');
     // Route::post('/roles', [RoleController::class, 'store']);
     //      // ->middleware('permission:create roles');
     // Route::put('/roles/{role}', [RoleController::class, 'update']);
     //      // ->middleware('permission:edit roles');
     // Route::delete('/roles/{role}', [RoleController::class, 'destroy'])
     //      ->middleware('permission:delete roles');

     // Route::get('/permissions', [PermissionController::class, 'index']);
     //      // ->middleware('permission:view permissions');
     // Route::post('/permissions', [PermissionController::class, 'store']);
     //      // ->middleware('permission:create permissions');
     // Route::delete('/permissions/{permission}', [PermissionController::class, 'destroy'])
     //      ->middleware('permission:delete permissions');

     Route::get('/dashboard-stats', [DashboardController::class, 'getStats'])
          ->middleware('permission:view dashboard');

     // Users
     Route::get('/users', [UserController::class, 'index']);
     Route::post('/users', [UserController::class, 'store']);
     Route::put('/users/{user}', [UserController::class, 'update']);
     Route::delete('/users/{user}', [UserController::class, 'destroy']);

     // Roles 
     Route::get('/roles', [RoleController::class, 'index']);
     Route::post('/roles', [RoleController::class, 'store']);
     Route::put('/roles/{role}', [RoleController::class, 'update']);
     Route::delete('/roles/{role}', [RoleController::class, 'destroy']);

     // Permissions
     Route::get('/permissions', [PermissionController::class, 'index']);
     Route::post('/permissions', [PermissionController::class, 'store']);
     Route::put('/permissions/{permission}', [PermissionController::class, 'update']);
     Route::delete('/permissions/{permission}', [PermissionController::class, 'destroy']);

     Route::apiResource('api-routes', \App\Http\Controllers\Api\ApiRouteController::class);

     Route::post('/charter/upload', [InternalAuditCharterController::class, 'upload']);
     Route::get('/charter/latest', [InternalAuditCharterController::class, 'getLatest']);
     Route::get('/charter/download/{filename}', [InternalAuditCharterController::class, 'download']);
     Route::apiResource('pengawas', PengawasController::class);
     Route::get('/pengawas', [PengawasController::class, 'index']);
     Route::post('/pengawas', [PengawasController::class, 'store']);
     Route::delete('/pengawas/{id}', [PengawasController::class, 'destroy']);
     Route::get('/audit-universe', [AuditUniverseController::class, 'index']);
     Route::post('/audit-universe', [AuditUniverseController::class, 'store']);
     Route::delete('/audit-universe/{id}', [AuditUniverseController::class, 'destroy']);
     Route::get('/spijangkapanjang', [spijangkapanjangController::class, 'index']);
     Route::post('/spijangkapanjang', [spijangkapanjangController::class, 'store']);
     Route::delete('/spijangkapanjang/{id}', [spijangkapanjangController::class, 'destroy']);
     Route::apiResource('pkptspi', pkptspicontroller::class);
     Route::get('/pkptspi', [pkptspicontroller::class, 'index']);
     Route::post('/pkptspi', [pkptspicontroller::class, 'store']);
     Route::delete('/pkptspi/{id}', [pkptspicontroller::class, 'destroy']);
     Route::apiResource('rka', rkaspicontroller::class);
     Route::get('/rka', [rkaspicontroller::class, 'index']);
     Route::post('/rka', [rkaspicontroller::class, 'store']);
     Route::delete('/rka/{id}', [rkaspicontroller::class, 'destroy']);

     Route::apiResource('surattugas', surattugascontroller::class);
     Route::get('/surat-tugas', [surattugascontroller::class, 'index']);
     Route::post('/surat-tugas', [surattugascontroller::class, 'store']);
     Route::put('/surat-tugas/{id}', [surattugascontroller::class, 'update']);
     Route::delete('/surat-tugas/{id}', [surattugascontroller::class, 'destroy']);
     Route::get('/users-list', [UserController::class, 'getUsersForDropdown']);
     Route::apiResource('assurane', assurancecontroller::class);
     Route::get('/assurance', [assurancecontroller::class, 'index']);      // Ambil semua data
     Route::post('/assurance', [assurancecontroller::class, 'store']);     // Tambah data
     Route::get('/assurance/{id}', [assurancecontroller::class, 'show']);  // Detail data
     Route::put('/assurance/{id}', [assurancecontroller::class, 'update']); // Update data
     Route::delete('/assurance/{id}', [assurancecontroller::class, 'destroy']); // Hapus data

     Route::apiResource('kka-templates', kkacontroller::class);
     Route::get('/assurance/{assuranceId}/kka-perencanaan', [perencanaancontroller::class, 'getKka']);
     Route::get('/assurance/{assuranceId}/documents', [perencanaancontroller::class, 'getDocs']);
     Route::post('/assurance/{assuranceId}/documents', [perencanaancontroller::class, 'storeDoc']);
     Route::post('/assurance/{assuranceId}/kka-perencanaan', [perencanaancontroller::class, 'storeKka']);
     Route::get('/assurance/{assuranceId}/kka-pelaksanaan', [KkaPelaksanaanController::class, 'index']);
     Route::post('/kka/{kkaId}/upload-lhe', [KkaPelaksanaanController::class, 'uploadLhe']);
     Route::get('/kka/{kkaId}/temuan', [KkaPelaksanaanController::class, 'getTemuan']);
     Route::post('/kka/{kkaId}/temuan', [KkaPelaksanaanController::class, 'storeTemuan']);
     Route::delete('/temuan/{id}', [KkaPelaksanaanController::class, 'destroyTemuan']);
     Route::get('/kka/{kkaId}/lhe',[KkaPelaksanaanController::class,'getLhe']);
     Route::delete('/kka/{kkaId}/lhe',[KkaPelaksanaanController::class,'deleteLhe']);
     Route::post('/temuan/{id}', [KkaPelaksanaanController::class, 'updateTemuan']);
     Route::put('/temuan/{id}', [KkaPelaksanaanController::class, 'updateTemuan']);

     Route::get('/assurance/{id}/biaya', [BiayaController::class, 'index']);
     Route::post('/biaya', [BiayaController::class, 'store']);
     Route::put('/biaya/{id}', [BiayaController::class, 'update']);
     Route::delete('/biaya/{id}', [BiayaController::class, 'destroy']);

     Route::post('/temuan/{id}/analisis', [AnalisisTemuanController::class, 'store']);
     Route::get('/temuan/{id}/analisis', [AnalisisTemuanController::class, 'show']);
     Route::get('/temuan/{id}', [KkaPelaksanaanController::class, 'getTemuanById']);
     Route::get('/tindak-lanjut', [AnalisisTemuanController::class, 'index']);
     Route::get('/analisis/{temuanId}', [AnalisisTemuanController::class, 'show']);

     // Route::get('/report/{id}', [ReportController::class, 'report']);
     // Route::get('/report/{id}', [ReportController::class, 'show']);

     Route::post('/tindak-lanjut/generate', [TindakLanjutController::class, 'generate']);
     Route::get('/tindak-lanjut', [TindakLanjutController::class, 'index']);
     Route::get('/tindak-lanjut/{id}', [TindakLanjutController::class, 'show']);
     Route::put('/tindak-lanjut/{id}', [TindakLanjutController::class, 'update']);
     Route::post('/tindak-lanjut/{id}/detail', [TindakLanjutController::class, 'storeDetail']);
     Route::put('/tindak-lanjut/{id}/review', [TindakLanjutController::class, 'review']);
     Route::get('/tindak-lanjut/detail/{id}', [TindakLanjutController::class, 'detail']);



// =========================
// EXTERNAL AUDIT
// =========================
Route::apiResource('external-audit', ExternalAuditController::class);
// Route::get('/external-audit', [ExternalAuditController::class, 'index']);
// Route::post('/external-audit', [ExternalAuditController::class, 'store']);
// Route::get('/external-audit/{id}', [ExternalAuditController::class, 'show']);
// Route::put('/external-audit/{id}', [ExternalAuditController::class, 'update']);
// Route::delete('/external-audit/{id}', [ExternalAuditController::class, 'destroy']);


// GET by external audit
Route::get('external-audit/{id}/temuan', [ExternalAuditTemuanController::class, 'index']);
Route::post('external-audit-temuan', [ExternalAuditTemuanController::class, 'store']);
Route::put('external-audit-temuan/{id}', [ExternalAuditTemuanController::class, 'update']);
Route::delete('external-audit-temuan/{id}', [ExternalAuditTemuanController::class, 'destroy']);
               

Route::get('/advisory-service', [AdvisoryServiceController::class, 'index']);
Route::post('/advisory-service', [AdvisoryServiceController::class, 'store']);
Route::put('/advisory-service/{id}', [AdvisoryServiceController::class, 'update']); // pakai _method PUT
Route::delete('/advisory-service/{id}', [AdvisoryServiceController::class, 'destroy']);
Route::get('/units', [AdvisoryServiceController::class, 'getUnits']);

Route::get('/audit-evaluasi', [AuditEvaluasiController::class, 'index']);
Route::post('/audit-evaluasi', [AuditEvaluasiController::class, 'store']);
Route::put('/audit-evaluasi/{id}', [AuditEvaluasiController::class, 'update']);
Route::delete('/audit-evaluasi/{id}', [AuditEvaluasiController::class, 'destroy']);




/*
|--------------------------------------------------------------------------
| CONSULTING
|--------------------------------------------------------------------------
*/

Route::get('/consulting', [ConsultingController::class, 'index']);
Route::post('/consulting', [ConsultingController::class, 'store']);
Route::put('/consulting/{id}', [ConsultingController::class, 'update']);
Route::delete('/consulting/{id}', [ConsultingController::class, 'destroy']);

/*
|--------------------------------------------------------------------------
| CHAT CONSULTING
|--------------------------------------------------------------------------
*/
Route::get('/consulting/{id}', [ConsultingMessageController::class, 'show']);
Route::get('/consulting/{id}/messages', [ConsultingMessageController::class, 'messages']);
Route::post('/consulting/send', [ConsultingMessageController::class, 'send']);


// Route::get('/units', function () {
//     return \App\Models\Unit::select('id','nama')->get();
// });

Route::get('/roles', function () {
    return \Spatie\Permission\Models\Role::select('id','name')->get();
});



Route::get('/status-pemeriksaan', [StatusPemeriksaanController::class, 'index']);
Route::post('/status-pemeriksaan', [StatusPemeriksaanController::class, 'store']);
Route::get('/status-pemeriksaan/{id}', [StatusPemeriksaanController::class, 'show']);
Route::put('/status-pemeriksaan/{id}', [StatusPemeriksaanController::class, 'update']);
Route::delete('/status-pemeriksaan/{id}', [StatusPemeriksaanController::class, 'destroy']);
     // API Routes 
     // Route::apiResource('api-routes', ApiRouteController::class)->middleware('permission:manage routes');
     //     Route::apiResource('api-routes', ApiRouteController::class);
     //     Route::apiResource('api-routes', ApiRouteController::class);
     //   ->middleware('permission:manage routes');


     // Route::get('/api-routes', [ApiRouteController::class, 'index']);
     // Route::post('/api-routes', [ApiRouteController::class, 'store']);
     // Route::put('/api-routes/{apiRoute}', [ApiRouteController::class, 'update']);
     // Route::delete('/api-routes/{apiRoute}', [ApiRouteController::class, 'destroy']);
});
