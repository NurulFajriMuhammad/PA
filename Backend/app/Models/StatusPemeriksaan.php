<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StatusPemeriksaan extends Model
{
    protected $fillable = [
        'nama',
        'warna',
        'deskripsi',
        'urutan'
    ];
}