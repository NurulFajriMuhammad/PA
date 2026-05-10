<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BroadcastsRealTime;

class TindakLanjut extends Model
{
    use BroadcastsRealTime;

    protected $table = 'tindak_lanjut';

    protected $fillable = [
        'temuan_id',
        'jenis_audit',
        'masalah',
        'rekomendasi',
        'unit',
        'pic',
        'keterangan',
        'progres',
        'tanggal',
        'bukti',
        'target_selesai',
        'status',
        'tahun',
        'bulan',
        'hasil_evaluasi',
        'kesimpulan',
        'persentase',
        'estimasi_selesai',
        'pic_pelaksana',
        'kendala',
        'catatan_tambahan',
        'bukti_name',
        'created_by',
        'reviewer_id',
        'reviewed_at',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'target_selesai' => 'date',
        'tahun' => 'integer',
        'bulan' => 'integer',
        'progres' => 'integer',
    ];
}
