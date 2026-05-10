<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BroadcastsRealTime;

class PemeriksaanTemuan extends Model
{
    use BroadcastsRealTime;

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
        'lampiran',
        'lampiran_name'
    ];

    public function kka()
    {
        return $this->belongsTo(PerencanaanKka::class,'kka_id');
    }

    public function analisis()
    {
        return $this->hasOne(AnalisisTemuan::class, 'temuan_id');
    }

    public function tindakLanjut()
    {
        return $this->hasOne(TindakLanjut::class, 'temuan_id');
    }
}