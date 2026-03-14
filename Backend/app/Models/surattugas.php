<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class surattugas extends Model
{
    protected $table = 'surat_tugas';
    
    protected $fillable = [
        'nomor_surat',
        'tanggal_surat',
        'periode_pemeriksaan',
        'deskripsi',
        'koordinator',
        'pengendali_teknis',
        'ketua',
        'auditor'
    ];

    // Casting tim supaya otomatis jadi array saat dipanggil di Controller/Frontend
    protected $casts = [
        'tim' => 'array',
        'tanggal' => 'date:Y-m-d'
    ];
}
