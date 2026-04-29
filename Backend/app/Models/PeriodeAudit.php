<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PeriodeAudit extends Model
{
    use HasFactory;

    protected $table = 'periode_audits';

    protected $fillable = [
        'tahun',
        'nama_periode',
        'tanggal_mulai',
        'tanggal_selesai',
        'is_active',
        'keterangan'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
    ];
}
