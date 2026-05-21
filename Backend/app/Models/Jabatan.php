<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BroadcastsRealTime;

class Jabatan extends Model
{
    use BroadcastsRealTime;

    protected $table = 'jabatans';
    protected $fillable = ['nama'];

    public function units() {
        return $this->belongsToMany(Unit::class, 'jabatan_unit');
    }
}