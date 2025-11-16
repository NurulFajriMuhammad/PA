<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApiRoute extends Model
{
    protected $table = 'api_routes';

    protected $fillable = [
        'method',
        'path',
        'controller',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}