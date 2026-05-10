<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\ConsultingMessage;
use App\Models\Unit;
use Spatie\Permission\Models\Role;
use App\Traits\BroadcastsRealTime;

class Consulting extends Model
{
    use BroadcastsRealTime;

    protected $fillable = [
        'kode_consulting',
        'proyek',
        'klien',
        'prioritas',
        'tahap',
        'deadline',
        'unit_id',
        'role_id'
    ];

    public function messages()
    {
        return $this->hasMany(ConsultingMessage::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }
}