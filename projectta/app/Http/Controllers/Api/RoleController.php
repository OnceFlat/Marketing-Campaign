<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    private const PERMISSIONS = [
        'kelola campaign',
        'kelola aktivitas',
        'kelola laporan',
        'kelola user',
    ];

    private const RESERVED_ROLE_NAMES = ['admin', 'marketing'];

    public function index(): JsonResponse
    {
        $this->ensurePermissionsExist();
        $this->ensureDefaultRolePermissions();

        return response()->json(
            Role::query()
                ->with('permissions:id,name')
                ->orderBy('name')
                ->get(['id', 'name'])
        );
    }

    public function store(Request $request): JsonResponse
    {
        $this->ensurePermissionsExist();
        $request->merge(['name' => $this->normalizeRoleName($request->input('name'))]);

        $data = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::notIn(self::RESERVED_ROLE_NAMES),
                Rule::unique('roles', 'name')->where('guard_name', 'web'),
            ],
            'permissions' => ['required', 'array', 'min:1'],
            'permissions.*' => ['required', 'string', Rule::in(self::PERMISSIONS)],
        ]);

        $role = Role::create([
            'name' => $data['name'],
            'guard_name' => 'web',
        ]);

        $role->syncPermissions($data['permissions']);

        return response()->json($role->load('permissions:id,name'), 201);
    }

    public function update(Request $request, Role $role): JsonResponse
    {
        $this->ensurePermissionsExist();
        $request->merge(['name' => $this->normalizeRoleName($request->input('name'))]);

        $nameRules = [
            'required',
            'string',
            'max:255',
            Rule::unique('roles', 'name')->where('guard_name', 'web')->ignore($role->id),
        ];

        if (! in_array($role->name, self::RESERVED_ROLE_NAMES, true)) {
            $nameRules[] = Rule::notIn(self::RESERVED_ROLE_NAMES);
        }

        $data = $request->validate([
            'name' => $nameRules,
            'permissions' => ['required', 'array', 'min:1'],
            'permissions.*' => ['required', 'string', Rule::in(self::PERMISSIONS)],
        ]);

        $role->update(['name' => $data['name']]);
        $role->syncPermissions($data['permissions']);

        return response()->json($role->load('permissions:id,name'));
    }

    public function destroy(Role $role): JsonResponse
    {
        if (in_array($role->name, self::RESERVED_ROLE_NAMES, true)) {
            return response()->json([
                'message' => 'Role bawaan tidak dapat dihapus.',
            ], 403);
        }

        if ($role->users()->exists()) {
            return response()->json([
                'message' => 'Role masih digunakan oleh akun.',
            ], 409);
        }

        $role->delete();

        return response()->json(['message' => 'Role berhasil dihapus.']);
    }

    private function ensurePermissionsExist(): void
    {
        foreach (self::PERMISSIONS as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }
    }

    private function normalizeRoleName(mixed $name): string
    {
        return strtolower(trim((string) $name));
    }

    private function ensureDefaultRolePermissions(): void
    {
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $marketingRole = Role::firstOrCreate(['name' => 'marketing', 'guard_name' => 'web']);

        if ($adminRole->permissions()->doesntExist()) {
            $adminRole->syncPermissions(self::PERMISSIONS);
        }

        if ($marketingRole->permissions()->doesntExist()) {
            $marketingRole->syncPermissions([
                'kelola campaign',
                'kelola aktivitas',
                'kelola laporan',
            ]);
        }
    }
}
