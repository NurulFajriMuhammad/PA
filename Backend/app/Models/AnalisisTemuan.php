<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnalisisTemuan extends Model
{
    protected $table = 'analisis_temuan';

    protected $fillable = [
        'temuan_id',
        'status',
        'tanggapan',
        'analisa',
        'rencana_koreksi',
        'rencana_kolektif',
        'target_penyelesaian',
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