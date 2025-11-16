<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken as Middleware;

class ValidateCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        // Tambahkan route yang tidak perlu CSRF jika diperlukan
        'api/users',
        'api/roles',
        'api/permissions',
        'api/api-routes',
    ];
}
