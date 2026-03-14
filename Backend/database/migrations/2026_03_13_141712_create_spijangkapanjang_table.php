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
        Schema::create('spijangkapanjang', function (Blueprint $table) {
            $table->id();
            
            // Relasi ke id di tabel audit_universes
            $table->foreignId('audit_universe_id')
                  ->constrained('audit_universes')
                  ->onDelete('cascade');
            
            $table->string('frequency');      // Frekuensi Audit (misal: Tahunan, 3 Tahunan)
            $table->year('prep_year');        // Tahun Persiapan Audit
            $table->year('audit_year');       // Tahun Pemeriksaan Audit
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spijangkapanjang');
    }
};