<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    protected $fillable = [
        'page_group',
        'path',
        'methods',
    ];

    protected $casts = [
        'methods' => 'array',
    ];
}
