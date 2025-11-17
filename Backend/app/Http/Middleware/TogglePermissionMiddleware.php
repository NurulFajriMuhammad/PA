<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Spatie\Permission\Middleware\PermissionMiddleware;

class TogglePermissionMiddleware
{
    public function handle(Request $request, Closure $next, ...$permissions)
    {
        // Jika permission dinonaktifkan, langsung bypass
        if (env('DISABLE_PERMISSIONS', false)) {
            return $next($request);
        }

        // Gabungkan menjadi string pakai '|'
        $permissionString = implode('|', $permissions);

        // Jalankan middleware Spatie aslinya
        return (new PermissionMiddleware)->handle(
            $request,
            $next,
            $permissionString,
            null // guard
        );
    }
}
