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
        Schema::table('external_audit_temuan', function (Blueprint $table) {
            $table->string('prioritas')->nullable()->after('target_penyelesaian');
            $table->decimal('estimasi_anggaran', 15, 2)->nullable()->after('prioritas');
            $table->text('sdm_dibutuhkan')->nullable()->after('estimasi_anggaran');
            $table->text('sarana_alat')->nullable()->after('sdm_dibutuhkan');
            $table->text('potensi_kendala')->nullable()->after('sarana_alat');
            $table->text('catatan_auditor')->nullable()->after('potensi_kendala');
            $table->json('pic_rtls')->nullable()->after('catatan_auditor');
            $table->timestamp('rtl_submitted_at')->nullable()->after('pic_rtls');
            $table->unsignedBigInteger('rtl_submitted_by')->nullable()->after('rtl_submitted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('external_audit_temuan', function (Blueprint $table) {
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
