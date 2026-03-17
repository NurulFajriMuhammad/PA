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
        Schema::create('perencanaan_kkas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assurance_id')->constrained('assurance')->onDelete('cascade');
            $table->string('uraian');
            $table->foreignId('user_id')->constrained('users'); // dilaksanakan oleh
            $table->string('no_kka'); // ini ambil dari tabel master kka nanti di logic
            $table->decimal('anggaran', 15, 2)->default(0);
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('perencanaan_kkas');
    }
};
