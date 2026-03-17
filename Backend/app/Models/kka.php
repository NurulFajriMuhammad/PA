<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class kka extends Model
{
    protected $table = 'kka';
    protected $primaryKey = 'id';
    public $incrementing = false; // Karena ID berupa string (KKA.01)
    protected $keyType = 'string';

    protected $fillable = ['id', 'nama', 'keterangan'];
}
