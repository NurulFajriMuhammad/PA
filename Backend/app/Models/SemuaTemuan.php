<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SemuaTemuan extends Model
{
    // Arahkan ke nama view PostgreSQL
    protected $table = 'v_semua_temuan';

    // Karena ini view, secara default framework tidak akan menemukan primary key id
    // Kita tetap asumsikan kolom id_format sebagai penciri walau tidak auto-increment
    protected $primaryKey = 'id_format';
    public $incrementing = false;
    protected $keyType = 'string';

    // Tidak butuh timestamps jika kita tidak menulis/write dari model ini
    public $timestamps = false;

    // View hanya untuk dibaca, jadi fillable tidak terlalu ditekankan (tapi baik untuk amannya)
    protected $fillable = [
        'sumber',
        'id_asli',
        'id_format',
        'judul_masalah',
        'kategori',
        'risiko',
        'unit',
        'tanggal',
        'impact',
        'status',
    ];
}
