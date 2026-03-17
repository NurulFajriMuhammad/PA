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


// -----------------------------------------------------------------
// RUTE PUBLIK (Untuk Login, Register, dll)
// -----------------------------------------------------------------

require __DIR__ . '/auth.php';

Route::middleware('auth:sanctum')->group(function () {

     // Route::get('/check-auth', function () {
     //      return [
     //           'user' => auth()->user(),
     //           'roles' => auth()->user()->roles->pluck('name'),
     //           'permissions' => auth()->user()->getAllPermissions()->pluck('name')
     //      ];
     // });


     Route::get('/user', function (Request $request) {
          $user = $request->user();
          $user->load('roles', 'permissions');
          return $user;
     });
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
     // Route::get('/assurance/{assuranceId}/biaya', [BiayaController::class, 'index']);
     // Route::post('/biaya', [BiayaController::class, 'store']);
     // Route::put('/biaya/{id}', [BiayaController::class, 'update']);
     // Route::delete('/biaya/{id}', [BiayaController::class, 'destroy']);

     Route::get('/assurance/{id}/biaya', [BiayaController::class, 'index']);
     Route::post('/biaya', [BiayaController::class, 'store']);
     Route::put('/biaya/{id}', [BiayaController::class, 'update']);
     Route::delete('/biaya/{id}', [BiayaController::class, 'destroy']);
          

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
