"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { ApiError, api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function submitForgotPassword(event: FormEvent) {
    event.preventDefault();
    void sendResetLink();
  }

  async function sendResetLink() {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await api<{ message: string }>("/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      setMessage(response.message);
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Permintaan reset password gagal. Coba lagi sebentar."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFrame
      title="Reset password"
      subtitle="Masukkan email akun. Kami akan mengirim link untuk membuat password baru."
    >
      {message ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
      <form className="grid gap-5" onSubmit={submitForgotPassword} autoComplete="off" noValidate>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            required
            autoComplete="off"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <Button type="button" className="w-full" disabled={loading} onClick={() => void sendResetLink()}>
          {loading ? "Mengirim..." : "Kirim link reset"}
          <Mail className="h-4 w-4" />
        </Button>
      </form>
      <Link className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800" href="/login">
        <ArrowLeft className="h-4 w-4" />
        Kembali ke login
      </Link>
    </AuthFrame>
  );
}

function AuthFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
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
        <h1 className="mt-2 text-3xl font-bold tracking-normal">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-500">{subtitle}</p>
        <div className="mt-8 grid gap-5">{children}</div>
      </div>
    </main>
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
