"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

type MinimalUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: "USER" | "ADMIN";
};

type SessionResponse = {
  user: MinimalUser;
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
  const [currentUser, setCurrentUser] = useState<MinimalUser | null>(null);
  const [availableUsers, setAvailableUsers] = useState<MinimalUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const fetchUsers = async (signal?: AbortSignal) => {
    try {
      setUsersLoading(true);
      setUsersError(null);

      const response = await fetch("/api/users", {
        method: "GET",
        signal,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setUsersError(data?.error ?? "No se pudieron cargar los usuarios.");
        return;
      }

      const data = await response.json();
      setAvailableUsers(data.users as MinimalUser[]);
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      console.error("Users fetch error", error);
      setUsersError("No se pudieron cargar los usuarios.");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    async function loadSessionAndUsers() {
      try {
        const response = await fetch("/api/session", {
          method: "GET",
          signal: controller.signal,
        });

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        const data = (await response.json()) as SessionResponse;
        setCurrentUser(data.user);

        if (data.user.role === "ADMIN") {
          await fetchUsers(controller.signal);
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        console.error("Session fetch error", error);
        router.push("/login");
      }
    }

    void loadSessionAndUsers();

    return () => {
      controller.abort();
    };
  }, [router]);

  const assignableUsers = useMemo(() => {
    if (!currentUser) {
      return [];
    }
    return availableUsers.filter((user) => user.id !== currentUser.id);
  }, [availableUsers, currentUser]);

  function toggleSelectedMember(userId: string) {
    setSelectedMemberIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  }

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
    if (currentUser?.role === "ADMIN") {
      void fetchUsers();
    }
  }

  async function handleCreateGroup() {
    setCreateGroupStatus(null);

    const result = await postJson<{
      group: {
        name: string;
        joinCode: string;
        members: Array<{
          userId: string;
          user: { name: string | null; email: string | null } | null;
        }>;
      };
    }>("/api/groups", {
      ...groupForm,
      memberIds: selectedMemberIds,
    });

    if (!result.success) {
      setCreateGroupStatus(result.error);
      return;
    }

    const extraMembers =
      result.data.group.members.filter(
        (member) => member.userId !== currentUser?.id,
      ) ?? [];
    const memberSummary = extraMembers.length
      ? ` | Miembros añadidos: ${extraMembers
          .map(
            (member) =>
              member.user?.name ??
              member.user?.email ??
              member.userId.slice(0, 6),
          )
          .join(", ")}`
      : "";

    setCreateGroupStatus(
      `Grupo ${result.data.group.name} creado (código ${result.data.group.joinCode}).${memberSummary}`,
    );
    setGroupForm({
      name: "",
      description: "",
    });
    setSelectedMemberIds([]);
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

              {currentUser?.role === "ADMIN" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#e1e3f0]">
                    Asignar miembros (opcional)
                  </label>
                  <div className="space-y-2 rounded-xl border border-[#242433] bg-[#13131d] p-3">
                    {usersLoading ? (
                      <p className="text-sm text-[#8b8fa3]">
                        Cargando usuarios disponibles...
                      </p>
                    ) : usersError ? (
                      <p className="text-sm text-[#ff9393]">{usersError}</p>
                    ) : assignableUsers.length === 0 ? (
                      <p className="text-sm text-[#8b8fa3]">
                        No hay otros usuarios disponibles todavía.
                      </p>
                    ) : (
                      <div className="flex max-h-48 flex-col gap-2 overflow-y-auto pr-1">
                        {assignableUsers.map((user) => (
                          <label
                            key={user.id}
                            className="flex items-start gap-3 rounded-lg border border-transparent px-2 py-2 transition hover:border-[#2d2d36] hover:bg-[#181824]"
                          >
                            <input
                              type="checkbox"
                              checked={selectedMemberIds.includes(user.id)}
                              onChange={() => toggleSelectedMember(user.id)}
                              className="mt-1 h-4 w-4 rounded border-[#2d2d36] bg-[#0d0d15] text-[#6aaa64] focus:ring-[#6aaa64]/60"
                            />
                            <span className="flex flex-col">
                              <span className="text-sm text-[#f5f5f5]">
                                {user.name ?? user.email ?? "Usuario sin nombre"}
                              </span>
                              <span className="text-xs text-[#8b8fa3]">
                                {user.email ?? "Sin email"}
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-[#8b8fa3]">
                    Los miembros seleccionados se añadirán al grupo con rol
                    estándar.
                  </p>
                </div>
              ) : null}

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
