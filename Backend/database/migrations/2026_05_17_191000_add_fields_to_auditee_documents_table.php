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
        Schema::table('auditee_documents', function (Blueprint $table) {
            $table->string('tipe_dokumen')->nullable()->after('judul_dokumen');
            $table->string('terkait_kka')->nullable()->after('tipe_dokumen');
            $table->text('keterangan')->nullable()->after('file_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('auditee_documents', function (Blueprint $table) {
            $table->dropColumn(['tipe_dokumen', 'terkait_kka', 'keterangan']);
        });
    }
};
