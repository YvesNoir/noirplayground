"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ApiResponse<T> =
  | { success: false; error: string }
  | { success: true; data: T };

type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  role: "USER" | "ADMIN";
};

type CreateGroupPayload = {
  name: string;
  description?: string;
};

async function postJson<T>(url: string, body: unknown): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        error: data?.error ?? "Acción no realizada.",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error de conexión." };
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [userForm, setUserForm] = useState<CreateUserPayload>({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });
  const [groupForm, setGroupForm] = useState<CreateGroupPayload>({
    name: "",
    description: "",
  });
  const [createUserStatus, setCreateUserStatus] = useState<string | null>(null);
  const [createGroupStatus, setCreateGroupStatus] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const controller = new AbortController();

    async function verifySession() {
      const response = await fetch("/api/session", {
        method: "GET",
        signal: controller.signal,
      });

      if (response.status === 401) {
        router.push("/login");
      }
    }

    void verifySession();

    return () => {
      controller.abort();
    };
  }, [router]);

  async function handleCreateUser() {
    setCreateUserStatus(null);

    const result = await postJson<{ user: { email: string } }>(
      "/api/users",
      userForm,
    );

    if (!result.success) {
      setCreateUserStatus(result.error);
      return;
    }

    setCreateUserStatus(
      `Usuario ${result.data.user.email} creado correctamente.`,
    );
    setUserForm({
      name: "",
      email: "",
      password: "",
      role: "USER",
    });
  }

  async function handleCreateGroup() {
    setCreateGroupStatus(null);

    const result = await postJson<{ group: { name: string; joinCode: string } }>(
      "/api/groups",
      groupForm,
    );

    if (!result.success) {
      setCreateGroupStatus(result.error);
      return;
    }

    setCreateGroupStatus(
      `Grupo ${result.data.group.name} creado (código ${result.data.group.joinCode}).`,
    );
    setGroupForm({
      name: "",
      description: "",
    });
  }

  return (
    <div className="min-h-screen bg-[#06060a] px-4 py-16 text-[#f5f5f5]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex items-center justify-between rounded-3xl border border-[#1f1f29] bg-[#0d0d15] px-8 py-6 shadow-[0_30px_60px_-40px_rgba(0,0,0,0.85)]">
          <div className="flex items-center gap-4">
            <Image
              src="/logo-noir.svg"
              alt="Noir Playground logo"
              width={72}
              height={72}
              priority
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6aaa64]">
                Control Center
              </p>
              <h1 className="text-3xl font-bold tracking-tight">Panel</h1>
              <p className="text-sm text-[#8b8fa3]">
                Gestioná usuarios y grupos desde un panel rápido mientras
                construimos la plataforma completa.
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="rounded-full border border-[#2d2d36] px-4 py-2 text-sm font-medium transition hover:border-[#6aaa64] hover:text-[#9ce27a]"
          >
            Volver al inicio
          </Link>
        </header>

        <main className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-3xl border border-[#1f1f29] bg-[#0d0d15] p-8 shadow-[0_40px_70px_-50px_rgba(0,0,0,0.85)]">
            <header className="mb-6 space-y-1">
              <h2 className="text-xl font-semibold">Crear usuario</h2>
              <p className="text-sm text-[#8b8fa3]">
                Registra cuentas manualmente. Solo disponible para administradores.
              </p>
            </header>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#e1e3f0]">
                  Nombre completo
                </label>
                <input
                  value={userForm.name}
                  onChange={(event) =>
                    setUserForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Nombre Apellido"
                  className="w-full rounded-xl border border-[#242433] bg-[#13131d] px-4 py-3 text-sm text-[#f5f5f5] outline-none transition focus:border-[#6aaa64] focus:ring-2 focus:ring-[#6aaa64]/40"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#e1e3f0]">
                  Correo electrónico
                </label>
                <input
                  value={userForm.email}
                  onChange={(event) =>
                    setUserForm((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  className="w-full rounded-xl border border-[#242433] bg-[#13131d] px-4 py-3 text-sm text-[#f5f5f5] outline-none transition focus:border-[#6aaa64] focus:ring-2 focus:ring-[#6aaa64]/40"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#e1e3f0]">
                  Contraseña
                </label>
                <input
                  value={userForm.password}
                  onChange={(event) =>
                    setUserForm((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  type="password"
                  placeholder="Contraseña temporal"
                  minLength={8}
                  className="w-full rounded-xl border border-[#242433] bg-[#13131d] px-4 py-3 text-sm text-[#f5f5f5] outline-none transition focus:border-[#6aaa64] focus:ring-2 focus:ring-[#6aaa64]/40"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#e1e3f0]">
                  Rol
                </label>
                <select
                  value={userForm.role}
                  onChange={(event) =>
                    setUserForm((prev) => ({
                      ...prev,
                      role: event.target.value as "USER" | "ADMIN",
                    }))
                  }
                  className="w-full rounded-xl border border-[#242433] bg-[#13131d] px-4 py-3 text-sm text-[#f5f5f5] outline-none transition focus:border-[#6aaa64] focus:ring-2 focus:ring-[#6aaa64]/40"
                >
                  <option value="USER">Usuario</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              {createUserStatus ? (
                <p
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    createUserStatus.includes("creado")
                      ? "border-[#1f2f1f] bg-[#112216] text-[#9ce27a]"
                      : "border-[#3e1e1e] bg-[#1a0f12] text-[#ff9393]"
                  }`}
                >
                  {createUserStatus}
                </p>
              ) : null}

              <button
                onClick={handleCreateUser}
                className="w-full rounded-full bg-[#6aaa64] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-[0_6px_0_#3c6c3c] transition hover:-translate-y-[2px] hover:shadow-[0_8px_0_#3c6c3c]"
              >
                Crear cuenta
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-[#1f1f29] bg-[#0d0d15] p-8 shadow-[0_40px_70px_-50px_rgba(0,0,0,0.85)]">
            <header className="mb-6 space-y-1">
              <h2 className="text-xl font-semibold">Crear grupo</h2>
              <p className="text-sm text-[#8b8fa3]">
                Organizá ligas privadas y gestioná participantes rápidamente.
              </p>
            </header>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#e1e3f0]">
                  Nombre del grupo
                </label>
                <input
                  value={groupForm.name}
                  onChange={(event) =>
                    setGroupForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Ej. Wordle Masters"
                  className="w-full rounded-xl border border-[#242433] bg-[#13131d] px-4 py-3 text-sm text-[#f5f5f5] outline-none transition focus:border-[#6aaa64] focus:ring-2 focus:ring-[#6aaa64]/40"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#e1e3f0]">
                  Descripción
                </label>
                <textarea
                  value={groupForm.description}
                  onChange={(event) =>
                    setGroupForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Contá de qué se trata el grupo o cuáles son las reglas."
                  className="w-full rounded-xl border border-[#242433] bg-[#13131d] px-4 py-3 text-sm text-[#f5f5f5] outline-none transition focus:border-[#6aaa64] focus:ring-2 focus:ring-[#6aaa64]/40"
                />
              </div>

              {createGroupStatus ? (
                <p
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    createGroupStatus.includes("creado")
                      ? "border-[#1f2f1f] bg-[#112216] text-[#9ce27a]"
                      : "border-[#3e1e1e] bg-[#1a0f12] text-[#ff9393]"
                  }`}
                >
                  {createGroupStatus}
                </p>
              ) : null}

              <button
                onClick={handleCreateGroup}
                className="w-full rounded-full bg-[#6aaa64] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-[0_6px_0_#3c6c3c] transition hover:-translate-y-[2px] hover:shadow-[0_8px_0_#3c6c3c]"
              >
                Crear grupo
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
