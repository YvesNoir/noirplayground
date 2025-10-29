"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/lib/hooks/useSession";

export function Header() {
  const { session, loading } = useSession();

  return (
    <header className="border-b border-[#1f1f29] bg-[#12121c]/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
        <div className="flex items-center">
          <Link href="/">
            <Image
              src="/logo-noir.svg"
              alt="Noir Playground logo"
              width={160}
              height={64}
              priority
            />
          </Link>
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <a className="transition hover:text-[#9ce27a]" href="#como-jugar">
            Cómo jugar
          </a>
          <a className="transition hover:text-[#9ce27a]" href="#scoreboard">
            Scoreboard
          </a>
          <a className="transition hover:text-[#9ce27a]" href="#palabras">
            Lista de palabras
          </a>
        </nav>
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-8 w-16 animate-pulse rounded bg-[#2d2d36]" />
          ) : session ? (
            <>
              {session.user.role === "ADMIN" && (
                <Link
                  className="rounded-full bg-[#6aaa64] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-[0_4px_0_#3c6c3c] transition hover:-translate-y-[2px] hover:shadow-[0_6px_0_#3c6c3c]"
                  href="/dashboard"
                >
                  Panel
                </Link>
              )}
              <span className="text-sm text-[#8b8fa3]">
                Hola, {session.user.name || session.user.email}
              </span>
            </>
          ) : (
            <Link
              className="rounded-full border border-[#2d2d36] px-4 py-2 text-sm font-medium transition hover:border-[#6aaa64] hover:text-[#9ce27a]"
              href="/login"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}