<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BroadcastsRealTime;

class PerencanaanKka extends Model
{
    use BroadcastsRealTime;

    protected $table = 'perencanaan_kkas';
    protected $fillable = ['assurance_id', 'uraian', 'user_id', 'no_kka', 'anggaran', 'keterangan', 'prosedur_audit', 'tgl_mulai', 'tgl_selesai', 'lhe_status', 'lhe_reviewed_by', 'lhe_reviewed_at', 'lhe_catatan_review'];

    public function auditor()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function lheFile()
    {
        return $this->hasOne(LheFile::class,'kka_id');
    }

    public function temuan()
    {
        return $this->hasMany(PemeriksaanTemuan::class,'kka_id')->orderBy('id', 'desc');
    }

    public function biaya()
    {
        return $this->hasMany(Biaya::class, 'kka_id');
    }
}
