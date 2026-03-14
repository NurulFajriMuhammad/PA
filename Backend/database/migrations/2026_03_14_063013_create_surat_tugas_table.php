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
        Schema::create('surat_tugas', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_surat')->unique();
            $table->date('tanggal_surat');
            $table->string('periode_pemeriksaan'); // Contoh: "Januari - Maret 2026"
            $table->text('deskripsi'); // Pengganti Judul
            $table->string('koordinator');
            $table->string('pengendali_teknis');
            $table->string('ketua');
            $table->text('auditor'); // Menyimpan banyak nama (bisa dipisah koma atau JSON)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('surat_tugas');
    }
};
