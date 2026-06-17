<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $columns = collect(['meta_campaign_id', 'ad_spend'])
                ->filter(fn (string $column) => Schema::hasColumn('campaigns', $column))
                ->all();

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }

    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            if (! Schema::hasColumn('campaigns', 'meta_campaign_id')) {
                $table->string('meta_campaign_id')->nullable()->index();
            }

            if (! Schema::hasColumn('campaigns', 'ad_spend')) {
                $table->decimal('ad_spend', 14, 2)->default(0);
            }
        });
    }
};
