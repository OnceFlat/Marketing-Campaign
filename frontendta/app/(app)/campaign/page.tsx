"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, PauseCircle, Plus, RefreshCw, Sparkles, Trash2, TrendingUp } from "lucide-react";
import { PageChrome } from "@/components/app-shell";
import { DataTable, EmptyRow } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { getSession } from "@/lib/auth";
import {
  api,
  Campaign,
  compactNumber,
  money,
  Paginated,
  shortDate,
  statusClass,
  statusLabels,
  User,
} from "@/lib/api";

const emptyForm = {
  user_id: "",
  name: "",
  objective: "",
  channel: "",
  budget: "",
  views: "",
  likes: "",
  comments: "",
  shares: "",
  instagram_permalink: "",
  start_date: "",
  end_date: "",
  status: "active",
};

export default function CampaignPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);
  const [campaignToToggle, setCampaignToToggle] = useState<Campaign | null>(null);
  const [deletingCampaignId, setDeletingCampaignId] = useState<number | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [togglingCampaignId, setTogglingCampaignId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<number[]>([]);
  const pollingRef = useRef(false);
  const [currentUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    return getSession()?.user ?? null;
  });
  const [form, setForm] = useState(emptyForm);

  const picUsers = useMemo(() => {
    const options = users.filter((user) => user.roles?.some((role) => role.name === "marketing"));

    if (currentUser && !options.some((user) => user.id === currentUser.id)) {
      return [currentUser, ...options];
    }

    return options;
  }, [currentUser, users]);

  const recommendedCampaigns = useMemo(() => {
    return campaigns
      .filter((campaign) => campaign.instagram_permalink && campaign.status !== "cancelled")
      .map((campaign) => {
        const views = Number(campaign.views ?? 0);
        const likes = Number(campaign.likes ?? 0);
        const comments = Number(campaign.comments ?? 0);
        const shares = Number(campaign.shares ?? 0);
        const engagement = likes + comments + shares;
        const engagementRate = views > 0 ? (engagement / views) * 100 : 0;
        const score = views + likes * 20 + comments * 35 + shares * 30;

        return {
          campaign,
          engagement,
          engagementRate,
          score,
        };
      })
      .filter((item) => item.score > 0)
      .sort((first, second) => second.score - first.score)
      .slice(0, 3);
  }, [campaigns]);

  const selectedCampaigns = useMemo(
    () => campaigns.filter((campaign) => selectedCampaignIds.includes(campaign.id)),
    [campaigns, selectedCampaignIds],
  );

  const allVisibleSelected = campaigns.length > 0 && selectedCampaignIds.length === campaigns.length;

  async function loadData() {
    const [campaignData, userData] = await Promise.all([
      api<Paginated<Campaign>>("/campaigns?per_page=50"),
      api<Paginated<User>>("/users?per_page=50"),
    ]);
    setCampaigns(campaignData.data);
    setUsers(userData.data);
    setSelectedCampaignIds((selectedIds) =>
      selectedIds.filter((id) => campaignData.data.some((campaign) => campaign.id === id)),
    );
  }

  useEffect(() => {
    let mounted = true;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData().catch(() => setMessage("API Laravel belum aktif atau belum dimigrate."));

    const intervalId = window.setInterval(async () => {
      if (pollingRef.current) return;

      pollingRef.current = true;

      try {
        const campaignData = await api<Paginated<Campaign>>("/campaigns?per_page=50");

        if (mounted) {
          setCampaigns(campaignData.data);
          setSelectedCampaignIds((selectedIds) =>
            selectedIds.filter((id) => campaignData.data.some((campaign) => campaign.id === id)),
          );
        }
      } catch {
        // Manual refresh keeps showing errors; background polling stays quiet.
      } finally {
        pollingRef.current = false;
      }
    }, 2000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  async function refreshData() {
    setRefreshing(true);
    setMessage("");

    try {
      await loadData();
      setMessage("Data campaign berhasil diperbarui.");
    } catch {
      setMessage("Data campaign gagal diperbarui.");
    } finally {
      setRefreshing(false);
    }
  }

  async function submitCampaign(event: FormEvent) {
    event.preventDefault();

    await api(editingId ? `/campaigns/${editingId}` : "/campaigns", {
      method: editingId ? "PUT" : "POST",
      body: JSON.stringify({
        ...form,
        user_id: form.user_id || null,
        budget: form.budget || "0",
        views: form.views || "0",
        likes: form.likes || "0",
        comments: form.comments || "0",
        shares: form.shares || "0",
      }),
    });
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setMessage(editingId ? "Campaign berhasil diperbarui." : "Campaign berhasil ditambahkan.");
    loadData();
  }

  function startAdd() {
    setEditingId(null);
    setForm({ ...emptyForm, user_id: currentUser ? String(currentUser.id) : "" });
    setShowForm(true);
    setMessage("");
  }

  function cancelForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  }

  function editCampaign(campaign: Campaign) {
    setEditingId(campaign.id);
    setForm({
      user_id: campaign.user?.id ? String(campaign.user.id) : "",
      name: campaign.name,
      objective: campaign.objective ?? "",
      channel: campaign.channel,
      budget: String(campaign.budget ?? "0"),
      views: String(campaign.views ?? 0),
      likes: String(campaign.likes ?? 0),
      comments: String(campaign.comments ?? 0),
      shares: String(campaign.shares ?? 0),
      instagram_permalink: campaign.instagram_permalink ?? "",
      start_date: toDateInputValue(campaign.start_date),
      end_date: toDateInputValue(campaign.end_date),
      status: campaign.status,
    });
    setShowForm(true);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteCampaign() {
    if (!campaignToDelete) return;

    setDeletingCampaignId(campaignToDelete.id);
    setMessage("");

    try {
      await api(`/campaigns/${campaignToDelete.id}`, { method: "DELETE" });
      setCampaignToDelete(null);
      setMessage("Campaign berhasil dihapus.");
      loadData();
    } catch {
      setMessage("Campaign gagal dihapus.");
    } finally {
      setDeletingCampaignId(null);
    }
  }

  async function deleteSelectedCampaigns() {
    if (!selectedCampaignIds.length) return;

    setBulkDeleting(true);
    setMessage("");

    try {
      await Promise.all(selectedCampaignIds.map((id) => api(`/campaigns/${id}`, { method: "DELETE" })));
      setSelectedCampaignIds([]);
      setMessage(`${selectedCampaignIds.length} campaign berhasil dihapus.`);
      loadData();
    } catch {
      setMessage("Sebagian campaign gagal dihapus.");
    } finally {
      setBulkDeleting(false);
    }
  }

  function toggleSelectedCampaign(id: number) {
    setSelectedCampaignIds((selectedIds) =>
      selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id],
    );
  }

  function toggleAllVisibleCampaigns() {
    setSelectedCampaignIds(allVisibleSelected ? [] : campaigns.map((campaign) => campaign.id));
  }

  async function toggleCampaignStatus() {
    if (!campaignToToggle) return;

    const campaign = campaignToToggle;
    const activating = campaign.status === "cancelled";
    const nextStatus = activating ? "active" : "cancelled";

    setTogglingCampaignId(campaign.id);
    setMessage("");

    try {
      await api(`/campaigns/${campaign.id}`, {
        method: "PUT",
        body: JSON.stringify({
          user_id: campaign.user?.id ?? null,
          name: campaign.name,
          objective: campaign.objective ?? null,
          channel: campaign.channel,
          budget: campaign.budget,
          views: campaign.views ?? 0,
          likes: campaign.likes ?? 0,
          comments: campaign.comments ?? 0,
          shares: campaign.shares ?? 0,
          instagram_permalink: campaign.instagram_permalink ?? null,
          instagram_media_id: campaign.instagram_media_id ?? null,
          start_date: toDateInputValue(campaign.start_date) || null,
          end_date: toDateInputValue(campaign.end_date) || null,
          status: nextStatus,
        }),
      });
      setCampaignToToggle(null);
      setMessage(
        activating
          ? "Campaign berhasil diaktifkan kembali."
          : "Campaign berhasil dibatalkan.",
      );
      loadData();
    } catch {
      setMessage("Status campaign gagal diubah.");
    } finally {
      setTogglingCampaignId(null);
    }
  }

  return (
    <PageChrome
      title="Campaign"
      trail="Campaign"
      action={
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={refreshData} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Memuat..." : "Refresh"}
          </Button>
          {campaigns.length ? (
            <Button type="button" variant="outline" onClick={toggleAllVisibleCampaigns}>
              {allVisibleSelected ? "Batal Pilih" : "Pilih Semua"}
            </Button>
          ) : null}
          {selectedCampaignIds.length ? (
            <Button
              type="button"
              className="bg-rose-600 hover:bg-rose-700"
              disabled={bulkDeleting}
              onClick={deleteSelectedCampaigns}
            >
              <Trash2 className="h-4 w-4" />
              {bulkDeleting ? "Menghapus..." : `Hapus ${selectedCampaignIds.length}`}
            </Button>
          ) : null}
          <Button onClick={startAdd}>
            <Plus className="h-4 w-4" />
            Tambah Campaign
          </Button>
        </div>
      }
    >
      {message ? (
        <div className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      <div
        className={`grid transition-all duration-300 ease-out ${
          showForm ? "mb-6 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
        <form
          className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-5"
          onSubmit={submitCampaign}
        >
          <h2 className="text-base font-semibold">
            {editingId ? "Edit Campaign" : "Tambah Campaign"}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Nama">
              <Input required placeholder="Tambahkan nama campaign" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Channel">
              <Select required value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
                <option value="">Pilih channel</option>
                <option value="Instagram">Instagram</option>
                <option value="Lainnya">Lainnya</option>
              </Select>
            </Field>
            <Field label="Anggaran">
              <Input type="number" min="0" placeholder="Tambahkan anggaran" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
            </Field>
            <Field label="View">
              <Input type="number" min="0" placeholder="Tambahkan jumlah view" value={form.views} onChange={(e) => setForm({ ...form, views: e.target.value })} />
            </Field>
            <Field label="Like">
              <Input type="number" min="0" placeholder="Tambahkan jumlah like" value={form.likes} onChange={(e) => setForm({ ...form, likes: e.target.value })} />
            </Field>
            <Field label="Comment">
              <Input type="number" min="0" placeholder="Tambahkan jumlah comment" value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} />
            </Field>
            <Field label="Share">
              <Input type="number" min="0" placeholder="Tambahkan jumlah share" value={form.shares} onChange={(e) => setForm({ ...form, shares: e.target.value })} />
            </Field>
            <Field label="URL Post Instagram">
              <Input type="url" placeholder="https://www.instagram.com/p/..." value={form.instagram_permalink} onChange={(e) => setForm({ ...form, instagram_permalink: e.target.value })} />
            </Field>
            <Field label="Mulai">
              <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </Field>
            <Field label="Selesai">
              <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </Field>
            <Field label="PIC">
              <Select value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })}>
                <option value="">Tanpa PIC</option>
                {picUsers.map((user) => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Aktif</option>
                <option value="posted">Diposting</option>
                <option value="cancelled">Batal</option>
              </Select>
            </Field>
          </div>
          <Field label="Tujuan">
            <Textarea value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={cancelForm}>Batal</Button>
            <Button type="submit">{editingId ? "Simpan Perubahan" : "Simpan"}</Button>
          </div>
        </form>
        </div>
      </div>

      <section className="mb-6 rounded-lg border border-emerald-100 bg-emerald-50/70 p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-800">
              <Sparkles className="h-5 w-5" />
              <h2 className="text-base font-semibold">Rekomendasi Postingan untuk Diiklankan</h2>
            </div>
            <p className="mt-1 text-sm text-emerald-700">
              Dipilih dari performa view, like, comment, dan share yang sudah tersinkron dari Instagram.
            </p>
          </div>
          <Badge className="w-fit border-emerald-200 bg-white text-emerald-700">
            Top {recommendedCampaigns.length}
          </Badge>
        </div>

        {recommendedCampaigns.length ? (
          <div className="grid gap-3 lg:grid-cols-3">
            {recommendedCampaigns.map(({ campaign, engagement, engagementRate, score }, index) => (
              <article key={campaign.id} className="rounded-md border border-emerald-100 bg-white p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-emerald-600">Rekomendasi #{index + 1}</p>
                    <h3 className="mt-1 font-semibold text-zinc-900">{campaign.name}</h3>
                  </div>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <MetricText label="View" value={compactNumber(campaign.views ?? 0)} />
                  <MetricText label="Engagement" value={compactNumber(engagement)} />
                  <MetricText label="Rate" value={`${engagementRate.toFixed(1)}%`} />
                  <MetricText label="Skor" value={compactNumber(score)} />
                </div>
                <p className="mt-3 text-sm text-zinc-600">
                  Layak diuji iklan karena performa organiknya lebih kuat dibanding postingan lain.
                </p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <Badge className={statusClass[campaign.status]}>
                    {statusLabels[campaign.status] ?? campaign.status}
                  </Badge>
                  <a
                    className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800"
                    href={campaign.instagram_permalink}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Buka Post
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-emerald-200 bg-white px-4 py-5 text-sm text-emerald-700">
            Belum ada rekomendasi. Tambahkan URL post Instagram lalu tunggu metrik view, like, comment, atau share tersinkron.
          </div>
        )}
      </section>

      {selectedCampaignIds.length ? (
        <div className="mb-3 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {selectedCampaignIds.length} campaign dipilih: {selectedCampaigns.map((campaign) => campaign.name).join(", ")}
        </div>
      ) : null}

      <DataTable columns={["Pilih", "Nama", "Channel", "Anggaran", "Periode", "View", "Like", "Comment", "Share", "Status", "Aksi"]}>
        {campaigns.length ? (
          campaigns.map((campaign) => (
            <tr key={campaign.id}>
              <td className="px-4 py-4">
                <input
                  aria-label={`Pilih ${campaign.name}`}
                  checked={selectedCampaignIds.includes(campaign.id)}
                  className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                  type="checkbox"
                  onChange={() => toggleSelectedCampaign(campaign.id)}
                />
              </td>
              <td className="px-4 py-4">
                <p className="font-semibold">{campaign.name}</p>
              </td>
              <td className="px-4 py-4">
                <p className="font-medium">{campaign.channel}</p>
                {campaign.instagram_permalink ? (
                  <a
                    className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800"
                    href={campaign.instagram_permalink}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Buka Post
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <span className="mt-1 block text-sm text-zinc-400">-</span>
                )}
                {campaign.instagram_media_id ? (
                  <p className="mt-1 text-xs text-zinc-500">ID {campaign.instagram_media_id}</p>
                ) : null}
              </td>
              <td className="px-4 py-4">{money(campaign.budget)}</td>
              <td className="px-4 py-4">{shortDate(campaign.start_date)} - {shortDate(campaign.end_date)}</td>
              <td className="px-4 py-4">{campaign.views ?? 0}</td>
              <td className="px-4 py-4">{campaign.likes ?? 0}</td>
              <td className="px-4 py-4">{campaign.comments ?? 0}</td>
              <td className="px-4 py-4">{campaign.shares ?? 0}</td>
              <td className="px-4 py-4">
                <Badge className={statusClass[campaign.status]}>
                  {statusLabels[campaign.status] ?? campaign.status}
                </Badge>
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => editCampaign(campaign)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={
                      campaign.status === "cancelled"
                        ? "hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                        : "hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                    }
                    onClick={() => setCampaignToToggle(campaign)}
                  >
                    {campaign.status === "cancelled" ? "Aktifkan" : "Batalkan"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                    onClick={() => setCampaignToDelete(campaign)}
                  >
                    Hapus
                  </Button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <EmptyRow colSpan={11} text="Belum ada campaign." />
        )}
      </DataTable>
      {campaignToToggle ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 px-4">
          <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-5 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-700">
                <PauseCircle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-900">
                  {campaignToToggle.status === "cancelled" ? "Aktifkan Campaign" : "Batalkan Campaign"}
                </h2>
                <p className="mt-1 text-sm leading-6 text-zinc-600">
                  Campaign <span className="font-semibold text-zinc-900">{campaignToToggle.name}</span> akan {campaignToToggle.status === "cancelled" ? "diaktifkan kembali" : "dibatalkan"}.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCampaignToToggle(null)}>
                Batal
              </Button>
              <Button
                type="button"
                className="bg-amber-600 hover:bg-amber-700"
                disabled={togglingCampaignId === campaignToToggle.id}
                onClick={toggleCampaignStatus}
              >
                <PauseCircle className="h-4 w-4" />
                {togglingCampaignId === campaignToToggle.id
                  ? "Menyimpan..."
                  : campaignToToggle.status === "cancelled"
                    ? "Aktifkan Campaign"
                    : "Batalkan Campaign"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      {campaignToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 px-4">
          <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-5 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-rose-50 text-rose-700">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-900">Hapus Campaign</h2>
                <p className="mt-1 text-sm leading-6 text-zinc-600">
                  Campaign <span className="font-semibold text-zinc-900">{campaignToDelete.name}</span> akan dihapus permanen.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCampaignToDelete(null)}>
                Batal
              </Button>
              <Button
                type="button"
                className="bg-rose-600 hover:bg-rose-700"
                disabled={deletingCampaignId === campaignToDelete.id}
                onClick={deleteCampaign}
              >
                <Trash2 className="h-4 w-4" />
                {deletingCampaignId === campaignToDelete.id ? "Menghapus..." : "Hapus Campaign"}
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

function MetricText({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-zinc-50 px-3 py-2">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 font-semibold text-zinc-900">{value}</p>
    </div>
  );
}

function toDateInputValue(value?: string) {
  return value ? value.slice(0, 10) : "";
}
