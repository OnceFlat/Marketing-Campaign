"use client";

import { FormEvent, useEffect, useState } from "react";
import { KeyRound, Pencil, Plus, ShieldCheck, Trash2, X } from "lucide-react";
import { PageChrome } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/form";
import { ApiError, api, Role } from "@/lib/api";

const permissionOptions = [
  "kelola campaign",
  "kelola aktivitas",
  "kelola laporan",
  "kelola user",
];
const reservedRoleNames = ["admin", "marketing"];

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [savingRole, setSavingRole] = useState(false);
  const [deletingRoleId, setDeletingRoleId] = useState<number | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [roleForm, setRoleForm] = useState({
    name: "",
    permissions: [] as string[],
  });

  async function loadData() {
    const roleData = await api<Role[]>("/roles");
    setRoles(roleData);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
      .catch(() => {
        setMessageType("error");
        setMessage("API Laravel belum aktif atau belum dimigrate.");
      });
  }, []);

  async function submitRole(event: FormEvent) {
    event.preventDefault();
    const normalizedRoleName = roleForm.name.trim().toLowerCase();

    if (editingRoleId === null && reservedRoleNames.includes(normalizedRoleName)) {
      setMessageType("error");
      setMessage("Nama role Admin atau Marketing tidak boleh digunakan.");
      return;
    }

    setSavingRole(true);
    setMessage("");

    try {
      const isEditing = editingRoleId !== null;

      await api(isEditing ? `/roles/${editingRoleId}` : "/roles", {
        method: isEditing ? "PUT" : "POST",
        body: JSON.stringify({ ...roleForm, name: normalizedRoleName }),
      });

      resetForm();
      setMessageType("success");
      setMessage(isEditing ? "Role berhasil diperbarui." : "Role baru berhasil ditambahkan.");
      await loadData();
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof ApiError && error.status === 422
        ? "Role gagal disimpan. Nama role Admin atau Marketing tidak boleh digunakan, nama mungkin sudah ada, atau permission belum dipilih."
        : "Role gagal disimpan. Periksa API Laravel.");
    } finally {
      setSavingRole(false);
    }
  }

  function editRole(role: Role) {
    setEditingRoleId(role.id);
    setRoleForm({
      name: role.name,
      permissions: role.permissions?.map((permission) => permission.name) ?? [],
    });
    setMessage("");
  }

  function resetForm() {
    setEditingRoleId(null);
    setRoleForm({ name: "", permissions: [] });
  }

  async function deleteRole() {
    if (!roleToDelete) return;

    setDeletingRoleId(roleToDelete.id);
    setMessage("");

    try {
      await api(`/roles/${roleToDelete.id}`, { method: "DELETE" });
      if (editingRoleId === roleToDelete.id) {
        resetForm();
      }
      setRoleToDelete(null);
      setMessageType("success");
      setMessage("Role berhasil dihapus.");
      await loadData();
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof ApiError && error.status === 409
        ? "Role tidak dapat dihapus karena masih digunakan oleh akun."
        : "Role gagal dihapus. Periksa API Laravel.");
    } finally {
      setDeletingRoleId(null);
    }
  }

  function togglePermission(permission: string) {
    const hasPermission = roleForm.permissions.includes(permission);

    setRoleForm({
      ...roleForm,
      permissions: hasPermission
        ? roleForm.permissions.filter((item) => item !== permission)
        : [...roleForm.permissions, permission],
    });
  }

  return (
    <PageChrome title="Kelola Role" trail="Kelola Role">
      {message ? (
        <div
          className={`mb-5 rounded-md border px-4 py-3 text-sm ${
            messageType === "error"
              ? "border-rose-200 bg-rose-50 text-rose-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {message}
        </div>
      ) : null}
      <form
        className="mb-6 grid gap-4 rounded-lg border border-zinc-200 bg-white p-5"
        onSubmit={submitRole}
      >
        <div>
          <h2 className="text-base font-semibold text-zinc-900">
            {editingRoleId ? "Edit Role" : "Tambah Role Baru"}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Pilih permission yang boleh dikelola oleh role ini.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[minmax(220px,0.8fr)_1.4fr]">
          <div className="space-y-2">
            <Label htmlFor="role-name">Nama Role</Label>
            <Input
              id="role-name"
              required
              value={roleForm.name}
              onChange={(event) => setRoleForm({ ...roleForm, name: event.target.value })}
              placeholder="contoh: supervisor"
            />
          </div>
          <div className="space-y-2">
            <Label>Permission</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {permissionOptions.map((permission) => (
                <label
                  key={permission}
                  className="flex min-h-10 items-center gap-3 rounded-md border border-zinc-200 px-3 text-sm text-zinc-700"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-zinc-300 accent-emerald-600"
                    checked={roleForm.permissions.includes(permission)}
                    onChange={() => togglePermission(permission)}
                  />
                  <span className="capitalize">{permission}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          {editingRoleId ? (
            <Button type="button" variant="outline" onClick={resetForm}>
              <X className="h-4 w-4" />
              Batal
            </Button>
          ) : null}
          <Button type="submit" disabled={savingRole}>
            <Plus className="h-4 w-4" />
            {savingRole ? "Menyimpan..." : editingRoleId ? "Simpan Perubahan" : "Tambah Role"}
          </Button>
        </div>
      </form>
      <section className="grid gap-4 md:grid-cols-2">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                  {role.name === "admin" ? (
                    <ShieldCheck className="h-5 w-5" />
                  ) : (
                    <KeyRound className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="font-semibold capitalize">{role.name}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {role.permissions?.length ? (
                      role.permissions.map((permission) => (
                        <Badge key={permission.id} className="border-zinc-200 bg-zinc-50 text-zinc-600">
                          {permission.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-zinc-500">Belum ada permission</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                  Aktif
                </Badge>
                <Button type="button" variant="outline" size="sm" onClick={() => editRole(role)}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                  disabled={deletingRoleId === role.id || ["admin", "marketing"].includes(role.name)}
                  onClick={() => setRoleToDelete(role)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {deletingRoleId === role.id ? "Menghapus..." : "Hapus"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {roleToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 px-4">
          <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-5 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-rose-50 text-rose-700">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-900">Hapus Role</h2>
                <p className="mt-1 text-sm leading-6 text-zinc-600">
                  Role <span className="font-semibold text-zinc-900">{roleToDelete.name}</span> akan dihapus permanen.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setRoleToDelete(null)}>
                Batal
              </Button>
              <Button
                type="button"
                className="bg-rose-600 hover:bg-rose-700"
                disabled={deletingRoleId === roleToDelete.id}
                onClick={deleteRole}
              >
                <Trash2 className="h-4 w-4" />
                {deletingRoleId === roleToDelete.id ? "Menghapus..." : "Hapus Role"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </PageChrome>
  );
}
