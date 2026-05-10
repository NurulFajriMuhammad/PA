<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\BroadcastsRealTime;

class rkaspi extends Model
{
    use HasFactory, BroadcastsRealTime;

    // Tentukan nama tabel secara eksplisit karena lu pakai huruf kecil
    protected $table = 'rkaspi'; 

    // WAJIB: Daftar kolom yang boleh diisi lewat input bebas
    protected $fillable = [
        'kpi_name',
        'polaritas_min',
        'polaritas_max',
        'nilai_realisasi',
        'satuan',
        'tahun'
    ];
    
}