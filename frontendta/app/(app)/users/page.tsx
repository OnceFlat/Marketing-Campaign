"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageChrome } from "@/components/app-shell";
import { DataTable, EmptyRow } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/form";
import { ApiError, api, Paginated, User } from "@/lib/api";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "password",
    role: "marketing",
  });

  async function loadData() {
    const userData = await api<Paginated<User>>("/users?per_page=50");
    setUsers(userData.data);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData().catch(() => {
      setMessageType("error");
      setMessage("API Laravel belum aktif atau belum dimigrate.");
    });
  }, []);

  async function submitUser(event: FormEvent) {
    event.preventDefault();

    try {
      if (editingUserId) {
        await api(`/users/${editingUserId}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        setMessage("User berhasil diperbarui.");
      } else {
        await api("/users", { method: "POST", body: JSON.stringify(form) });
        setMessage("User berhasil ditambahkan.");
      }

      setMessageType("success");
      resetForm();
      loadData();
    } catch (error) {
      setMessageType("error");

      if (error instanceof ApiError && error.status === 422 && hasEmailValidationError(error.data)) {
        setMessage("Email sudah digunakan");
        return;
      }

      setMessage("User gagal disimpan.");
    }
  }

  function editUser(user: User) {
    setEditingUserId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.roles?.[0]?.name ?? "marketing",
    });
    setShowForm(true);
    setMessage("");
    setMessageType("success");
  }

  function resetForm() {
    setForm({ name: "", email: "", password: "password", role: "marketing" });
    setEditingUserId(null);
    setShowForm(false);
  }

  async function deleteUser() {
    if (!userToDelete) return;

    setDeletingUserId(userToDelete.id);
    setMessage("");

    try {
      await api(`/users/${userToDelete.id}`, { method: "DELETE" });
      setUserToDelete(null);
      setMessageType("success");
      setMessage("User berhasil dihapus.");
      loadData();
    } catch {
      setMessageType("error");
      setMessage("User gagal dihapus.");
    } finally {
      setDeletingUserId(null);
    }
  }

  return (
    <PageChrome
      title="User"
      trail="User"
      action={
        <Button
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
        >
          <Plus className="h-4 w-4" />
          Tambah User
        </Button>
      }
    >
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

      {showForm ? (
        <form
          className="mb-6 grid gap-4 rounded-lg border border-zinc-200 bg-white p-5"
          onSubmit={submitUser}
        >
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              {editingUserId ? "Edit User" : "Tambah User"}
            </h2>
            {editingUserId ? (
              <p className="mt-1 text-sm text-zinc-500">
                Kosongkan password jika tidak ingin mengganti password user.
              </p>
            ) : null}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nama">
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Email">
              <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Password">
              <Input
                required={!editingUserId}
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </Field>
            <Field label="Role">
              <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="marketing">Marketing</option>
                <option value="admin">Admin</option>
              </Select>
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={resetForm}>Batal</Button>
            <Button type="submit">{editingUserId ? "Simpan Perubahan" : "Simpan"}</Button>
          </div>
        </form>
      ) : null}

      <DataTable columns={["Nama", "Email", "Role", "Aksi"]}>
        {users.length ? (
          users.map((user) => {
            const isAdmin = user.roles?.some((role) => role.name === "admin") ?? false;

            return (
              <tr key={user.id}>
              <td className="px-4 py-4 font-semibold">{user.name}</td>
              <td className="px-4 py-4">{user.email}</td>
              <td className="px-4 py-4">
                <div className="flex gap-2">
                  {user.roles?.map((role) => (
                    <Badge key={role.id} className="border-emerald-200 bg-emerald-50 text-emerald-700">
                      {role.name}
                    </Badge>
                  ))}
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => editUser(user)}>
                    Edit
                  </Button>
                  {isAdmin ? (
                    <Badge className="border-zinc-200 bg-zinc-50 text-zinc-500">
                      Dilindungi
                    </Badge>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                      onClick={() => setUserToDelete(user)}
                    >
                      Hapus
                    </Button>
                  )}
                </div>
              </td>
              </tr>
            );
          })
        ) : (
          <EmptyRow colSpan={4} text="Belum ada user." />
        )}
      </DataTable>
      {userToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 px-4">
          <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-5 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-rose-50 text-rose-700">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-900">Hapus User</h2>
                <p className="mt-1 text-sm leading-6 text-zinc-600">
                  User <span className="font-semibold text-zinc-900">{userToDelete.name}</span> akan dihapus permanen.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setUserToDelete(null)}>
                Batal
              </Button>
              <Button
                type="button"
                className="bg-rose-600 hover:bg-rose-700"
                disabled={deletingUserId === userToDelete.id}
                onClick={deleteUser}
              >
                <Trash2 className="h-4 w-4" />
                {deletingUserId === userToDelete.id ? "Menghapus..." : "Hapus User"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </PageChrome>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function hasEmailValidationError(data: unknown) {
  if (!data || typeof data !== "object" || !("errors" in data)) {
    return false;
  }

  const errors = (data as { errors?: Record<string, unknown> }).errors;
  return Array.isArray(errors?.email) && errors.email.length > 0;
}
