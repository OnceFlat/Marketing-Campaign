"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getSession() ? "/dashboard" : "/login");
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white px-5 text-center text-sm text-zinc-500">
      <p>Mengarahkan ke halaman yang sesuai...</p>
      <div className="flex items-center gap-4">
        <Link className="font-medium text-emerald-700 hover:text-emerald-800" href="/login">
          Login
        </Link>
        <Link className="font-medium text-emerald-700 hover:text-emerald-800" href="/dashboard">
          Dasbor
        </Link>
      </div>
    </main>
  );
}
