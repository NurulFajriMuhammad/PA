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
        Schema::table('analisis_temuan', function (Blueprint $table) {
            $table->string('prioritas')->nullable();
            $table->decimal('estimasi_anggaran', 15, 2)->nullable();
            $table->string('sdm_dibutuhkan')->nullable();
            $table->string('sarana_alat')->nullable();
            $table->text('potensi_kendala')->nullable();
            $table->text('catatan_auditor')->nullable();
            $table->json('pic_rtls')->nullable();
            $table->timestamp('rtl_submitted_at')->nullable();
            $table->unsignedBigInteger('rtl_submitted_by')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('analisis_temuan', function (Blueprint $table) {
            $table->dropColumn([
                'prioritas',
                'estimasi_anggaran',
                'sdm_dibutuhkan',
                'sarana_alat',
                'potensi_kendala',
                'catatan_auditor',
                'pic_rtls',
                'rtl_submitted_at',
                'rtl_submitted_by'
            ]);
        });
    }
};
