<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Spatie\Permission\Middleware\RoleMiddleware;

class ToggleRoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        // Disable roles
        if (env('DISABLE_PERMISSIONS', false)) {
            return $next($request);
        }

        $roleString = implode('|', $roles);

        return (new RoleMiddleware)->handle(
            $request,
            $next,
            $roleString,
            null // guard
        );
    }
}
