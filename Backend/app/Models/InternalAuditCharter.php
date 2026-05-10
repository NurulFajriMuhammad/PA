<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BroadcastsRealTime;

class InternalAuditCharter extends Model
{
    use HasFactory, BroadcastsRealTime;

    /**
     * Nama tabel yang terhubung dengan model ini.
     * Secara default Laravel akan mencari tabel 'internal_audit_charters',
     * namun mendefinisikannya secara eksplisit adalah praktik yang baik.
     */
    protected $table = 'internal_audit_charters';

    /**
     * Atribut yang dapat diisi secara massal (Mass Assignment).
     * Ini sangat penting untuk keamanan agar hanya kolom ini yang bisa diinput melalui API.
     */
    protected $fillable = [
        'organization_name',
        'file_name',
        'stored_name',
        'file_path',
        'file_size',
        'mime_type',
        'version',
        'issued_date'
    ];

    /**
     * Casting tipe data kolom.
     * Memastikan 'issued_date' diperlakukan sebagai objek tanggal (Carbon)
     * dan 'version' sebagai integer saat dipanggil di Controller.
     */
    protected $casts = [
        'issued_date' => 'date',
        'version' => 'integer',
        'file_size' => 'integer',
    ];

    /**
     * Accessor untuk mendapatkan URL lengkap file PDF.
     * Ini memudahkan Frontend untuk langsung membuka file tanpa mengolah path lagi.
     */
    public function getFileUrlAttribute()
    {
        return asset('storage/' . $this->file_path);
    }

    /**
     * Jika ingin menyertakan URL file secara otomatis setiap kali memanggil data
     */
    protected $appends = ['file_url'];
}