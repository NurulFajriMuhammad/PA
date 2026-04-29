<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PengajuanTransition extends Model
{
    protected $table = 'pengajuan_transitions';

    protected $fillable = [
        'status_pemeriksaan_id',
        'role_id',
        'status_selanjutnya_id',
        'status_dikembalikan_id',
        'jenis',
    ];

    public function statusPemeriksaan()
    {
        return $this->belongsTo(StatusPemeriksaan::class, 'status_pemeriksaan_id');
    }

    public function role()
    {
        return $this->belongsTo(\Spatie\Permission\Models\Role::class, 'role_id');
    }

    public function statusSelanjutnya()
    {
        return $this->belongsTo(StatusPemeriksaan::class, 'status_selanjutnya_id');
    }

    public function statusDikembalikan()
    {
        return $this->belongsTo(StatusPemeriksaan::class, 'status_dikembalikan_id');
    }
}
