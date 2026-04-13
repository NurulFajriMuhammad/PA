<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Jabatan extends Model
{
    protected $table = 'jabatans';
    protected $fillable = ['nama'];

    public function units() {
        return $this->belongsToMany(Unit::class, 'jabatan_unit');
    }
}