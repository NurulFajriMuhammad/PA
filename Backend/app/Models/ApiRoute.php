<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BroadcastsRealTime;

class ApiRoute extends Model
{
    use BroadcastsRealTime;

    protected $table = 'api_routes';

    protected $fillable = [
        'method',
        'path',
        'controller',
        'permission',
        'action',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
