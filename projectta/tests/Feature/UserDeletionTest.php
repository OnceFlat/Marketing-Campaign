<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

test('an admin user cannot be deleted', function () {
    $role = Role::create(['name' => 'admin', 'guard_name' => 'web']);
    $admin = User::create([
        'name' => 'Admin Marketing',
        'email' => 'admin@campaign.test',
        'password' => 'password',
    ]);
    $admin->assignRole($role);

    $this->deleteJson("/api/users/{$admin->id}")
        ->assertForbidden()
        ->assertJson(['message' => 'Akun admin tidak dapat dihapus.']);

    $this->assertDatabaseHas('users', ['id' => $admin->id]);
});

test('a marketing user can be deleted', function () {
    $role = Role::create(['name' => 'marketing', 'guard_name' => 'web']);
    $marketing = User::create([
        'name' => 'Staff Marketing',
        'email' => 'marketing@campaign.test',
        'password' => 'password',
    ]);
    $marketing->assignRole($role);

    $this->deleteJson("/api/users/{$marketing->id}")
        ->assertOk()
        ->assertJson(['message' => 'User berhasil dihapus.']);

    $this->assertDatabaseMissing('users', ['id' => $marketing->id]);
});
