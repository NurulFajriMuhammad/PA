<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BroadcastsRealTime;

class AnalisisTemuan extends Model
{
    use BroadcastsRealTime;

    protected $table = 'analisis_temuan';

    protected $fillable = [
        'temuan_id',
        'status',
        'tanggapan',
        'analisa',
        'analisa_auditor',
        'aspek_penolakan',
        'fakta_pembanding',
        'rencana_koreksi',
        'rencana_kolektif',
        'target_penyelesaian',
        'prioritas',
        'estimasi_anggaran',
        'sdm_dibutuhkan',
        'sarana_alat',
        'potensi_kendala',
        'catatan_auditor',
        'pic_rtls',
        'rtl_submitted_at',
        'rtl_submitted_by',
        'feedback',
        'lampiran',
        'lampiran_name'
    ];

    public function temuan()
    {
        return $this->belongsTo(PemeriksaanTemuan::class, 'temuan_id');
    }

        public function analisis()
    {
        return $this->hasOne(AnalisisTemuan::class, 'temuan_id');
    }

}