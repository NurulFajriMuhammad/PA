<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('internal_audit_charters', function (Blueprint $table) {
            $table->id();
            $table->string('organization_name');
            $table->string('file_name');         // Nama asli: piagam_ttd.pdf
            $table->string('stored_name');       // Nama unik di storage: 1710123.pdf
            $table->text('file_path');           // folder path
            $table->integer('file_size')->nullable();
            $table->string('mime_type')->default('application/pdf');
            
            $table->integer('version')->default(1);
            $table->date('issued_date')->useCurrent();
            
            $table->timestamps(); // create_at & updated_at otomatis
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('internal_audit_charters');
    }
};