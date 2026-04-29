<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StatusTemuan extends Model
{
    protected $table = 'status_temuans';

    protected $fillable = [
        'nama',
        'warna',       // background color hex
        'warna_teks',  // text color hex
        'urutan',
    ];
}
