<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BroadcastsRealTime;

class PengawasSpi extends Model
{
    use HasFactory, BroadcastsRealTime;

    protected $table = 'pengawas_spi';

    // table only has created_at column; Laravel would attempt to insert an
    // `updated_at` value and PostgreSQL complains with "Undefined column".
    // we still want created_at populated automatically, so leave timestamps
    // enabled but tell Eloquent that there is *no* updated_at column.
    const UPDATED_AT = null;

    protected $fillable = [
        'nama',
        'jabatan',
        'keahlian',
        'pendidikan',
        'email',
        'linkedin_url',
        'foto_url',
        'bio',
        'sertifikasi'
    ];
}