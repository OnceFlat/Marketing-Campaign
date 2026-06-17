"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";
import { ApiConnectionError, ApiError, API_URL, api } from "@/lib/api";
import { AuthSession, getSession, saveSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(() => {
    if (typeof window === "undefined") return "";

    const successMessage = window.sessionStorage.getItem("auth_success_message") ?? "";
    window.sessionStorage.removeItem("auth_success_message");

    return successMessage;
  });

  const cleanEmail = useMemo(() => email.trim().toLowerCase(), [email]);

  function submitLogin(event: FormEvent) {
    event.preventDefault();
    void login();
  }

  async function login() {
    if (loading) return;

    setError("");
    setSuccess("");

    if (!cleanEmail) {
      setError("Email wajib diisi.");
      return;
    }

    if (!password) {
      setError("Password wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const session = await api<AuthSession>("/login", {
        method: "POST",
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      if (!isValidSession(session)) {
        throw new Error("Response login tidak lengkap.");
      }

      saveSession(session);
      if (!getSession()) {
        throw new Error("Session login gagal disimpan di browser.");
      }

      window.location.assign("/dashboard");
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f1e8] text-[#17211b]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(246,183,93,0.38),transparent_28%),radial-gradient(circle_at_80%_12%,rgba(6,95,70,0.22),transparent_30%),linear-gradient(135deg,#f6f1e8_0%,#fffaf1_45%,#e4efe8_100%)]" />
      <div className="absolute left-[-12rem] top-20 h-96 w-96 rounded-full border border-[#d6b16d]/40" />
      <div className="absolute bottom-[-9rem] right-[-7rem] h-80 w-80 rounded-full bg-[#0b5d43]/10 blur-2xl" />

      <section className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-[1fr_440px] lg:px-8">
        <div className="hidden lg:block">
          <BrandMark />
          <p className="mt-14 inline-flex items-center gap-2 rounded-full border border-[#d6b16d]/50 bg-white/45 px-4 py-2 text-sm font-semibold text-[#6e5122] shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4" />
            Marketing Campaign Control Room
          </p>
          <h1 className="mt-7 max-w-2xl text-6xl font-black leading-[0.95] tracking-[-0.06em] text-[#123427]">
            Kelola campaign dengan lebih efektif.
          </h1>

          <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
            {[
              ["API", API_URL.replace(/^https?:\/\//, "")],
              ["Role", "admin / marketing"],
              ["Sesi", "browser fallback"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-white/60 bg-white/55 p-4 shadow-sm backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8b7449]">{label}</p>
                <p className="mt-2 truncate text-sm font-semibold text-[#213229]">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="rounded-[2rem] border border-white/70 bg-white/78 p-5 shadow-[0_24px_80px_rgba(31,44,35,0.16)] backdrop-blur-xl sm:p-7">
            <div className="mb-8 flex items-center justify-between gap-4">
              <BrandMark compact />
              <div className="rounded-full bg-[#123427] px-3 py-1 text-xs font-semibold text-[#f8eac8]">
                Secure Login
              </div>
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#a36d20]">Selamat datang</p>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-[#123427]">
                Masuk ke platform
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#657268]">
                Gunakan email dan password akun Anda.
              </p>
            </div>

            <div className="mt-6 grid gap-3">
              {success ? (
                <Notice tone="success">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {success}
                </Notice>
              ) : null}
              {error ? <Notice tone="error">{error}</Notice> : null}
            </div>

            <form className="mt-7 grid gap-5" noValidate onSubmit={submitLogin}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#27372e]">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8d9b91]" />
                  <Input
                    id="email"
                    autoComplete="email"
                    className="h-12 rounded-2xl border-[#d9d1c2] bg-[#fffdf8] pl-10 focus:border-[#0b6b4c] focus:ring-[#dfeee6]"
                    inputMode="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@campaign.test"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="password" className="text-[#27372e]">Password</Label>
                  <Link className="text-sm font-bold text-[#0b6b4c] hover:text-[#064c36]" href="/forgot-password">
                    Lupa password?
                  </Link>
                </div>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8d9b91]" />
                  <Input
                    id="password"
                    autoComplete="current-password"
                    className="h-12 rounded-2xl border-[#d9d1c2] bg-[#fffdf8] pl-10 pr-12 focus:border-[#0b6b4c] focus:ring-[#dfeee6]"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Masukkan password"
                    disabled={loading}
                  />
                  <PasswordToggle
                    active={showPassword}
                    label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    onClick={() => setShowPassword((value) => !value)}
                  />
                </div>
              </div>

              <Button
                type="button"
                className="h-12 rounded-2xl bg-[#123427] text-base font-extrabold text-[#fff8e8] shadow-lg shadow-[#123427]/20 hover:bg-[#0b281e]"
                disabled={loading}
                onClick={() => void login()}
              >
                {loading ? "Memeriksa akun..." : "Masuk sekarang"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-white/65 shadow-sm">
        <Image
          src="/Logo Central Saga new 1.png"
          alt="Logo PT Central Saga Mandala"
          fill
          priority
          className="scale-[1.8] object-contain"
        />
      </div>
      {!compact ? (
        <div>
          <p className="text-lg font-black tracking-[-0.03em] text-[#123427]">PT Central Saga Mandala</p>
          <p className="text-sm font-medium text-[#667568]">Marketing Campaign</p>
        </div>
      ) : null}
    </div>
  );
}

function PasswordToggle({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl bg-[#f6f1e8] text-[#637268] transition hover:bg-[#e8dfcf] hover:text-[#123427]"
      onClick={onClick}
    >
      {active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}

function Notice({ tone, children }: { tone: "success" | "error"; children: React.ReactNode }) {
  const className = tone === "success"
    ? "border-[#b7dec8] bg-[#edf8f1] text-[#105235]"
    : "border-[#efc0b7] bg-[#fff0ed] text-[#9c2f22]";

  return (
    <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium ${className}`}>
      {children}
    </div>
  );
}

function isValidSession(session: AuthSession): session is AuthSession {
  return Boolean(session?.user?.id && session.user.name && session.user.email && Array.isArray(session.roles));
}

function getApiErrorMessage(caughtError: unknown) {
  if (caughtError instanceof ApiConnectionError) {
    return `Tidak bisa terhubung ke API (${caughtError.url}). Jalankan backend Laravel atau sesuaikan NEXT_PUBLIC_API_URL.`;
  }

  if (!(caughtError instanceof ApiError)) {
    return "Login berhasil dicek, tapi session gagal disimpan di browser. Coba matikan private mode/clear site data lalu login ulang.";
  }

  const data = caughtError.data as {
    message?: string;
    errors?: Record<string, string[]>;
  } | null;

  const firstFieldError = data?.errors ? Object.values(data.errors).flat()[0] : "";

  return firstFieldError || data?.message || "Email atau password tidak sesuai, atau akun belum punya role.";
}
