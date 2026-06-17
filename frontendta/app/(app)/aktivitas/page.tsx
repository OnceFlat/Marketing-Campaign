"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageChrome } from "@/components/app-shell";
import { DataTable, EmptyRow } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import {
  Aktivitas,
  api,
  Campaign,
  Paginated,
  shortDate,
  statusClass,
  statusLabels,
  User,
} from "@/lib/api";

const emptyForm = {
  campaign_id: "",
  user_id: "",
  title: "",
  description: "",
  activity_date: "",
  status: "planned",
};

export default function AktivitasPage() {
  const [aktivitas, setAktivitas] = useState<Aktivitas[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [aktivitasToDelete, setAktivitasToDelete] = useState<Aktivitas | null>(null);
  const [deletingAktivitasId, setDeletingAktivitasId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(emptyForm);

  const marketingUsers = useMemo(
    () => users.filter((user) => user.roles?.some((role) => role.name === "marketing")),
    [users],
  );

  async function loadData() {
    const [aktivitasData, campaignData, userData] = await Promise.all([
      api<Paginated<Aktivitas>>("/aktivitas?per_page=50"),
      api<Paginated<Campaign>>("/campaigns?per_page=50"),
      api<Paginated<User>>("/users?per_page=50"),
    ]);
    setAktivitas(aktivitasData.data);
    setCampaigns(campaignData.data);
    setUsers(userData.data);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData().catch(() => setMessage("API Laravel belum aktif atau belum dimigrate."));
  }, []);

  async function submitAktivitas(event: FormEvent) {
    event.preventDefault();

    await api(editingId ? `/aktivitas/${editingId}` : "/aktivitas", {
      method: editingId ? "PUT" : "POST",
      body: JSON.stringify({ ...form, user_id: form.user_id || null }),
    });
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setMessage(editingId ? "Aktivitas berhasil diperbarui." : "Aktivitas berhasil ditambahkan.");
    loadData();
  }

  function startAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setMessage("");
  }

  function cancelForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  }

  function editAktivitas(item: Aktivitas) {
    setEditingId(item.id);
    setForm({
      campaign_id: item.campaign?.id ? String(item.campaign.id) : "",
      user_id: item.user?.id ? String(item.user.id) : "",
      title: item.title,
      description: item.description ?? "",
      activity_date: toDateInputValue(item.activity_date),
      status: item.status,
    });
    setShowForm(true);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteAktivitas() {
    if (!aktivitasToDelete) return;

    setDeletingAktivitasId(aktivitasToDelete.id);
    setMessage("");

    try {
      await api(`/aktivitas/${aktivitasToDelete.id}`, { method: "DELETE" });
      setAktivitasToDelete(null);
      setMessage("Aktivitas berhasil dihapus.");
      loadData();
    } catch {
      setMessage("Aktivitas gagal dihapus.");
    } finally {
      setDeletingAktivitasId(null);
    }
  }

  return (
    <PageChrome
      title="Aktivitas"
      trail="Aktivitas"
      action={
        <Button onClick={startAdd}>
          <Plus className="h-4 w-4" />
          Tambah Aktivitas
        </Button>
      }
    >
      {message ? (
        <div className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      {showForm ? (
        <form
          className="mb-6 grid gap-4 rounded-lg border border-zinc-200 bg-white p-5"
          onSubmit={submitAktivitas}
        >
          <h2 className="text-base font-semibold">
            {editingId ? "Edit Aktivitas" : "Tambah Aktivitas"}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Campaign">
              <Select required value={form.campaign_id} onChange={(e) => setForm({ ...form, campaign_id: e.target.value })}>
                <option value="">Pilih campaign</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="PIC">
              <Select value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })}>
                <option value="">Tanpa PIC</option>
                {marketingUsers.map((user) => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Judul">
              <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Tanggal">
              <Input required type="date" value={form.activity_date} onChange={(e) => setForm({ ...form, activity_date: e.target.value })} />
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="planned">Terjadwal</option>
                <option value="in_progress">Berjalan</option>
                <option value="done">Selesai</option>
                <option value="cancelled">Batal</option>
              </Select>
            </Field>
          </div>
          <Field label="Catatan">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={cancelForm}>Batal</Button>
            <Button type="submit">{editingId ? "Simpan Perubahan" : "Simpan"}</Button>
          </div>
        </form>
      ) : null}

      <DataTable columns={["Judul", "Campaign", "PIC", "Tanggal", "Status", "Aksi"]}>
        {aktivitas.length ? (
          aktivitas.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-4 font-semibold">{item.title}</td>
              <td className="px-4 py-4">{item.campaign?.name ?? "-"}</td>
              <td className="px-4 py-4">{item.user?.name ?? "-"}</td>
              <td className="px-4 py-4">{shortDate(item.activity_date)}</td>
              <td className="px-4 py-4">
                <Badge className={statusClass[item.status]}>
                  {statusLabels[item.status] ?? item.status}
                </Badge>
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => editAktivitas(item)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                    onClick={() => setAktivitasToDelete(item)}
                  >
                    Hapus
                  </Button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <EmptyRow colSpan={6} text="Belum ada aktivitas." />
        )}
      </DataTable>
      {aktivitasToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 px-4">
          <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-5 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-rose-50 text-rose-700">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-900">Hapus Aktivitas</h2>
                <p className="mt-1 text-sm leading-6 text-zinc-600">
                  Aktivitas <span className="font-semibold text-zinc-900">{aktivitasToDelete.title}</span> akan dihapus permanen.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setAktivitasToDelete(null)}>
                Batal
              </Button>
              <Button
                type="button"
                className="bg-rose-600 hover:bg-rose-700"
                disabled={deletingAktivitasId === aktivitasToDelete.id}
                onClick={deleteAktivitas}
              >
                <Trash2 className="h-4 w-4" />
                {deletingAktivitasId === aktivitasToDelete.id ? "Menghapus..." : "Hapus Aktivitas"}
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

function toDateInputValue(value?: string) {
  return value ? value.slice(0, 10) : "";
}
