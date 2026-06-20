<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Biaya extends Model
{
    protected $table = 'biaya';

    protected $fillable = [
        'kka_id',
        'nama',
        'jenis_akomodasi',
        'nilai_realisasi',
        'pelaksana',
        'tgl_realisasi',
        'bukti'
    ];

    public function kka()
    {
        return $this->belongsTo(PerencanaanKka::class, 'kka_id');
    }
}