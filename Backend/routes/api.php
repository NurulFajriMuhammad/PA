<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\DashboardController;

// BUNGKUS RUTE AUTH.PHP DENGAN MIDDLEWARE INI
Route::middleware(\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class)
    ->group(function () {
        require __DIR__.'/auth.php';
    });

// Rute ini untuk mengambil data user SETELAH login
Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// Rute-rute ini hanya bisa diakses oleh 'admin' yang sudah login
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/roles', [UserController::class, 'getRoles']);
    Route::get('/dashboard-stats', [DashboardController::class, 'getStats']);
});