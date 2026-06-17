"use client";

import { useEffect, useState } from "react";
import { Activity, Megaphone, RefreshCw, TrendingUp, Users } from "lucide-react";
import { PageChrome } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  api,
  compactNumber,
  Dashboard,
  money,
  shortDate,
  statusClass,
  statusLabels,
} from "@/lib/api";

const fallbackDashboard: Dashboard = {
  totals: { campaigns: 0, active_campaigns: 0, aktivitas: 0, users: 0 },
  engagement_totals: { views: 0, likes: 0, comments: 0, shares: 0 },
  campaigns_by_status: {},
  campaign_trend: [],
  recent_campaigns: [],
  upcoming_aktivitas: [],
};

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<Dashboard>(fallbackDashboard);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadData() {
    setLoading(true);
    setMessage("");
    try {
      setDashboard(await api<Dashboard>("/dashboard"));
    } catch {
      setMessage("API Laravel belum aktif atau belum dimigrate. Jalankan backend lalu refresh.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  return (
    <PageChrome
      title="Dasbor"
      trail="Ringkasan"
      action={
        <Button variant="outline" onClick={loadData} disabled={loading}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      }
    >
      {message ? (
        <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {message}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Megaphone} label="Total Campaign" value={dashboard.totals.campaigns} />
        <Metric icon={TrendingUp} label="Campaign Aktif" value={dashboard.totals.active_campaigns} />
        <Metric icon={Activity} label="Total Aktivitas" value={dashboard.totals.aktivitas} />
        <Metric icon={Users} label="User" value={dashboard.totals.users} />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <ViewsLineChartCard data={dashboard.campaign_trend} />
        <PieChartCard data={dashboard.campaigns_by_status} />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">Campaign Terbaru</h2>
              <Badge>{dashboard.recent_campaigns.length} data</Badge>
            </div>
            <div className="space-y-3">
              {dashboard.recent_campaigns.map((campaign) => (
                <div key={campaign.id} className="rounded-md border border-zinc-200 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold">{campaign.name}</p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {campaign.channel} · {campaign.user?.name ?? "Tanpa PIC"}
                      </p>
                    </div>
                    <Badge className={statusClass[campaign.status]}>
                      {statusLabels[campaign.status] ?? campaign.status}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm font-medium text-emerald-700">
                    {money(campaign.budget)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="mb-4 text-base font-semibold">Aktivitas Mendatang</h2>
            <div className="space-y-3">
              {dashboard.upcoming_aktivitas.map((item) => (
                <div key={item.id} className="rounded-md border border-zinc-200 p-4">
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {item.campaign?.name ?? "-"} · {shortDate(item.activity_date)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </PageChrome>
  );
}

function ViewsLineChartCard({ data }: { data: { label: string; total: number }[] }) {
  const points = buildLinePoints(data);
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = path ? `${path} L 560 180 L 40 180 Z` : "";

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Tren Views</h2>
          <Badge>{data.length} periode</Badge>
        </div>
        <div className="h-72 overflow-hidden rounded-md border border-zinc-100 bg-zinc-50 p-4">
          <svg viewBox="0 0 600 220" className="h-full w-full" role="img" aria-label="Line chart tren views">
            <line x1="40" y1="180" x2="560" y2="180" stroke="#d4d4d8" />
            <line x1="40" y1="30" x2="40" y2="180" stroke="#d4d4d8" />
            {areaPath ? <path className="animate-[chartFade_700ms_ease-out_both]" d={areaPath} fill="#dbeafe" /> : null}
            {path ? (
              <path
                className="animate-[lineDraw_900ms_ease-out_both]"
                d={path}
                fill="none"
                pathLength="1"
                stroke="#2563eb"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4"
              />
            ) : null}
            {points.map((point, index) => (
              <g
                key={point.label}
                className="animate-[pointPop_450ms_ease-out_both]"
                style={{ animationDelay: `${350 + index * 90}ms` }}
              >
                <circle cx={point.x} cy={point.y} r="5" fill="#ffffff" stroke="#2563eb" strokeWidth="3" />
                <text x={point.x} y={point.y - 12} textAnchor="middle" className="fill-zinc-700 text-[12px] font-semibold">
                  {compactNumber(point.total)}
                </text>
                <text x={point.x} y="205" textAnchor="middle" className="fill-zinc-500 text-[11px]">
                  {point.label}
                </text>
              </g>
            ))}
            {!data.length ? (
              <text x="300" y="110" textAnchor="middle" className="fill-zinc-500 text-sm">
                Belum ada data views.
              </text>
            ) : null}
          </svg>
        </div>
        <style jsx>{`
          @keyframes chartFade {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes lineDraw {
            from {
              stroke-dasharray: 1;
              stroke-dashoffset: 1;
            }
            to {
              stroke-dasharray: 1;
              stroke-dashoffset: 0;
            }
          }

          @keyframes pointPop {
            from {
              opacity: 0;
              transform: scale(0.7);
              transform-origin: center;
            }
            to {
              opacity: 1;
              transform: scale(1);
              transform-origin: center;
            }
          }
        `}</style>
      </CardContent>
    </Card>
  );
}

function PieChartCard({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).filter(([, value]) => value > 0);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  const colors = ["#10b981", "#0ea5e9", "#f59e0b", "#f43f5e", "#71717a"];
  let offset = 0;

  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="mb-4 text-base font-semibold">Status Campaign</h2>
        <div className="flex flex-col items-center gap-5 sm:flex-row xl:flex-col">
          <svg viewBox="0 0 120 120" className="h-44 w-44 -rotate-90" role="img" aria-label="Pie chart status campaign">
            <circle cx="60" cy="60" r="38" fill="none" stroke="#f4f4f5" strokeWidth="22" />
            {entries.map(([status, value], index) => {
              const dash = total ? (value / total) * 238.76 : 0;
              const segment = (
                <circle
                  key={status}
                  cx="60"
                  cy="60"
                  r="38"
                  fill="none"
                  stroke={colors[index % colors.length]}
                  strokeDasharray={`${dash} ${238.76 - dash}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                  strokeWidth="22"
                />
              );
              offset += dash;
              return segment;
            })}
          </svg>
          <div className="w-full space-y-3">
            {entries.length ? entries.map(([status, value], index) => (
              <div key={status} className="flex items-center justify-between gap-4 text-sm">
                <span className="flex items-center gap-2 text-zinc-600">
                  <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: colors[index % colors.length] }} />
                  {statusLabels[status] ?? status}
                </span>
                <span className="font-semibold">{value}</span>
              </div>
            )) : (
              <p className="text-sm text-zinc-500">Belum ada data status.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function buildLinePoints(data: { label: string; total: number }[]) {
  const max = Math.max(...data.map((item) => item.total), 1);
  const width = 520;
  const step = data.length > 1 ? width / (data.length - 1) : width;

  return data.map((item, index) => ({
    ...item,
    x: data.length > 1 ? 40 + step * index : 300,
    y: 180 - (item.total / max) * 135,
  }));
}

function Metric({
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
