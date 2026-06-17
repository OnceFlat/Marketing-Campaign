<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check');
        }

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE campaigns MODIFY status ENUM('draft', 'active', 'paused', 'completed', 'cancelled', 'posted') NOT NULL DEFAULT 'active'");
        }

        DB::table('campaigns')->whereIn('status', ['draft', 'paused'])->update(['status' => 'active']);
        DB::table('campaigns')->where('status', 'completed')->update(['status' => 'posted']);

        if ($driver === 'pgsql') {
            DB::statement("ALTER TABLE campaigns ADD CONSTRAINT campaigns_status_check CHECK (status IN ('active', 'posted', 'cancelled'))");
            DB::statement("ALTER TABLE campaigns ALTER COLUMN status SET DEFAULT 'active'");
        }

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE campaigns MODIFY status ENUM('active', 'posted', 'cancelled') NOT NULL DEFAULT 'active'");
        }
    }

    public function down(): void
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check');
        }

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE campaigns MODIFY status ENUM('draft', 'active', 'paused', 'completed', 'cancelled', 'posted') NOT NULL DEFAULT 'draft'");
        }

        DB::table('campaigns')->where('status', 'posted')->update(['status' => 'completed']);

        if ($driver === 'pgsql') {
            DB::statement("ALTER TABLE campaigns ADD CONSTRAINT campaigns_status_check CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled'))");
            DB::statement("ALTER TABLE campaigns ALTER COLUMN status SET DEFAULT 'draft'");
        }

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE campaigns MODIFY status ENUM('draft', 'active', 'paused', 'completed', 'cancelled') NOT NULL DEFAULT 'draft'");
        }
    }
};
