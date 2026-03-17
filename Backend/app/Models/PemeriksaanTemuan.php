<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PemeriksaanTemuan extends Model
{
    protected $table = 'pemeriksaan_temuan';

    protected $fillable = [
        'kka_id',
        'halaman_lhe',
        'masalah',
        'kondisi',
        'kriteria',
        'sebab',
        'akibat',
        'klarifikasi_temuan',
        'area',
        'referensi',
        'nilai_kerugian',
        'rekomendasi',
        'keterangan',
        'lampiran'
    ];

    public function kka()
    {
        return $this->belongsTo(PerencanaanKka::class,'kka_id');
    }
}