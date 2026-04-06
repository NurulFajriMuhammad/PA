<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConsultingMessage extends Model
{
    protected $fillable = [
        'consulting_id',
        'sender_id',
        'message',
    ];

    public function consulting()
    {
        return $this->belongsTo(Consulting::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}