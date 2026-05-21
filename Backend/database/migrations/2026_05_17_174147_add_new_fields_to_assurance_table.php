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
        Schema::table('assurance', function (Blueprint $table) {
            $table->string('jenis_audit')->default('Reguler');
            $table->text('area_risiko')->nullable();
            $table->bigInteger('estimasi_anggaran')->nullable();
            $table->string('sumber_anggaran')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assurance', function (Blueprint $table) {
            $table->dropColumn(['jenis_audit', 'area_risiko', 'estimasi_anggaran', 'sumber_anggaran']);
        });
    }
};
