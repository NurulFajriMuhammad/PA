<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('tindak_lanjut')) {
            return;
        }

        Schema::table('tindak_lanjut', function (Blueprint $table) {
            if (!Schema::hasColumn('tindak_lanjut', 'jenis_audit')) {
                $table->string('jenis_audit')->nullable()->after('temuan_id');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('tindak_lanjut')) {
            return;
        }

        Schema::table('tindak_lanjut', function (Blueprint $table) {
            if (Schema::hasColumn('tindak_lanjut', 'jenis_audit')) {
                $table->dropColumn('jenis_audit');
            }
        });
    }
};
