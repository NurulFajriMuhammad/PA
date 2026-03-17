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
        Schema::create('auditee_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assurance_id')->constrained()->onDelete('cascade');
            $table->string('judul_dokumen');
            $table->string('file_path');
            $table->string('file_type'); // Untuk membedakan pdf/png/jpg
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('auditee_documents');
    }
};
