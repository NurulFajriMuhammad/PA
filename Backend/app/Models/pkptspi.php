<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class pkptspi extends Model
{
    use HasFactory;

    // Nama tabel di database (opsional jika nama file & tabel sudah sesuai standar Laravel)
    protected $table = 'pkptspi';

    // Kolom yang boleh diisi secara massal
    protected $fillable = [
        'audit_universe_id',
        'risk_category',
        'frequency',
        'start_week',
        'end_week',
        'year',
    ];

    /**
     * Relasi ke Audit Universe
     * PKPT dimiliki oleh satu Audit Universe
     */
    public function audit_universe()
    {
        return $this->belongsTo(AuditUniverse::class, 'audit_universe_id');
    }
}