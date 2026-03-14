<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('assurance', function (Blueprint $table) {
            $table->id();
    
            // Relasi ke Surat Tugas
            $table->foreignId('surat_tugas_id')->constrained('surat_tugas')->onDelete('cascade');
            
            $table->string('objek_pemeriksaan');
            $table->string('nama_kegiatan');
            $table->text('tujuan')->nullable();
            $table->text('sasaran')->nullable();
            $table->string('objek_audit')->nullable();
            $table->text('ruang_lingkup')->nullable();
            $table->text('metodologi')->nullable();
            $table->date('periode_awal')->nullable();
            $table->date('periode_akhir')->nullable();
            $table->string('lokasi')->nullable();
            
            // Relasi ke Tabel Users (Personil)
            $table->foreignId('koordinator_id')->nullable()->constrained('users');
            $table->foreignId('pt_id')->nullable()->constrained('users'); // Pengendali Teknis
            $table->foreignId('ketua_id')->nullable()->constrained('users');
            $table->foreignId('auditor_id')->nullable()->constrained('users');
            
            $table->text('keterangan')->nullable();
            $table->foreignId('id_status_pemeriksaan')
                  ->default(1) // Default ke 'Perencanaan' (ID 1)
                  ->constrained('status_pemeriksaan', 'id_status_pemeriksaan');            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assurance');
    }
};
