<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;

class ToggleRoleOrPermissionMiddleware
{
    public function handle(Request $request, Closure $next, ...$params)
    {
        // disable semua permission & role
        if (env('DISABLE_PERMISSIONS', false)) {
            return $next($request);
        }

        $paramString = implode('|', $params);

        return (new RoleOrPermissionMiddleware)->handle(
            $request,
            $next,
            $paramString,
            null // guard
        );
    }
}
