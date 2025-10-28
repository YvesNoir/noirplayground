"use client";

import { useEffect, useMemo, useState } from "react";
import { evaluateGuess, LetterState } from "@/lib/game/wordle";

const MAX_ATTEMPTS = 6;

type GuessResult = {
  guess: string;
  states: LetterState[];
};

export default function JugarWordlePage() {
  const [targetWord, setTargetWord] = useState<string | null>(null);
  const [wordLength, setWordLength] = useState<number>(5);
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWord() {
      try {
        setLoading(true);
        const response = await fetch("/api/wordle/random");
        if (!response.ok) {
          const data = await response.json().catch(() => null);
          setFeedback(data?.error ?? "No se pudo obtener la palabra.");
          setStatus("lost");
          return;
        }
        const data = await response.json();
        setTargetWord(data.word);
        setWordLength(data.length ?? data.word.length);
        setGuesses([]);
        setCurrentGuess("");
        setStatus("playing");
        setFeedback(null);
      } catch (error) {
        console.error(error);
        setFeedback("Error al obtener la palabra.");
        setStatus("lost");
      } finally {
        setLoading(false);
      }
    }

    void fetchWord();
  }, []);

  const boardRows = useMemo(() => {
    const rows: Array<GuessResult | null> = Array.from(
      { length: MAX_ATTEMPTS },
      (_, index) => guesses[index] ?? null,
    );
    return rows;
  }, [guesses]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!targetWord || status !== "playing") return;

    const guess = currentGuess.trim().toLowerCase();

    if (guess.length !== wordLength) {
      setFeedback(`La palabra debe tener ${wordLength} letras.`);
      return;
    }

    try {
      const states = evaluateGuess(targetWord, guess);
      const newGuesses = [...guesses, { guess, states }];
      setGuesses(newGuesses);
      setCurrentGuess("");
      setFeedback(null);

      if (states.every((state) => state === "correct")) {
        setStatus("won");
        setFeedback("¡Felicidades! Adivinaste la palabra.");
      } else if (newGuesses.length >= MAX_ATTEMPTS) {
        setStatus("lost");
        setFeedback(`Se acabaron los intentos. La palabra era "${targetWord.toUpperCase()}".`);
      }
    } catch (error) {
      console.error(error);
      setFeedback("Ocurrió un error al evaluar el intento.");
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/wordle/random");
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setFeedback(data?.error ?? "No se pudo obtener una nueva palabra.");
        return;
      }
      const data = await response.json();
      setTargetWord(data.word);
      setWordLength(data.length ?? data.word.length);
      setGuesses([]);
      setCurrentGuess("");
      setStatus("playing");
      setFeedback(null);
    } catch (error) {
      console.error(error);
      setFeedback("Error al reiniciar el juego.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06060a] px-4 py-16 text-[#f5f5f5]">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <header className="flex flex-col gap-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Wordle Noir</h1>
          <p className="text-sm text-[#8b8fa3]">
            Adiviná la palabra oculta en {MAX_ATTEMPTS} intentos. Cada intento debe ser una
            palabra válida de {wordLength} letras.
          </p>
        </header>

        {feedback ? (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              status === "won"
                ? "border-[#1f2f1f] bg-[#112216] text-[#9ce27a]"
                : status === "lost"
                ? "border-[#3e1e1e] bg-[#1a0f12] text-[#ff9393]"
                : "border-[#243043] bg-[#111422] text-[#9aa6c9]"
            }`}
          >
            {feedback}
          </div>
        ) : null}

        <section className="grid gap-4">
          <div className="flex flex-col gap-2">
            {boardRows.map((row, rowIndex) => (
              <div key={`row-${rowIndex}`} className="flex justify-center gap-2">
                {Array.from({ length: wordLength }).map((_, letterIndex) => {
                  const letter = row?.guess[letterIndex] ?? "";
                  const state = row?.states[letterIndex];
                  const baseClasses =
                    "flex h-14 w-14 items-center justify-center rounded-lg border-2 text-2xl font-bold uppercase tracking-wide";
                  const stateClasses = !state
                    ? "border-[#2d2d36] bg-[#13131d] text-[#f5f5f5]"
                    : state === "correct"
                    ? "border-[#4d8153] bg-[#6aaa64] text-white"
                    : state === "present"
                    ? "border-[#a39345] bg-[#c9b458] text-white"
                    : "border-[#4f5254] bg-[#3c3f44] text-white";

                  return (
                    <div
                      key={`cell-${rowIndex}-${letterIndex}`}
                      className={`${baseClasses} ${stateClasses}`}
                    >
                      {letter.toUpperCase()}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <form className="mt-4 flex flex-col gap-3" onSubmit={handleSubmit}>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={currentGuess}
                onChange={(event) => setCurrentGuess(event.target.value)}
                maxLength={wordLength}
                disabled={status !== "playing" || loading}
                className="flex-1 rounded-full border border-[#2d2d36] bg-[#0d0d15] px-4 py-3 text-lg uppercase tracking-wide text-[#f5f5f5] outline-none transition focus:border-[#6aaa64] focus:ring-2 focus:ring-[#6aaa64]/40 disabled:cursor-not-allowed"
                placeholder={loading ? "Cargando palabra..." : "Escribí tu intento"}
                autoFocus
              />
              <button
                type="submit"
                disabled={status !== "playing" || loading}
                className="rounded-full bg-[#6aaa64] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-[0_6px_0_#3c6c3c] transition hover:-translate-y-[2px] hover:shadow-[0_8px_0_#3c6c3c] disabled:cursor-not-allowed"
              >
                Probar
              </button>
            </div>
          </form>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-full border border-[#2d2d36] px-6 py-2 text-sm font-medium uppercase tracking-wide transition hover:border-[#6aaa64] hover:text-[#9ce27a]"
            >
              Nueva palabra
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
