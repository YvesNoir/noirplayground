"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.error ?? "No se pudo iniciar sesión.");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Error al conectar con el servidor.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#06060a] px-4 py-16 text-[#f5f5f5]">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-[#1f1f29] bg-[#0d0d15] p-10 shadow-[0_40px_80px_-45px_rgba(0,0,0,0.9)]">
        <div className="space-y-2 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg border border-[#2a2a35] bg-[#151523] text-lg font-semibold uppercase">
            N
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bienvenido de nuevo
          </h1>
          <p className="text-sm text-[#8b8fa3]">
            Iniciá sesión con tu correo para continuar jugando en Noir
            Playground.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-[#e1e3f0]"
              htmlFor="email"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-xl border border-[#242433] bg-[#13131d] px-4 py-3 text-sm text-[#f5f5f5] outline-none transition focus:border-[#6aaa64] focus:ring-2 focus:ring-[#6aaa64]/40"
              placeholder="nombre@ejemplo.com"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-medium text-[#e1e3f0]">
              <label htmlFor="password">Contraseña</label>
              <Link
                href="#"
                className="text-xs font-semibold uppercase tracking-wide text-[#9ce27a] hover:text-[#b7f29b]"
              >
                Recuperar
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-xl border border-[#242433] bg-[#13131d] px-4 py-3 text-sm text-[#f5f5f5] outline-none transition focus:border-[#6aaa64] focus:ring-2 focus:ring-[#6aaa64]/40"
              placeholder="Tu contraseña"
              minLength={8}
            />
          </div>

          {error ? (
            <p className="rounded-xl border border-[#3e1e1e] bg-[#1a0f12] px-4 py-3 text-sm text-[#ff9393]">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#6aaa64] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-[0_6px_0_#3c6c3c] transition hover:-translate-y-[2px] hover:shadow-[0_8px_0_#3c6c3c] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="text-center text-sm text-[#8b8fa3]">
          ¿No tenés cuenta aún?{" "}
          <Link
            href="#"
            className="font-semibold text-[#9ce27a] hover:text-[#b7f29b]"
          >
            Registrate
          </Link>
        </div>
      </div>
    </div>
  );
}
