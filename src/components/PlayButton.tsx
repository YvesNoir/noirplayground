"use client";

import Link from "next/link";

export function PlayButton() {
  return (
    <Link
      className="rounded-full bg-[#6aaa64] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-[0_6px_0_#4d8153] transition hover:-translate-y-[2px] hover:shadow-[0_8px_0_#4d8153]"
      href="/jugar-wordle"
    >
      Empezar partida
    </Link>
  );
}