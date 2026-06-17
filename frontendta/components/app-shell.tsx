"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  FileText,
  Home,
  KeyRound,
  LogOut,
  Megaphone,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthSession, clearSession, getSession } from "@/lib/auth";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: string[];
};

const primaryNav: NavItem[] = [
  { href: "/dashboard", label: "Dasbor", icon: Home },
  { href: "/campaign", label: "Campaign", icon: Megaphone },
  { href: "/aktivitas", label: "Aktivitas", icon: Activity },
  { href: "/laporan", label: "Laporan", icon: FileText },
  { href: "/users", label: "User", icon: Users, roles: ["admin"] },
  { href: "/roles", label: "Kelola Role", icon: KeyRound, roles: ["admin"] },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [checking, setChecking] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const currentSession = getSession();

    if (!currentSession) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRedirecting(true);
      setChecking(false);
      router.replace("/login");
      return;
    }

    setSession(currentSession);
    setChecking(false);
  }, [router]);

  function logout() {
    clearSession();
    router.replace("/login");
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-sm text-zinc-500">
        Memeriksa sesi...
      </div>
    );
  }

  if (redirecting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white px-5 text-center text-sm text-zinc-500">
        <p>Mengarahkan ke halaman login...</p>
        <Link className="font-medium text-emerald-700 hover:text-emerald-800" href="/login">
          Buka login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[230px] border-r border-zinc-200 bg-zinc-50/80 px-3 py-8 lg:flex lg:flex-col">
        <div className="mb-6 flex items-center gap-2 px-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden">
            <Image
              src="/Logo Central Saga new 1.png"
              alt="Logo PT Central Saga Mandala"
              fill
              priority
              className="scale-[1.8] object-contain"
            />
          </div>
          <p className="text-xs font-semibold leading-5 text-zinc-800">
            Central Saga Mandala
          </p>
        </div>
        <p className="px-3 text-xs font-medium text-zinc-400">Platform</p>
        <nav className="mt-4 space-y-1">
          {primaryNav.filter((item) => {
            if (!item.roles) return true;

            return item.roles.some((role) => session?.roles.includes(role));
          }).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-9 items-center gap-3 rounded-md px-3 text-sm text-zinc-600 transition",
                  active
                    ? "border border-zinc-200 bg-white font-semibold text-emerald-700 shadow-sm"
                    : "hover:bg-white hover:text-zinc-950",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-md px-1 py-2 text-left transition hover:bg-white"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-sm font-medium uppercase">
              {session?.user.name.charAt(0) ?? "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-zinc-700">{session?.user.name}</p>
              <p className="truncate text-xs text-zinc-400">
                {session?.roles.join(", ")}
              </p>
            </div>
            <LogOut className="h-4 w-4 text-zinc-400" />
          </button>
        </div>
      </aside>

      <div className="lg:pl-[230px]">
        <header className="sticky top-0 z-20 flex min-h-16 items-center gap-3 border-b border-zinc-200 bg-white/95 px-4 backdrop-blur lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-600 text-sm font-semibold text-white">
            MC
          </div>
          <div className="text-sm font-semibold">Marketing Campaign</div>
        </header>
        {children}
      </div>
    </div>
  );
}

export function PageChrome({
  title,
  trail,
  action,
  children,
}: {
  title: string;
  trail: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 lg:px-7">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-zinc-500">
            Dasbor <span className="px-1 text-zinc-300">/</span>{" "}
            <span className="font-medium text-zinc-900">{trail}</span>
          </p>
          <h1 className="mt-9 text-2xl font-bold tracking-normal text-zinc-950">
            {title}
          </h1>
        </div>
        {action}
      </div>
      {children}
    </main>
  );
}
