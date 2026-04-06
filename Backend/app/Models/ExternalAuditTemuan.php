<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExternalAuditTemuan extends Model
{
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
        'keterangan',
        'target_penyelesaian',
        'nilai_kerugian',
        'lampiran'
    ];

    public function externalAudit()
    {
        return $this->belongsTo(ExternalAudit::class);
    }
}