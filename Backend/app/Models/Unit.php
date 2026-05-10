<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BroadcastsRealTime;

class Unit extends Model
{
    use BroadcastsRealTime;

    protected $table = 'units';

    protected $fillable = [
        'nama',
        'kode'
    ];
}