<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withBroadcasting(
        __DIR__.'/../routes/channels.php',
        ['middleware' => ['api', 'auth:sanctum']],
    )

    ->withProviders([
        App\Providers\RouteServiceProvider::class,
    ])

    ->withMiddleware(function (Middleware $middleware) {

        // Konfigurasi API Middleware (Sanctum)
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        // $middleware->alias([
        //     'verified' => \App\Http\Middleware\EnsureEmailIsVerified::class,
        //     'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
        //     'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
        // ]);

        $middleware->alias([
            'check.access' => \App\Http\Middleware\CheckModuleAccess::class,
            'verified' => \App\Http\Middleware\EnsureEmailIsVerified::class,
            'role' => \App\Http\Middleware\ToggleRoleMiddleware::class,
            'permission' => \App\Http\Middleware\TogglePermissionMiddleware::class,
            'role_or_permission' => \App\Http\Middleware\ToggleRoleOrPermissionMiddleware::class,
        ]);

        //
    })
    // ->withMiddleware(function (Middleware $middleware) {
    //     $middleware->web(prepend: [
    //         \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    //     ]);

    //     $middleware->alias([
    //         'verified' => \App\Http\Middleware\EnsureEmailIsVerified::class,
    //         'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
    //         'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
    //     ]);
    // })

    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
