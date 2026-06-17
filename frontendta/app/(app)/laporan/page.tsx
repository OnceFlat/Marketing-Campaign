"use client";

import { useEffect, useState } from "react";
import { Activity, Eye, FileDown, Heart, MessageCircle, Megaphone, Send, TrendingUp, Users } from "lucide-react";
import { PageChrome } from "@/components/app-shell";
import { DataTable, EmptyRow } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api, compactNumber, Dashboard, money, shortDate } from "@/lib/api";

const fallbackDashboard: Dashboard = {
  totals: { campaigns: 0, active_campaigns: 0, aktivitas: 0, users: 0 },
  engagement_totals: { views: 0, likes: 0, comments: 0, shares: 0 },
  campaigns_by_status: {},
  campaign_trend: [],
  recent_campaigns: [],
  report_campaigns: [],
  upcoming_aktivitas: [],
};

export default function LaporanPage() {
  const [dashboard, setDashboard] = useState<Dashboard>(fallbackDashboard);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api<Dashboard>("/dashboard")
      .then(setDashboard)
      .catch(() => setMessage("API Laravel belum aktif atau belum dimigrate."));
  }, []);

  return (
    <PageChrome
      title="Laporan"
      trail="Laporan"
      action={
        <Button onClick={() => exportReportPdf(dashboard)}>
          <FileDown className="h-4 w-4" />
          Export PDF
        </Button>
      }
    >
      {message ? (
        <div className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ReportCard icon={Megaphone} label="Total Campaign" value={dashboard.totals.campaigns} />
        <ReportCard icon={TrendingUp} label="Campaign Aktif" value={dashboard.totals.active_campaigns} />
        <ReportCard icon={Activity} label="Aktivitas" value={dashboard.totals.aktivitas} />
        <ReportCard icon={Users} label="User" value={dashboard.totals.users} />
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ReportCard icon={Eye} label="Total View" value={dashboard.engagement_totals.views} />
        <ReportCard icon={Heart} label="Total Like" value={dashboard.engagement_totals.likes} />
        <ReportCard icon={MessageCircle} label="Total Comment" value={dashboard.engagement_totals.comments} />
        <ReportCard icon={Send} label="Total Share" value={dashboard.engagement_totals.shares} />
      </section>

      <DataTable columns={["Campaign", "PIC", "Anggaran", "Mulai", "View", "Like", "Comment", "Share", "Aktivitas"]}>
        {(dashboard.report_campaigns?.length ? dashboard.report_campaigns : dashboard.recent_campaigns).length ? (
          (dashboard.report_campaigns?.length ? dashboard.report_campaigns : dashboard.recent_campaigns).map((campaign) => (
            <tr key={campaign.id}>
              <td className="px-4 py-4 font-semibold">{campaign.name}</td>
              <td className="px-4 py-4">{campaign.user?.name ?? "-"}</td>
              <td className="px-4 py-4">{money(campaign.budget)}</td>
              <td className="px-4 py-4">{shortDate(campaign.start_date)}</td>
              <td className="px-4 py-4">{campaign.views ?? 0}</td>
              <td className="px-4 py-4">{campaign.likes ?? 0}</td>
              <td className="px-4 py-4">{campaign.comments ?? 0}</td>
              <td className="px-4 py-4">{campaign.shares ?? 0}</td>
              <td className="px-4 py-4">{campaign.aktivitas_count ?? 0}</td>
            </tr>
          ))
        ) : (
          <EmptyRow colSpan={9} text="Belum ada data laporan." />
        )}
      </DataTable>
    </PageChrome>
  );
}

function exportReportPdf(dashboard: Dashboard) {
  const campaigns = dashboard.report_campaigns?.length ? dashboard.report_campaigns : dashboard.recent_campaigns;
  const generatedAt = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());
  const statusRows = Object.entries(dashboard.campaigns_by_status)
    .map(([status, total]) => `<tr><td>${escapeHtml(status)}</td><td>${total}</td></tr>`)
    .join("");
  const campaignRows = campaigns
    .map((campaign) => `
      <tr>
        <td>${escapeHtml(campaign.name)}</td>
        <td>${escapeHtml(campaign.user?.name ?? "-")}</td>
        <td>${escapeHtml(money(campaign.budget))}</td>
        <td>${escapeHtml(shortDate(campaign.start_date))}</td>
        <td>${campaign.views ?? 0}</td>
        <td>${campaign.likes ?? 0}</td>
        <td>${campaign.comments ?? 0}</td>
        <td>${campaign.shares ?? 0}</td>
        <td>${campaign.aktivitas_count ?? 0}</td>
      </tr>
    `)
    .join("");

  const reportWindow = window.open("", "_blank", "width=1024,height=768");
  if (!reportWindow) return;

  reportWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>Laporan Campaign</title>
        <style>
          body { color: #18181b; font-family: Arial, sans-serif; margin: 32px; }
          h1 { font-size: 24px; margin: 0 0 4px; }
          h2 { font-size: 15px; margin: 24px 0 10px; }
          p { color: #52525b; margin: 0 0 18px; }
          .grid { display: grid; gap: 10px; grid-template-columns: repeat(4, 1fr); margin: 18px 0; }
          .metric { border: 1px solid #d4d4d8; border-radius: 8px; padding: 12px; }
          .label { color: #71717a; font-size: 11px; text-transform: uppercase; }
          .value { font-size: 22px; font-weight: 700; margin-top: 6px; }
          table { border-collapse: collapse; font-size: 12px; width: 100%; }
          th, td { border: 1px solid #d4d4d8; padding: 8px; text-align: left; }
          th { background: #f4f4f5; }
          @media print { body { margin: 20mm; } }
        </style>
      </head>
      <body>
        <h1>Laporan Campaign</h1>
        <p>Dibuat pada ${escapeHtml(generatedAt)}</p>
        <div class="grid">
          <div class="metric"><div class="label">Total Campaign</div><div class="value">${dashboard.totals.campaigns}</div></div>
          <div class="metric"><div class="label">Campaign Aktif</div><div class="value">${dashboard.totals.active_campaigns}</div></div>
          <div class="metric"><div class="label">Aktivitas</div><div class="value">${dashboard.totals.aktivitas}</div></div>
          <div class="metric"><div class="label">User</div><div class="value">${dashboard.totals.users}</div></div>
          <div class="metric"><div class="label">View</div><div class="value">${dashboard.engagement_totals.views}</div></div>
          <div class="metric"><div class="label">Like</div><div class="value">${dashboard.engagement_totals.likes}</div></div>
          <div class="metric"><div class="label">Comment</div><div class="value">${dashboard.engagement_totals.comments}</div></div>
          <div class="metric"><div class="label">Share</div><div class="value">${dashboard.engagement_totals.shares}</div></div>
        </div>
        <h2>Ringkasan Status</h2>
        <table><thead><tr><th>Status</th><th>Total</th></tr></thead><tbody>${statusRows || "<tr><td colspan=\"2\">Belum ada data.</td></tr>"}</tbody></table>
        <h2>Detail Campaign</h2>
        <table>
          <thead><tr><th>Campaign</th><th>PIC</th><th>Anggaran</th><th>Mulai</th><th>View</th><th>Like</th><th>Comment</th><th>Share</th><th>Aktivitas</th></tr></thead>
          <tbody>${campaignRows || "<tr><td colspan=\"9\">Belum ada data.</td></tr>"}</tbody>
        </table>
        <script>window.onload = () => { window.print(); };</script>
      </body>
    </html>
  `);
  reportWindow.document.close();
}

function escapeHtml(value: string) {
  const replacements: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return value.replace(/[&<>"']/g, (char) => replacements[char] ?? char);
}

function ReportCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Megaphone;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-zinc-500">{label}</p>
          <p className="mt-2 text-3xl font-bold">{compactNumber(value)}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
