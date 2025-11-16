<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\ApiRouteController;

// -----------------------------------------------------------------
// RUTE PUBLIK (Untuk Login, Register, dll)
// -----------------------------------------------------------------

require __DIR__ . '/auth.php';


// -----------------------------------------------------------------
// RUTE PRIVAT (Wajib Login / Punya Token)
// -----------------------------------------------------------------
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
     Route::apiResource('/routes', 'ApiRouteController');

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
    Route::post('/users', [UserController::class, 'store'])->middleware('permission:create users');
    Route::put('/users/{user}', [UserController::class, 'update'])->middleware('permission:edit users');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->middleware('permission:delete users');

    // Roles 
    Route::get('/roles', [RoleController::class, 'index']);
    Route::post('/roles', [RoleController::class, 'store'])->middleware('permission:create roles');
    Route::put('/roles/{role}', [RoleController::class, 'update'])->middleware('permission:edit roles');
    Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->middleware('permission:delete roles');

    // Permissions
    Route::get('/permissions', [PermissionController::class, 'index']);
    Route::post('/permissions', [PermissionController::class, 'store'])->middleware('permission:create permissions');
    Route::put('/permissions/{permission}', [PermissionController::class, 'update'])->middleware('permission:edit permissions');
    Route::delete('/permissions/{permission}', [PermissionController::class, 'destroy'])->middleware('permission:delete permissions');

    // API Routes 
// Route::apiResource('api-routes', ApiRouteController::class)->middleware('permission:manage routes');
    Route::apiResource('api-routes', ApiRouteController::class);
});
