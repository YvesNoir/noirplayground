"use client";

import { useEffect, useMemo, useState } from "react";
import { evaluateGuess, LetterState } from "@/lib/game/wordle";

const MAX_ATTEMPTS = 6;

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

type GuessResult = {
  guess: string;
  states: LetterState[];
};

type KeyboardState = Record<string, LetterState>;

export default function JugarWordlePage() {
  const [targetWord, setTargetWord] = useState<string | null>(null);
  const [wordLength, setWordLength] = useState<number>(5);
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [attemptIndex, setAttemptIndex] = useState(0);
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
        setCurrentGuess(Array(data.length ?? data.word.length).fill(""));
        setAttemptIndex(0);
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

  useEffect(() => {
    if (!targetWord || status !== "playing") return;

    const onKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      const key = event.key;
      handleKeyInput(key);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetWord, currentGuess, status, attemptIndex, wordLength]);

  const boardRows = useMemo(() => {
    const rows: Array<GuessResult | null> = Array.from(
      { length: MAX_ATTEMPTS },
      (_, index) => guesses[index] ?? null,
    );
    return rows;
  }, [guesses]);

  const keyboardState: KeyboardState = useMemo(() => {
    const state: KeyboardState = {};
    for (const { guess, states } of guesses) {
      guess.split("").forEach((letter, index) => {
        const upper = letter.toUpperCase();
        const currentState = state[upper];
        const newState = states[index];

        if (!currentState) {
          state[upper] = newState;
          return;
        }

        const priority: Record<LetterState, number> = {
          correct: 3,
          present: 2,
          absent: 1,
        };

        if (priority[newState] > priority[currentState]) {
          state[upper] = newState;
        }
      });
    }
    return state;
  }, [guesses]);

  function handleKeyInput(rawKey: string) {
    if (!targetWord || status !== "playing" || loading) return;

    const key = rawKey.toUpperCase();

    if (key === "RUNCOMMAND" || key === "PROCESS" || key === "META") {
      return;
    }

    if (key === "BACKSPACE" || key === "⌫") {
      const updated = [...currentGuess];
      for (let i = wordLength - 1; i >= 0; i -= 1) {
        if (updated[i]) {
          updated[i] = "";
          break;
        }
      }
      setCurrentGuess(updated);
      setFeedback(null);
      return;
    }

    if (key === "ENTER") {
      const guessWord = currentGuess.join("").toLowerCase();
      if (guessWord.length !== wordLength || currentGuess.includes("")) {
        setFeedback(`La palabra debe tener ${wordLength} letras.`);
        return;
      }

      try {
        const states = evaluateGuess(targetWord, guessWord);
        const newGuesses = [...guesses];
        newGuesses[attemptIndex] = { guess: guessWord, states };
        setGuesses(newGuesses);
        setAttemptIndex(attemptIndex + 1);
        setCurrentGuess(Array(wordLength).fill(""));
        setFeedback(null);

        if (states.every((state) => state === "correct")) {
          setStatus("won");
          setFeedback("¡Felicidades! Adivinaste la palabra.");
        } else if (attemptIndex + 1 >= MAX_ATTEMPTS) {
          setStatus("lost");
          setFeedback(`Se acabaron los intentos. La palabra era "${targetWord.toUpperCase()}".`);
        }
      } catch (error) {
        console.error(error);
        setFeedback("Ocurrió un error al evaluar el intento.");
      }
      return;
    }

    if (!/^[A-ZÑ]$/i.test(key)) {
      return;
    }

    const letterState = keyboardState[key];
    if (letterState === "absent") {
      return;
    }

    const updated = [...currentGuess];
    const nextIndex = updated.findIndex((letter) => letter === "");

    if (nextIndex === -1) {
      setFeedback(`La palabra ya tiene ${wordLength} letras`);
      return;
    }

    updated[nextIndex] = key;
    setCurrentGuess(updated);
    setFeedback(null);
  }

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
      setCurrentGuess(Array(data.length ?? data.word.length).fill(""));
      setAttemptIndex(0);
      setStatus("playing");
      setFeedback(null);
    } catch (error) {
      console.error(error);
      setFeedback("Error al reiniciar el juego.");
    } finally {
      setLoading(false);
    }
  };

  const renderCell = (
    value: string,
    state: LetterState | undefined,
    isActive: boolean,
    index: number,
  ) => {
    const baseClasses =
      "flex h-14 w-14 items-center justify-center rounded-lg border-2 text-2xl font-bold uppercase tracking-wide transition";
    let stateClasses = "border-[#2d2d36] bg-[#13131d] text-[#f5f5f5]";

    switch (state) {
      case "correct":
        stateClasses = "border-[#4d8153] bg-[#6aaa64] text-white";
        break;
      case "present":
        stateClasses = "border-[#a39345] bg-[#c9b458] text-white";
        break;
      case "absent":
        stateClasses = "border-[#4f5254] bg-[#3c3f44] text-white";
        break;
      default:
        stateClasses = isActive
          ? "border-[#6aaa64] bg-[#13131d] text-[#f5f5f5]"
          : "border-[#2d2d36] bg-[#13131d] text-[#f5f5f5]";
        break;
    }

    return (
      <div key={index} className={`${baseClasses} ${stateClasses}`}>
        {value.toUpperCase()}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#06060a] px-4 py-16 text-[#f5f5f5]">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <header className="flex flex-col gap-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Wordle Noir</h1>
          <p className="text-sm text-[#8b8fa3]">
            Adiviná la palabra oculta en {MAX_ATTEMPTS} intentos. Escribí directamente en el tablero y
            presioná ENTER para enviar cada intento.
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

        <section className="grid gap-6">
          <div className="flex flex-col gap-2">
            {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIdx) => {
              const result = boardRows[rowIdx];
              const isCurrent = rowIdx === attemptIndex;
              return (
                <div
                  key={`row-${rowIdx}`}
                  className="flex justify-center gap-2"
                >
                  {Array.from({ length: wordLength }).map((__, colIdx) => {
                    const value =
                      result?.guess[colIdx] ?? (isCurrent ? currentGuess[colIdx] ?? "" : "");
                    const state = result?.states[colIdx];
                    const nextEmptyIndex = currentGuess.findIndex((letter) => letter === "");
                    const isActive = isCurrent && colIdx === (nextEmptyIndex === -1 ? wordLength - 1 : nextEmptyIndex);
                    return renderCell(value, state, isActive, colIdx);
                  })}
                </div>
              );
            })}
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-full border border-[#2d2d36] px-6 py-2 text-sm font-medium uppercase tracking-wide transition hover:border-[#6aaa64] hover:text-[#9ce27a]"
            >
              Nueva palabra
            </button>
          </div>

          <div className="flex flex-col items-center gap-2">
            {KEYBOARD_ROWS.map((row) => (
              <div key={row.join("-")} className="flex gap-2">
                {row.map((key) => {
                  if (key === "ENTER") {
                    return (
                      <button
                        key={key}
                        onClick={() => handleKeyInput("Enter")}
                        className="rounded-lg bg-[#6aaa64] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-[0_4px_0_#3c6c3c] transition hover:-translate-y-[1px] hover:shadow-[0_6px_0_#3c6c3c]"
                      >
                        Enter
                      </button>
                    );
                  }

                  if (key === "⌫") {
                    return (
                      <button
                        key={key}
                        onClick={() => handleKeyInput("Backspace")}
                        className="rounded-lg bg-[#2d2d36] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-[#f5f5f5] shadow-[0_4px_0_#13131d] transition hover:-translate-y-[1px] hover:shadow-[0_6px_0_#13131d]"
                      >
                        ⌫
                      </button>
                    );
                  }

                  const letterState = keyboardState[key];
                  let keyClasses = "rounded-lg px-4 py-2 text-sm font-semibold uppercase tracking-wide transition";
                  const disabled = letterState === "absent";
                  switch (letterState) {
                    case "correct":
                      keyClasses += " bg-[#6aaa64] text-white shadow-[0_4px_0_#3c6c3c]";
                      break;
                    case "present":
                      keyClasses += " bg-[#c9b458] text-white shadow-[0_4px_0_#a39345]";
                      break;
                    case "absent":
                      keyClasses += " bg-[#3c3f44] text-white shadow-[0_4px_0_#1f2124]";
                      break;
                    default:
                      keyClasses += " bg-[#2d2d36] text-[#f5f5f5] shadow-[0_4px_0_#13131d] hover:-translate-y-[1px] hover:shadow-[0_6px_0_#13131d]";
                      break;
                  }

                  return (
                    <button
                      key={key}
                      onClick={() => handleKeyInput(key)}
                      className={`${keyClasses} ${disabled ? "opacity-40 cursor-not-allowed hover:translate-y-0 hover:shadow-[0_4px_0_#13131d]" : ""}`}
                      disabled={disabled}
                    >
                      {key}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
