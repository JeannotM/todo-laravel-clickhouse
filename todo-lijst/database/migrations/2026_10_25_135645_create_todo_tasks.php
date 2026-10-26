<?php

use Illuminate\Database\Migrations\Migration;
// use Illuminate\Database\Schema\Blueprint;
use ClickHouse\Laravel\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    protected $connection = 'clickhouse';

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection('clickhouse')->create('tasks', function (Blueprint $table) {
            $table->uuid('id');
            $table->string('description');
            $table->string('state')->lowCardinality();
            $table->dateTime('created_at');
            $table->dateTime('updated_at');

            $table->engine('MergeTree()');
            $table->orderBy(['created_at', 'id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection('clickhouse')->dropIfExists('tasks');
    }
};
