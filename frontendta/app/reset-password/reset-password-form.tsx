"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { ApiError, api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form";

type ResetPasswordFormProps = {
  initialEmail?: string;
  initialToken?: string;
};

export function ResetPasswordForm({
  initialEmail = "",
  initialToken = "",
}: ResetPasswordFormProps) {
  const router = useRouter();
  const [token] = useState(initialToken);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function submitResetPassword(event: FormEvent) {
    event.preventDefault();
    void resetPassword();
  }

  async function resetPassword() {
    setMessage("");
    setError("");

    const cleanEmail = email.trim();

    if (!token) {
      setError("Link reset password tidak lengkap. Minta link reset baru dari halaman lupa password.");
      return;
    }

    if (!cleanEmail) {
      setError("Email wajib diisi.");
      return;
    }

    if (password.length < 8) {
      setError("Password baru minimal 8 karakter.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Konfirmasi password harus sama dengan password baru.");
      return;
    }

    setLoading(true);

    try {
      const response = await api<{ message: string }>("/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token,
          email: cleanEmail,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      setMessage(response.message);
      window.sessionStorage.setItem(
        "auth_success_message",
        "Password berhasil diperbarui. Silakan login dengan password baru.",
      );
      window.setTimeout(() => router.replace("/login"), 1200);
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Reset password gagal. Link mungkin sudah kedaluwarsa atau data belum sesuai."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-5 py-10">
      <div className="w-full max-w-md">
        <div className="relative mb-8 h-16 w-16 overflow-hidden">
          <Image
            src="/Logo Central Saga new 1.png"
            alt="Logo PT Central Saga Mandala"
            fill
            priority
            className="scale-[1.8] object-contain"
          />
        </div>
        <p className="text-sm font-semibold text-emerald-700">PT Central Saga Mandala</p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal">Buat password baru</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-500">
          Gunakan link reset terbaru dari email. Password minimal 8 karakter.
        </p>

        <div className="mt-8 grid gap-5">
          {message ? (
            <Notice tone="success">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {message}
            </Notice>
          ) : null}
          {error ? <Notice tone="error">{error}</Notice> : null}
          {!token ? (
            <Notice tone="warning">
              Link reset password tidak lengkap. Minta link reset baru dari halaman lupa password.
            </Notice>
          ) : null}

          <form className="grid gap-5" autoComplete="off" noValidate onSubmit={submitResetPassword}>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                autoComplete="off"
                inputMode="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Password baru</Label>
              <div className="relative">
                <Input
                  autoComplete="new-password"
                  className="pr-11"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <PasswordToggle
                  active={showPassword}
                  label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  onClick={() => setShowPassword((value) => !value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Konfirmasi password</Label>
              <div className="relative">
                <Input
                  autoComplete="new-password"
                  className="pr-11"
                  type={showPasswordConfirmation ? "text" : "password"}
                  value={passwordConfirmation}
                  onChange={(event) => setPasswordConfirmation(event.target.value)}
                />
                <PasswordToggle
                  active={showPasswordConfirmation}
                  label={showPasswordConfirmation ? "Sembunyikan konfirmasi password" : "Tampilkan konfirmasi password"}
                  onClick={() => setShowPasswordConfirmation((value) => !value)}
                />
              </div>
            </div>
            <Button type="button" className="w-full" disabled={loading} onClick={() => void resetPassword()}>
              {loading ? "Menyimpan..." : "Simpan password baru"}
            </Button>
          </form>

          <Link className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800" href="/login">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke login
          </Link>
        </div>
      </div>
    </main>
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
      className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md bg-white text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
      onClick={onClick}
    >
      {active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}

function Notice({ tone, children }: { tone: "success" | "error" | "warning"; children: React.ReactNode }) {
  const className = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-rose-200 bg-rose-50 text-rose-700",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
  }[tone];

  return (
    <div className={`flex items-center gap-2 rounded-md border px-4 py-3 text-sm ${className}`}>
      {children}
    </div>
  );
}

function getApiErrorMessage(caughtError: unknown, fallback: string) {
  if (!(caughtError instanceof ApiError)) return fallback;

  const data = caughtError.data as {
    message?: string;
    errors?: Record<string, string[]>;
  } | null;

  const firstFieldError = data?.errors ? Object.values(data.errors).flat()[0] : "";

  return firstFieldError || data?.message || fallback;
}
