import { Header } from "@/components/Header";
import { PlayButton } from "@/components/PlayButton";

export default function Home() {
  const sampleBoard = [
    [
      { letter: "N", status: "correct" },
      { letter: "O", status: "present" },
      { letter: "I", status: "absent" },
      { letter: "R", status: "absent" },
      { letter: "E", status: "absent" },
    ],
    [
      { letter: "P", status: "absent" },
      { letter: "L", status: "correct" },
      { letter: "A", status: "present" },
      { letter: "Y", status: "absent" },
      { letter: "S", status: "absent" },
    ],
    [
      { letter: "G", status: "absent" },
      { letter: "A", status: "present" },
      { letter: "M", status: "present" },
      { letter: "E", status: "correct" },
      { letter: "S", status: "absent" },
    ],
    [
      { letter: "W", status: "correct" },
      { letter: "O", status: "correct" },
      { letter: "R", status: "correct" },
      { letter: "D", status: "correct" },
      { letter: "L", status: "correct" },
    ],
  ] as const;

  const statusClasses = {
    correct: "bg-[#6aaa64] text-white shadow-[0_4px_0_#2f5130]",
    present: "bg-[#c9b458] text-white shadow-[0_4px_0_#5b4b1f]",
    absent: "bg-[#3c3f44] text-white shadow-[0_4px_0_#1f2124]",
  } as const;

  const featureHighlights = [
    {
      title: "Un reto diario",
      description:
        "Cada día una nueva palabra maestra. Comparte resultados y mantiene tu racha viva.",
    },
    {
      title: "Compite con tu grupo",
      description:
        "Invita amigos, arma ligas privadas y seguí el scoreboard en tiempo real.",
    },
    {
      title: "Diseñado para mobile",
      description:
        "Juga en cualquier dispositivo con una experiencia fluida y accesible.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-[#f5f5f5]">
      <Header />

      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-12 md:px-8 md:py-16">
        <section className="grid gap-12 lg:grid-cols-2">
          <div className="flex flex-col justify-center gap-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6aaa64]">
              Daily Word Challenge
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-[#f5f5f5] sm:text-5xl">
              Adiviná la palabra del día y defendé tu racha con amigos.
            </h1>
            <p className="max-w-xl text-lg text-[#a0a3b1]">
              Noir Playground trae el clásico Wordle con ligas privadas,
              scoreboards competitivos y la posibilidad de compartir tus
              resultados al instante. Prepará tu mejor estrategia y empezá la
              partida diaria.
            </p>
            <div className="flex flex-wrap gap-3">
              <PlayButton />
              <button className="rounded-full border border-[#2a2a35] px-6 py-3 text-sm font-semibold uppercase tracking-wide transition hover:bg-[#2a2a35] hover:text-white">
                Crear grupo
              </button>
            </div>
            <div className="flex flex-wrap gap-6">
              <div className="rounded-lg border border-[#242433] bg-[#14141f] px-5 py-3 shadow-[0_14px_28px_-18px_rgba(0,0,0,0.65)]">
                <p className="text-3xl font-bold text-[#9ce27a]">134K</p>
                <p className="text-sm font-medium text-[#8b8fa3]">
                  Jugadores activos hoy
                </p>
              </div>
              <div className="rounded-lg border border-[#242433] bg-[#14141f] px-5 py-3 shadow-[0_14px_28px_-18px_rgba(0,0,0,0.65)]">
                <p className="text-3xl font-bold text-[#f5f5f5]">7</p>
                <p className="text-sm font-medium text-[#8b8fa3]">
                  Intentos para el récord global
                </p>
              </div>
            </div>
          </div>

          <div className="relative isolate flex items-center justify-center">
            <div className="absolute -inset-6 -z-10 rounded-3xl border border-[#262636] bg-gradient-to-br from-[#181824] via-[#13131d] to-[#0f0f16] shadow-[0_40px_70px_-35px_rgba(0,0,0,0.8)]" />
            <div className="flex flex-col gap-3 rounded-3xl border border-[#303042] bg-[#161622] p-8 shadow-[0_12px_0_#10101a]">
              <header className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold uppercase tracking-[0.2em]">
                    Wordle
                  </h2>
                  <span className="rounded-full bg-[#6aaa64]/10 px-2 py-1 text-xs font-semibold uppercase text-[#6aaa64]">
                    Demo
                  </span>
                </div>
                <div className="flex gap-1 text-xs font-semibold uppercase text-[#989bad]">
                  <span>🔊</span>
                  <span>?</span>
                  <span>⚙️</span>
                </div>
              </header>
              <div className="space-y-3">
                {sampleBoard.map((row, rowIndex) => (
                  <div key={`row-${rowIndex}`} className="flex gap-2">
                    {row.map((cell, cellIndex) => (
                      <div
                        key={`cell-${rowIndex}-${cellIndex}`}
                        className={`grid h-14 w-14 place-items-center rounded-md border-2 border-[#1f1f29] text-2xl font-bold uppercase tracking-wide transition ${statusClasses[cell.status]}`}
                      >
                        {cell.letter}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <footer className="mt-4 grid grid-cols-3 gap-3 text-center text-sm font-semibold uppercase text-[#8b8fa3]">
                <div className="rounded-md border border-[#303042] bg-[#0f0f18] py-2">
                  Racha
                  <p className="text-2xl font-bold text-[#f5f5f5]">12</p>
                </div>
                <div className="rounded-md border border-[#303042] bg-[#0f0f18] py-2">
                  Victorias
                  <p className="text-2xl font-bold text-[#f5f5f5]">98%</p>
                </div>
                <div className="rounded-md border border-[#303042] bg-[#0f0f18] py-2">
                  Mejor
                  <p className="text-2xl font-bold text-[#f5f5f5]">2</p>
                </div>
              </footer>
            </div>
          </div>
        </section>

        <section
          id="como-jugar"
          className="grid gap-10 rounded-3xl border border-[#1f1f29] bg-[#13131d] p-8 shadow-[0_28px_60px_-40px_rgba(0,0,0,0.85)] lg:grid-cols-[1.2fr_1fr]"
        >
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#f5f5f5]">
              Cómo se juega
            </h2>
            <p className="text-lg text-[#a0a3b1]">
              Adiviná la palabra de cinco letras en seis intentos. Cada intento
              revela qué letras están en el lugar correcto, cuáles pertenecen a
              la palabra pero en otra posición y cuáles no aparecen.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {featureHighlights.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-[#242433] bg-[#161622] p-5 shadow-[0_16px_32px_-28px_rgba(0,0,0,0.8)]"
                >
                  <h3 className="text-lg font-semibold text-[#f5f5f5]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#a0a3b1]">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-dashed border-[#2b2b3a] bg-[#181824] p-6 text-sm text-[#a0a3b1]">
              Consejo: Compartí tus resultados con el clásico tablero de emojis
              y desbloqueá logros exclusivos en tu grupo privado.
            </div>
          </div>
          <aside
            id="scoreboard"
            className="flex flex-col gap-4 rounded-2xl border border-[#242433] bg-[#161622] p-6 shadow-[0_24px_45px_-35px_rgba(0,0,0,0.75)]"
          >
            <h3 className="text-xl font-semibold text-[#f5f5f5]">
              Scoreboard del día
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { name: "Luna", streak: 21, best: "3 intentos" },
                { name: "Mateo", streak: 18, best: "2 intentos" },
                { name: "Sofi", streak: 15, best: "3 intentos" },
                { name: "Tomás", streak: 12, best: "4 intentos" },
              ].map((player, index) => (
                <li
                  key={player.name}
                  className="flex items-center justify-between rounded-xl border border-[#2d2d3f] bg-[#0f0f18] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[#6aaa64]/20 text-xs font-semibold uppercase text-[#9ce27a]">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#f5f5f5]">
                        {player.name}
                      </p>
                      <p className="text-xs text-[#8b8fa3]">
                        Racha: {player.streak}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs font-medium uppercase text-[#9ce27a]">
                    {player.best}
                  </p>
                </li>
              ))}
            </ul>
            <button className="mt-2 rounded-full border border-[#2a2a35] px-4 py-2 text-xs font-semibold uppercase tracking-wide transition hover:bg-[#2a2a35] hover:text-white">
              Ver ranking completo
            </button>
          </aside>
        </section>

        <section
          id="palabras"
          className="rounded-3xl border border-[#1f1f29] bg-[#161622] p-8 shadow-[0_32px_60px_-38px_rgba(0,0,0,0.85)]"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl space-y-3">
              <h2 className="text-2xl font-semibold text-[#f5f5f5]">
                Un diccionario curado y adaptable
              </h2>
              <p className="text-base text-[#a0a3b1]">
                Mantenemos listas de palabras dinámicas y moderadas para asegurar
                partidas equilibradas. Agregaremos soporte multilenguaje y
                desafíos temáticos muy pronto.
              </p>
            </div>
            <div className="rounded-2xl border border-dashed border-[#2b2b3a] bg-[#11111b] px-6 py-4 text-sm font-medium text-[#a0a3b1]">
              Próximamente: modo cooperativo y eventos especiales de fin de
              semana.
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {["Clásico", "Experto", "Temático", "Speedrun"].map((mode) => (
              <div
                key={mode}
                className="flex flex-col gap-4 rounded-xl border border-[#242433] bg-[#0f0f18] p-5 shadow-[0_24px_40px_-32px_rgba(0,0,0,0.85)]"
              >
                <h3 className="text-lg font-semibold text-[#f5f5f5]">
                  {mode}
                </h3>
                <p className="text-sm text-[#a0a3b1]">
                  Vení a descubrir cómo adaptar Wordle a distintos estilos de
                  juego con listas especializadas.
                </p>
                <button className="self-start rounded-full border border-[#2a2a35] px-4 py-2 text-xs font-semibold uppercase tracking-wide transition hover:bg-[#2a2a35] hover:text-white">
                  Saber más
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-16 border-t border-[#1f1f29] bg-[#12121c]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-[#8b8fa3] md:flex-row md:px-8">
          <p>© {new Date().getFullYear()} Noir Playground. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a className="transition hover:text-[#9ce27a]" href="#">
              Privacidad
            </a>
            <a className="transition hover:text-[#9ce27a]" href="#">
              Términos
            </a>
            <a className="transition hover:text-[#9ce27a]" href="#">
              Contacto
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
