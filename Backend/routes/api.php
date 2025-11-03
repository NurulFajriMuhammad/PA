<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\DashboardController;

// Route::get('/tes', function () {
//     return response()->json(['pesan' => 'Halo dari API Laravel!']);
// });
// Pindahkan rute otentikasi ke sini
require __DIR__.'/auth.php';

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/roles', [UserController::class, 'getRoles']);
    Route::get('/dashboard-stats', [DashboardController::class, 'getStats']);
});
