<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BroadcastsRealTime;

class AdvisoryService extends Model
{
    use BroadcastsRealTime;

    protected $fillable = [
        'nomor_advisory',
        'tanggal_kegiatan',
        'unit',
        'contact_person',
        'no_telepon',
        'waktu_mulai',
        'waktu_selesai',
        'uraian_konsultasi',
        'opini_spi',
        'pengawas',
        'prioritas',
        'status',
        'keterangan',
        'unit_id',
    ];
}