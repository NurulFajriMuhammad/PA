<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LheFile extends Model
{
    protected $fillable = [
        'kka_id',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
        'uploaded_by'
    ];

    public function kka()
    {
        return $this->belongsTo(PerencanaanKka::class,'kka_id');
    }
}