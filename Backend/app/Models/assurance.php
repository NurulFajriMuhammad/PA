<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BroadcastsRealTime;

class assurance extends Model
{
    use HasFactory, BroadcastsRealTime;

    // Nama tabel disesuaikan dengan migrasi sebelumnya
    protected $table = 'assurance';

    // Field yang boleh diisi secara massal
    protected $fillable = [
        'surat_tugas_id',
        'objek_pemeriksaan',
        'nama_kegiatan',
        'tujuan',
        'sasaran',
        'objek_audit',
        'ruang_lingkup',
        'metodologi',
        'periode_awal',
        'periode_akhir',
        'lokasi',
        'koordinator_id',
        'pt_id',
        'ketua_id',
        'auditor_id',
        'keterangan',
        'id_status_pemeriksaan',
        'jenis_audit',
        'area_risiko',
        'estimasi_anggaran',
        'sumber_anggaran',
        'lha_status',
        'lha_submitted_by',
        'lha_submitted_at',
        'lha_approved_by',
        'lha_approved_at',
        'lha_catatan',
        'auditor_ids',
    ];

    protected $casts = [
        'auditor_ids' => 'array',
    ];

    protected $appends = ['auditors'];

    public function getAuditorsAttribute()
    {
        $ids = $this->auditor_ids;
        if (is_string($ids)) {
            $ids = json_decode($ids, true);
        }
        if (empty($ids)) {
            if ($this->auditor_id) {
                return User::where('id', $this->auditor_id)->get();
            }
            return [];
        }
        return User::whereIn('id', (array)$ids)->get();
    }

    // Menetapkan default value untuk status saat record baru dibuat
    protected $attributes = [
        'id_status_pemeriksaan' => 1, // ID untuk 'Perencanaan'
    ];

    /**
     * RELASI DATABASE
     */

    // Relasi ke Surat Tugas
    public function suratTugas()
    {
        return $this->belongsTo(SuratTugas::class, 'surat_tugas_id');
    }

    public function kka()
    {
        return $this->hasMany(PerencanaanKka::class, 'assurance_id');
    }

    // Relasi ke Audit Universe (untuk mengambil Sub-Unit)
    public function auditUniverse()
    {
        return $this->belongsTo(AuditUniverse::class, 'audit_universe_id');
    }

    // Relasi ke Master Status Pemeriksaan
    public function statusPemeriksaan()
    {
        return $this->belongsTo(status_pemeriksaan::class, 'id_status_pemeriksaan', 'id_status_pemeriksaan');
    }

    /**
     * RELASI KE USERS (PERSONIL)
     */
    public function koordinator()
    {
        return $this->belongsTo(User::class, 'koordinator_id');
    }

    public function pengendaliTeknis()
    {
        return $this->belongsTo(User::class, 'pt_id');
    }

    public function ketuaTim()
    {
        return $this->belongsTo(User::class, 'ketua_id');
    }

    public function auditor()
    {
        return $this->belongsTo(User::class, 'auditor_id');
    }

    public function lhaSubmittedBy()
    {
        return $this->belongsTo(User::class, 'lha_submitted_by');
    }

    public function lhaApprovedBy()
    {
        return $this->belongsTo(User::class, 'lha_approved_by');
    }
}