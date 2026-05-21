<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditeeDocument extends Model
{
    protected $fillable = ['assurance_id', 'judul_dokumen', 'tipe_dokumen', 'terkait_kka', 'file_path', 'file_type', 'keterangan'];
}
