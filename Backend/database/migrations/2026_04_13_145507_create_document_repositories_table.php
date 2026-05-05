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
        Schema::create('document_repositories', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // Judul dokumen
            $table->string('file_path'); // Path file
            $table->string('file_name')->nullable(); // Nama asli file
            $table->string('file_type')->nullable(); // Tipe file (pdf, jpg, png, dll)
            $table->integer('file_size')->nullable(); // Ukuran file dalam bytes
            $table->string('category'); // Kategori dokumen (SOP, Regulasi, Arsip LHA, dll)
            $table->string('module'); // Modul asal (tindak_lanjut, analisis_temuan, auditee_document, dll)
            $table->unsignedBigInteger('module_id'); // ID record di modul asal
            $table->string('uploaded_by')->nullable(); // User yang upload
            $table->json('metadata')->nullable(); // Metadata tambahan (unit, jenis_audit, dll)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_repositories');
    }
};
