<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class PermissionMatrix extends Model {
    protected $table = 'permission_matrix';
    protected $fillable = ['jabatan_id', 'module_id', 'can_read', 'can_write', 'can_delete'];

    public function jabatan() {
        return $this->belongsTo(Jabatan::class);
    }

    public function module() {
        return $this->belongsTo(Module::class);
    }
}