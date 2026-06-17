export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

export type User = {
  id: number;
  name: string;
  email: string;
  roles?: { id: number; name: string }[];
};

export type Campaign = {
  id: number;
  name: string;
  objective?: string;
  channel: string;
  budget: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  instagram_media_id?: string;
  instagram_permalink?: string;
  start_date?: string;
  end_date?: string;
  status: string;
  aktivitas_count?: number;
  user?: User;
};

export type Aktivitas = {
  id: number;
  title: string;
  description?: string;
  activity_date: string;
  status: string;
  campaign?: Pick<Campaign, "id" | "name" | "status">;
  user?: User;
};

export type Dashboard = {
  totals: {
    campaigns: number;
    active_campaigns: number;
    aktivitas: number;
    users: number;
  };
  campaigns_by_status: Record<string, number>;
  campaign_trend: { label: string; total: number }[];
  engagement_totals: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  recent_campaigns: Campaign[];
  report_campaigns?: Campaign[];
  upcoming_aktivitas: Aktivitas[];
};

export type Role = {
  id: number;
  name: string;
  permissions?: { id: number; name: string }[];
};

export type Paginated<T> = {
  data: T[];
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown) {
    super(`Request gagal: ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export class ApiConnectionError extends Error {
  constructor(public readonly url: string) {
    super(`Tidak bisa terhubung ke API: ${url}`);
    this.name = "ApiConnectionError";
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_URL}${path}`;
  let response: Response;

  try {
    response = await fetch(url, {
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      ...init,
    });
  } catch {
    throw new ApiConnectionError(url);
  }

  if (!response.ok) {
    let data: unknown = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    throw new ApiError(response.status, data);
  }

  return response.json();
}

export function money(value: string | number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function shortDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function compactNumber(value: string | number) {
  return new Intl.NumberFormat("id-ID", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));
}

export const statusLabels: Record<string, string> = {
  draft: "Draft",
  active: "Aktif",
  paused: "Ditunda",
  completed: "Selesai",
  posted: "Diposting",
  cancelled: "Batal",
  planned: "Terjadwal",
  in_progress: "Berjalan",
  done: "Selesai",
};

export const statusClass: Record<string, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  completed: "border-sky-200 bg-sky-50 text-sky-700",
  posted: "border-sky-200 bg-sky-50 text-sky-700",
  done: "border-sky-200 bg-sky-50 text-sky-700",
  in_progress: "border-amber-200 bg-amber-50 text-amber-700",
  paused: "border-orange-200 bg-orange-50 text-orange-700",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700",
  draft: "border-zinc-200 bg-zinc-50 text-zinc-600",
  planned: "border-teal-200 bg-teal-50 text-teal-700",
};
