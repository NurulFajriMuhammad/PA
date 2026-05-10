<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Unit;
use App\Traits\BroadcastsRealTime;

class AuditEvaluasi extends Model
{
    use BroadcastsRealTime;

    protected $table = 'audit_evaluasi';

    protected $fillable = [
        'nomor_evaluasi',
        'program',
        'unit_id',
        'periode',
        'tanggal_evaluasi',
        'target',
        'realisasi',
        'skor',
        'status',
        'kesimpulan',
        'rekomendasi',
        'auditor',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }
}