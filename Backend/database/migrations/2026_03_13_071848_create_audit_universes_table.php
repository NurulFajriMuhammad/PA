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
        Schema::create('audit_universes', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nama Audit
            $table->string('assessment_type');
            $table->string('category'); // Kategori Unit
            $table->string('risk_register');
            $table->string('corporate_risk_category');
            $table->enum('risk', ['Low', 'Medium', 'High']); // Tingkat Risiko
            $table->string('last_audit')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_universes');
    }
};
