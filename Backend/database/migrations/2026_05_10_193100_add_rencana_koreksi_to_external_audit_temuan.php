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
            $table->text('rencana_koreksi')->nullable()->after('rekomendasi');
            $table->text('rencana_kolektif')->nullable()->after('rencana_koreksi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('external_audit_temuan', function (Blueprint $table) {
            $table->dropColumn(['rencana_koreksi', 'rencana_kolektif']);
        });
    }
};
