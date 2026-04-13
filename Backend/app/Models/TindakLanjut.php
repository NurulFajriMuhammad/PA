<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TindakLanjut extends Model
{
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
    ];

    protected $casts = [
        'tanggal' => 'date',
        'target_selesai' => 'date',
        'tahun' => 'integer',
        'bulan' => 'integer',
        'progres' => 'integer',
    ];
}
