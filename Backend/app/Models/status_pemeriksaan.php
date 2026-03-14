<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class status_pemeriksaan extends Model
{
    // Karena nama tabelmu tadi 'status_pemeriksaan'
    protected $table = 'status_pemeriksaan';

    // Karena Primary Key kamu bukan 'id', tapi 'id_status_pemeriksaan'
    protected $primaryKey = 'id_status_pemeriksaan';

    // Matikan timestamps jika tabelmu tidak punya created_at/updated_at
    public $timestamps = false;

    // Relasi balik (Opsional, tapi bagus untuk ada)
    public function assurance()
    {
        return $this->hasMany(assurance::class, 'id_status_pemeriksaan', 'id_status_pemeriksaan');
    }
}
