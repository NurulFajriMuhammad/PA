<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StatusPemeriksaanAkses extends Model
{
    protected $table = 'status_pemeriksaan_akses';

    protected $fillable = [
        'role_id',
        'status_pemeriksaan_id',
        'url',
    ];

    public function role()
    {
        return $this->belongsTo(\Spatie\Permission\Models\Role::class, 'role_id');
    }

    public function statusPemeriksaan()
    {
        return $this->belongsTo(StatusPemeriksaan::class, 'status_pemeriksaan_id');
    }
}
