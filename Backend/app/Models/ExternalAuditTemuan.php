<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BroadcastsRealTime;

class ExternalAuditTemuan extends Model
{
    use BroadcastsRealTime;

    protected $table = 'external_audit_temuan';

    protected $fillable = [
        'external_audit_id',
        'masalah',
        'kriteria',
        'sebab',
        'akibat',
        'kondisi',
        'rekomendasi',
        'rencana',
        'rencana_koreksi',
        'rencana_kolektif',
        'keterangan',
        'target_penyelesaian',
        'nilai_kerugian',
        'kategori',
        'status',
        'lampiran',
        'nama_lampiran',
        'prioritas',
        'estimasi_anggaran',
        'sdm_dibutuhkan',
        'sarana_alat',
        'potensi_kendala',
        'catatan_auditor',
        'pic_rtls',
        'rtl_submitted_at',
        'rtl_submitted_by'
    ];

    protected $casts = [
        'pic_rtls' => 'json',
        'rtl_submitted_at' => 'datetime',
    ];

    public function externalAudit()
    {
        return $this->belongsTo(ExternalAudit::class);
    }

    public function rtlSubmitter()
    {
        return $this->belongsTo(User::class, 'rtl_submitted_by');
    }
}