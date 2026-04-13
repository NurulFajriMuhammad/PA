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
            if (!Schema::hasColumn('tindak_lanjut', 'hasil_evaluasi')) {
                $table->string('hasil_evaluasi')->nullable()->after('bukti');
            }

            if (!Schema::hasColumn('tindak_lanjut', 'kesimpulan')) {
                $table->text('kesimpulan')->nullable()->after('hasil_evaluasi');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('tindak_lanjut')) {
            return;
        }

        Schema::table('tindak_lanjut', function (Blueprint $table) {
            if (Schema::hasColumn('tindak_lanjut', 'kesimpulan')) {
                $table->dropColumn('kesimpulan');
            }

            if (Schema::hasColumn('tindak_lanjut', 'hasil_evaluasi')) {
                $table->dropColumn('hasil_evaluasi');
            }
        });
    }
};
