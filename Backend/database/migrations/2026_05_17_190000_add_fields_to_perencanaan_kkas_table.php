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
        Schema::table('perencanaan_kkas', function (Blueprint $table) {
            $table->text('prosedur_audit')->nullable()->after('no_kka');
            $table->date('tgl_mulai')->nullable()->after('prosedur_audit');
            $table->date('tgl_selesai')->nullable()->after('tgl_mulai');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('perencanaan_kkas', function (Blueprint $table) {
            $table->dropColumn(['prosedur_audit', 'tgl_mulai', 'tgl_selesai']);
        });
    }
};
