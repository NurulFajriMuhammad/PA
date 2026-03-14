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
        Schema::create('pkptspi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('audit_universe_id')->constrained('audit_universes')->onDelete('cascade');
            $table->string('risk_category');
            $table->string('frequency');
            $table->string('start_week');
            $table->string('end_week');
            $table->year('year');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pkptspi');
    }
};
