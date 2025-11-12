<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\DashboardController;

/*
|--------------------------------------------------------------------------
| Rute API
|--------------------------------------------------------------------------
|
| Di sinilah Anda dapat mendaftarkan rute API untuk aplikasi Anda.
| Rute-rute ini dimuat oleh RouteServiceProvider dan semuanya
| akan diberi prefix 'api'.
|
*/

// Route::prefix('api')->group(function () {

    Route::middleware(\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class)
        ->group(function () {
            require __DIR__.'/auth.php';
        });

    Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
        return $request->user();
    });

    Route::middleware(['auth:sanctum', 'role:administrator audit'])->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::get('/roles', [UserController::class, 'getRoles']);
        Route::get('/dashboard-stats', [DashboardController::class, 'getStats']);
    });

// });