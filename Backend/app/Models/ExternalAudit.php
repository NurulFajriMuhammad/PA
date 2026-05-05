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
        'lembaga_pemeriksa',
        'status',
        'keterangan',
        'id_status_pemeriks',
    ];

    public function temuan()
    {
        return $this->hasMany(ExternalAuditTemuan::class, 'external_audit_id');
    }

    public function statusPemeriksaan()
    {
        return $this->belongsTo(StatusPemeriksaan::class, 'id_status_pemeriks');
    }
}