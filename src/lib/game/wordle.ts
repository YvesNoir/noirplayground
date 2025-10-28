export type LetterState = "correct" | "present" | "absent";

export type EvaluatedGuess = {
  guess: string;
  states: LetterState[];
};

/**
 * Evalúa un intento comparándolo con la palabra objetivo.
 * Devuelve una lista de estados por letra:
 * - correct: letra correcta en la posición correcta
 * - present: letra presente en otra posición
 * - absent: letra no presente en la palabra
 */
export function evaluateGuess(answer: string, guess: string): LetterState[] {
  const answerLower = answer.toLowerCase();
  const guessLower = guess.toLowerCase();
  const length = answerLower.length;

  if (guessLower.length !== length) {
    throw new Error(`El intento debe tener ${length} letras.`);
  }

  const result: LetterState[] = Array.from({ length }, () => "absent");
  const unusedLetterCount = new Map<string, number>();

  // Primera pasada: marcar coincidencias exactas y contar letras restantes.
  for (let i = 0; i < length; i += 1) {
    const answerLetter = answerLower[i];
    const guessLetter = guessLower[i];

    if (guessLetter === answerLetter) {
      result[i] = "correct";
    } else {
      const count = unusedLetterCount.get(answerLetter) ?? 0;
      unusedLetterCount.set(answerLetter, count + 1);
    }
  }

  // Segunda pasada: marcar coincidencias parciales.
  for (let i = 0; i < length; i += 1) {
    if (result[i] === "correct") continue;

    const guessLetter = guessLower[i];
    const available = unusedLetterCount.get(guessLetter) ?? 0;

    if (available > 0) {
      result[i] = "present";
      unusedLetterCount.set(guessLetter, available - 1);
    }
  }

  return result;
}
