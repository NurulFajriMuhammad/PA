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
        Schema::create('rkaspi', function (Blueprint $table) {
        $table->id();
        $table->text('kpi_name'); // Nama Indikator bebas
        $table->string('polaritas_min')->nullable();
        $table->string('polaritas_max')->nullable();
        $table->string('nilai_realisasi')->nullable();
        $table->string('satuan')->nullable();
        $table->integer('tahun')->default(2024);
        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rkaspi');
    }
};
