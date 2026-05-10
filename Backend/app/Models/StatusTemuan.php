<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BroadcastsRealTime;

class StatusTemuan extends Model
{
    use BroadcastsRealTime;

    protected $table = 'status_temuans';

    protected $fillable = [
        'nama',
        'warna',       // background color hex
        'warna_teks',  // text color hex
        'urutan',
    ];
}
