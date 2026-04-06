<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExternalAudit extends Model
{
    protected $table = 'external_audits';

    protected $fillable = [
        'objek_pemeriksaan',
        'nama_kegiatan',
        'tujuan',
        'objek_audit',
        'ruang_lingkup',
        'metodologi',
        'periode_awal',
        'periode_akhir',
        'lokasi',
        'status',
        'keterangan',
    ];
}