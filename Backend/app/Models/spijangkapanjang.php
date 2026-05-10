<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Traits\BroadcastsRealTime;

class spijangkapanjang extends Model
{
    use HasFactory, BroadcastsRealTime;

    // Karena nama class tidak menggunakan PascalCase standar (SpiJangkaPanjang), 
    // kita tegaskan nama tabelnya di sini
    protected $table = 'spijangkapanjang';

    // Daftar kolom yang boleh diisi secara massal
    protected $fillable = [
        'audit_universe_id',
        'frequency',
        'prep_year',
        'audit_year'
    ];

    /**
     * Relasi ke model AuditUniverse
     * Ini memungkinkan kita mengambil Nama Audit dan Risiko
     */
    public function audit_universe(): BelongsTo
    {
        return $this->belongsTo(AuditUniverse::class, 'audit_universe_id');
    }
}