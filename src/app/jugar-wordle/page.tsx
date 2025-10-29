"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { evaluateGuess, LetterState } from "@/lib/game/wordle";

const MAX_ATTEMPTS = 6;
const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

type GuessResult = {
  guess: string;
  states: LetterState[];
};

type KeyboardState = Record<string, LetterState>;

type DailyResult = {
  attempts: number;
  seconds: number;
  solved: boolean;
  createdAt: string;
};

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function JugarWordlePage() {
  const [targetWord, setTargetWord] = useState<string | null>(null);
  const [wordLength, setWordLength] = useState<number>(5);
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string[]>(Array(5).fill(""));
  const [attemptIndex, setAttemptIndex] = useState(0);
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [dailyResult, setDailyResult] = useState<DailyResult | null>(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const resultSubmittedRef = useRef(false);
  const todayRef = useRef<string>(getTodayKey());

  useEffect(() => {
    async function fetchDailyWord() {
      try {
        setLoading(true);
        setFeedback(null);
        resultSubmittedRef.current = false;

        const response = await fetch("/api/wordle/daily");
        if (!response.ok) {
          const data = await response.json().catch(() => null);
          setFeedback(data?.error ?? "No se pudo obtener la palabra.");
          setStatus("lost");
          setLoading(false);
          return;
        }

        const data = await response.json();

        todayRef.current = getTodayKey();
        setWordLength(data.length);
        setGuesses([]);
        setAttemptIndex(0);
        setSecondsElapsed(0);
        setDailyResult(null);
        setAlreadyPlayed(Boolean(data.alreadyPlayed));

        if (data.alreadyPlayed && data.result) {
          const result: DailyResult = {
            attempts: data.result.attempts,
            seconds: data.result.seconds,
            solved: data.result.solved,
            createdAt: data.result.createdAt,
          };
          setDailyResult(result);
          setStatus(result.solved ? "won" : "lost");
          setFeedback(
            result.solved
              ? `Ya jugaste hoy y acertaste en ${result.attempts} intentos con un tiempo de ${formatTime(
                  result.seconds,
                )}.`
              : `Ya jugaste hoy. No acertaste la palabra. Tiempo: ${formatTime(result.seconds)}.`,
          );
          setTargetWord(null);
          setCurrentGuess(Array(data.length).fill(""));
          resultSubmittedRef.current = true;
        } else {
          setTargetWord(data.word);
          setCurrentGuess(Array(data.length).fill(""));
          setStatus("playing");
          setFeedback(null);
        }
      } catch (error) {
        console.error(error);
        setFeedback("Error al obtener la palabra.");
        setStatus("lost");
      } finally {
        setLoading(false);
      }
    }

    void fetchDailyWord();
  }, []);

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

  const handleKeyInput = useCallback(
    (rawKey: string) => {
      if (!targetWord || status !== "playing" || loading || alreadyPlayed) {
        return;
      }

      const key = rawKey.toUpperCase();

      if (key === "BACKSPACE" || key === "⌫") {
        const updated = [...currentGuess];
        for (let i = updated.length - 1; i >= 0; i -= 1) {
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
          const nextAttempt = attemptIndex + 1;

          setGuesses(newGuesses);
          setAttemptIndex(nextAttempt);
          setCurrentGuess(Array(wordLength).fill(""));
          setFeedback(null);

          if (states.every((state) => state === "correct")) {
            setStatus("won");
            setFeedback("¡Felicidades! Adivinaste la palabra.");
          } else if (nextAttempt >= MAX_ATTEMPTS) {
            setStatus("lost");
            setFeedback(
              `Se acabaron los intentos. La palabra era "${targetWord.toUpperCase()}".`,
            );
          }
        } catch (error) {
          console.error(error);
          setFeedback("Ocurrió un error al evaluar el intento.");
        }
        return;
      }

      if (!/^[A-ZÑ]$/.test(key)) {
        return;
      }

      const letterState = keyboardState[key];
      if (letterState === "absent") {
        return;
      }

      const nextIndex = currentGuess.findIndex((letter) => letter === "");
      if (nextIndex === -1) {
        return;
      }

      const updated = [...currentGuess];
      updated[nextIndex] = key;
      setCurrentGuess(updated);
      setFeedback(null);
    },
    [alreadyPlayed, attemptIndex, currentGuess, guesses, keyboardState, loading, status, targetWord, wordLength],
  );

  useEffect(() => {
    if (!targetWord || status !== "playing" || alreadyPlayed) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      if (/^[a-zñA-ZÑ]$/.test(key) || key === "Backspace" || key === "Enter") {
        event.preventDefault();
        handleKeyInput(key);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [alreadyPlayed, handleKeyInput, status, targetWord]);

  useEffect(() => {
    if (status === "playing" && !alreadyPlayed) {
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setSecondsElapsed((prev) => prev + 1);
        }, 1000);
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [status, alreadyPlayed]);

  useEffect(() => {
    if (alreadyPlayed || status === "playing" || !targetWord) {
      return;
    }

    if (resultSubmittedRef.current) {
      return;
    }

    resultSubmittedRef.current = true;
    const attemptsUsed = Math.min(attemptIndex, MAX_ATTEMPTS);
    const payload = {
      attempts: attemptsUsed,
      seconds: secondsElapsed,
      solved: status === "won",
    };

    fetch("/api/wordle/result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          console.error(data?.error ?? "Error al guardar el resultado.");
          return;
        }
        const data = await res.json();
        setDailyResult(data.result ?? payload);
        setAlreadyPlayed(true);
      })
      .catch((error) => {
        console.error("Error al registrar el resultado", error);
      });
  }, [alreadyPlayed, attemptIndex, secondsElapsed, status, targetWord]);

  const boardRows = useMemo(() => {
    const rows: Array<GuessResult | null> = Array.from(
      { length: MAX_ATTEMPTS },
      (_, index) => guesses[index] ?? null,
    );
    return rows;
  }, [guesses]);

  const attemptsUsed = Math.min(attemptIndex, MAX_ATTEMPTS);

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
            Solo una partida por día. Escribí en el tablero y presioná Enter para registrar tu
            intento.
          </p>
          <p className="text-xs text-[#6c7086]">{todayRef.current}</p>
        </header>

        <div className="text-center text-sm text-[#8b8fa3]">
          {status === "playing" && !alreadyPlayed
            ? `Tiempo: ${formatTime(secondsElapsed)} · Intento ${attemptIndex + 1}/${MAX_ATTEMPTS}`
            : dailyResult
            ? `Resultado del día · Intentos: ${dailyResult.attempts}/${MAX_ATTEMPTS} · Tiempo: ${formatTime(
                dailyResult.seconds,
              )}`
            : `Tiempo final: ${formatTime(secondsElapsed)} · Intentos: ${attemptsUsed}/${MAX_ATTEMPTS}`}
        </div>

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
              const isCurrent = rowIdx === attemptIndex && status === "playing";
              return (
                <div key={`row-${rowIdx}`} className="flex justify-center gap-2">
                  {Array.from({ length: wordLength }).map((__, colIdx) => {
                    const value =
                      result?.guess[colIdx] ?? (isCurrent ? currentGuess[colIdx] ?? "" : "");
                    const state = result?.states[colIdx];
                    const nextEmptyIndex = currentGuess.findIndex((letter) => letter === "");
                    const activeIndex =
                      nextEmptyIndex === -1 ? wordLength - 1 : nextEmptyIndex;
                    const isActive = isCurrent && colIdx === activeIndex;
                    return renderCell(value, state, isActive, colIdx);
                  })}
                </div>
              );
            })}
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
                        disabled={status !== "playing" || alreadyPlayed || loading}
                        className="rounded-lg bg-[#6aaa64] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-[0_4px_0_#3c6c3c] transition hover:-translate-y-[1px] hover:shadow-[0_6px_0_#3c6c3c] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_0_#3c6c3c]"
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
                        disabled={status !== "playing" || alreadyPlayed || loading}
                        className="rounded-lg bg-[#2d2d36] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-[#f5f5f5] shadow-[0_4px_0_#13131d] transition hover:-translate-y-[1px] hover:shadow-[0_6px_0_#13131d] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_0_#13131d]"
                      >
                        ⌫
                      </button>
                    );
                  }

                  const letterState = keyboardState[key];
                  const disabled = letterState === "absent" || status !== "playing" || alreadyPlayed || loading;
                  let keyClasses = "rounded-lg px-4 py-2 text-sm font-semibold uppercase tracking-wide transition";
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

                  if (disabled) {
                    keyClasses += " opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-[0_4px_0_#13131d]";
                  }

                  return (
                    <button
                      key={key}
                      onClick={() => handleKeyInput(key)}
                      disabled={disabled}
                      className={keyClasses}
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
