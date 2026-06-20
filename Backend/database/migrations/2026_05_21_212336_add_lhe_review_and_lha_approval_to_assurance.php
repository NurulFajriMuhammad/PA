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
        // === LHA (Laporan Hasil Audit) Approval ===
        Schema::table('assurance', function (Blueprint $table) {
            $table->enum('lha_status', ['draft', 'submitted', 'approved', 'rejected'])->default('draft')->after('keterangan');
            $table->unsignedBigInteger('lha_submitted_by')->nullable()->after('lha_status');
            $table->timestamp('lha_submitted_at')->nullable()->after('lha_submitted_by');
            $table->unsignedBigInteger('lha_approved_by')->nullable()->after('lha_submitted_at');
            $table->timestamp('lha_approved_at')->nullable()->after('lha_approved_by');
            $table->text('lha_catatan')->nullable()->after('lha_approved_at');
        });

        // === LHE Review per KKA (Supervisi oleh Pengendali Teknis) ===
        Schema::table('perencanaan_kkas', function (Blueprint $table) {
            $table->enum('lhe_status', ['belum_upload', 'menunggu_review', 'disetujui', 'perlu_revisi'])->default('belum_upload')->after('no_kka');
            $table->unsignedBigInteger('lhe_reviewed_by')->nullable()->after('lhe_status');
            $table->timestamp('lhe_reviewed_at')->nullable()->after('lhe_reviewed_by');
            $table->text('lhe_catatan_review')->nullable()->after('lhe_reviewed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assurance', function (Blueprint $table) {
            $table->dropColumn(['lha_status', 'lha_submitted_by', 'lha_submitted_at', 'lha_approved_by', 'lha_approved_at', 'lha_catatan']);
        });
        Schema::table('perencanaan_kkas', function (Blueprint $table) {
            $table->dropColumn(['lhe_status', 'lhe_reviewed_by', 'lhe_reviewed_at', 'lhe_catatan_review']);
        });
    }
};
